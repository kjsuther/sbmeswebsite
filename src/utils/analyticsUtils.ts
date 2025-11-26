import { supabase } from '../lib/supabase';

export interface ContentGap {
  question: string;
  count: number;
  lastAsked: string;
  negativeFeedbackCount: number;
  avgSourceCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface DocumentPerformance {
  documentId: string;
  documentName: string;
  totalCitations: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  avgFeedbackRatio: number;
  lastCited: string;
  chunkCount: number;
  utilizationRate: number;
  healthScore: number;
}

export interface ChunkUtilization {
  chunkId: string;
  content: string;
  documentName: string;
  citationCount: number;
  lastCited: string;
}

export interface TopicCoverage {
  topic: string;
  questionCount: number;
  hasDocumentation: boolean;
  coverageScore: number;
}

export const analyzeContentGaps = async (): Promise<{
  unansweredQuestions: ContentGap[];
  lowSourceResponses: ContentGap[];
  topicCoverage: TopicCoverage[];
  missingDocSuggestions: string[];
}> => {
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, role, sources, feedback_rating, created_at, conversation_id')
    .order('created_at', { ascending: false });

  if (!messages) {
    return {
      unansweredQuestions: [],
      lowSourceResponses: [],
      topicCoverage: [],
      missingDocSuggestions: [],
    };
  }

  const userQuestions = messages.filter(m => m.role === 'user');
  const assistantResponses = messages.filter(m => m.role === 'assistant');

  const questionMap: Record<string, {
    question: string;
    count: number;
    lastAsked: string;
    negativeFeedback: number;
    sourceCounts: number[];
    conversationIds: string[];
  }> = {};

  for (const question of userQuestions) {
    const normalized = question.content.toLowerCase().trim();

    if (!questionMap[normalized]) {
      questionMap[normalized] = {
        question: question.content,
        count: 0,
        lastAsked: question.created_at,
        negativeFeedback: 0,
        sourceCounts: [],
        conversationIds: [],
      };
    }

    questionMap[normalized].count++;
    questionMap[normalized].conversationIds.push(question.conversation_id);

    if (new Date(question.created_at) > new Date(questionMap[normalized].lastAsked)) {
      questionMap[normalized].lastAsked = question.created_at;
    }

    const assistantResponse = assistantResponses.find(
      r => r.conversation_id === question.conversation_id &&
      new Date(r.created_at) > new Date(question.created_at)
    );

    if (assistantResponse) {
      let sources = [];
      try {
        sources = Array.isArray(assistantResponse.sources)
          ? assistantResponse.sources
          : JSON.parse(assistantResponse.sources || '[]');
      } catch (e) {
        sources = [];
      }

      questionMap[normalized].sourceCounts.push(sources.length);

      if (assistantResponse.feedback_rating === 'negative') {
        questionMap[normalized].negativeFeedback++;
      }
    }
  }

  const unansweredQuestions: ContentGap[] = Object.values(questionMap)
    .filter(q => {
      const avgSources = q.sourceCounts.length > 0
        ? q.sourceCounts.reduce((a, b) => a + b, 0) / q.sourceCounts.length
        : 0;
      return avgSources < 2 || q.negativeFeedback > 0;
    })
    .map(q => {
      const avgSources = q.sourceCounts.length > 0
        ? q.sourceCounts.reduce((a, b) => a + b, 0) / q.sourceCounts.length
        : 0;

      let priority: 'high' | 'medium' | 'low' = 'low';
      if (q.count >= 5 && avgSources < 1) priority = 'high';
      else if (q.count >= 3 || q.negativeFeedback >= 2) priority = 'medium';

      return {
        question: q.question,
        count: q.count,
        lastAsked: q.lastAsked,
        negativeFeedbackCount: q.negativeFeedback,
        avgSourceCount: avgSources,
        priority,
      };
    })
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.count - a.count;
    })
    .slice(0, 15);

  const lowSourceResponses: ContentGap[] = Object.values(questionMap)
    .filter(q => {
      const avgSources = q.sourceCounts.length > 0
        ? q.sourceCounts.reduce((a, b) => a + b, 0) / q.sourceCounts.length
        : 0;
      return avgSources > 0 && avgSources < 2 && q.count >= 2;
    })
    .map(q => ({
      question: q.question,
      count: q.count,
      lastAsked: q.lastAsked,
      negativeFeedbackCount: q.negativeFeedback,
      avgSourceCount: q.sourceCounts.reduce((a, b) => a + b, 0) / q.sourceCounts.length,
      priority: q.count >= 5 ? 'high' : q.count >= 3 ? 'medium' : 'low',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topicKeywords = extractTopics(userQuestions.map(q => q.content));
  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('content, document_name');

  const topicCoverage: TopicCoverage[] = topicKeywords.map(topic => {
    const hasDocumentation = chunks?.some(chunk =>
      chunk.content.toLowerCase().includes(topic.toLowerCase())
    ) || false;

    const questionCount = userQuestions.filter(q =>
      q.content.toLowerCase().includes(topic.toLowerCase())
    ).length;

    return {
      topic,
      questionCount,
      hasDocumentation,
      coverageScore: hasDocumentation ? 100 : 0,
    };
  }).sort((a, b) => b.questionCount - a.questionCount);

  const missingDocSuggestions = topicCoverage
    .filter(t => !t.hasDocumentation && t.questionCount >= 3)
    .map(t => `Add documentation about "${t.topic}"`)
    .slice(0, 5);

  return {
    unansweredQuestions,
    lowSourceResponses,
    topicCoverage: topicCoverage.slice(0, 10),
    missingDocSuggestions,
  };
};

export const analyzeKnowledgeBaseEffectiveness = async (): Promise<{
  documentPerformance: DocumentPerformance[];
  chunkUtilization: ChunkUtilization[];
  citationStats: {
    totalResponses: number;
    responsesWithCitations: number;
    avgCitationsPerResponse: number;
    citationRate: number;
  };
  unusedDocuments: string[];
}> => {
  const { data: messages } = await supabase
    .from('messages')
    .select('sources, feedback_rating, created_at')
    .eq('role', 'assistant')
    .order('created_at', { ascending: false });

  const { data: documents } = await supabase
    .from('uploaded_documents')
    .select('id, filename, chunk_count, created_at');

  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('id, content, document_name, uploaded_document_id');

  if (!messages || !documents || !chunks) {
    return {
      documentPerformance: [],
      chunkUtilization: [],
      citationStats: {
        totalResponses: 0,
        responsesWithCitations: 0,
        avgCitationsPerResponse: 0,
        citationRate: 0,
      },
      unusedDocuments: [],
    };
  }

  const documentCitations: Record<string, {
    documentId: string;
    documentName: string;
    citations: number;
    positiveFeedback: number;
    negativeFeedback: number;
    lastCited: string;
    chunkCount: number;
  }> = {};

  const chunkCitations: Record<string, {
    chunkId: string;
    content: string;
    documentName: string;
    count: number;
    lastCited: string;
  }> = {};

  let totalCitations = 0;
  let responsesWithCitations = 0;

  for (const message of messages) {
    let sources = [];
    try {
      sources = Array.isArray(message.sources)
        ? message.sources
        : JSON.parse(message.sources || '[]');
    } catch (e) {
      sources = [];
    }

    if (sources.length > 0) {
      responsesWithCitations++;
      totalCitations += sources.length;
    }

    for (const source of sources) {
      const docName = source.document_name || source.page || 'Unknown';
      const chunkId = source.chunk_id || source.id;

      if (!documentCitations[docName]) {
        const doc = documents.find(d => d.filename === docName);
        documentCitations[docName] = {
          documentId: doc?.id || '',
          documentName: docName,
          citations: 0,
          positiveFeedback: 0,
          negativeFeedback: 0,
          lastCited: message.created_at,
          chunkCount: doc?.chunk_count || 0,
        };
      }

      documentCitations[docName].citations++;

      if (new Date(message.created_at) > new Date(documentCitations[docName].lastCited)) {
        documentCitations[docName].lastCited = message.created_at;
      }

      if (message.feedback_rating === 'positive') {
        documentCitations[docName].positiveFeedback++;
      } else if (message.feedback_rating === 'negative') {
        documentCitations[docName].negativeFeedback++;
      }

      if (chunkId) {
        if (!chunkCitations[chunkId]) {
          const chunk = chunks.find(c => c.id === chunkId);
          chunkCitations[chunkId] = {
            chunkId,
            content: chunk?.content.substring(0, 150) || 'Unknown',
            documentName: docName,
            count: 0,
            lastCited: message.created_at,
          };
        }

        chunkCitations[chunkId].count++;

        if (new Date(message.created_at) > new Date(chunkCitations[chunkId].lastCited)) {
          chunkCitations[chunkId].lastCited = message.created_at;
        }
      }
    }
  }

  const documentPerformance: DocumentPerformance[] = Object.values(documentCitations)
    .map(doc => {
      const totalFeedback = doc.positiveFeedback + doc.negativeFeedback;
      const feedbackRatio = totalFeedback > 0
        ? doc.positiveFeedback / totalFeedback
        : 0;

      const utilizationRate = doc.chunkCount > 0
        ? Math.min((doc.citations / doc.chunkCount) * 10, 100)
        : 0;

      const daysSinceLastCited = (Date.now() - new Date(doc.lastCited).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - daysSinceLastCited * 2);

      const healthScore = (
        (doc.citations / Math.max(...Object.values(documentCitations).map(d => d.citations), 1)) * 40 +
        feedbackRatio * 30 +
        (utilizationRate / 100) * 20 +
        (recencyScore / 100) * 10
      );

      return {
        documentId: doc.documentId,
        documentName: doc.documentName,
        totalCitations: doc.citations,
        positiveFeedbackCount: doc.positiveFeedback,
        negativeFeedbackCount: doc.negativeFeedback,
        avgFeedbackRatio: feedbackRatio,
        lastCited: doc.lastCited,
        chunkCount: doc.chunkCount,
        utilizationRate,
        healthScore,
      };
    })
    .sort((a, b) => b.totalCitations - a.totalCitations);

  const chunkUtilization: ChunkUtilization[] = Object.values(chunkCitations)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const unusedDocuments = documents
    .filter(doc => !documentCitations[doc.filename])
    .map(doc => doc.filename);

  const citationStats = {
    totalResponses: messages.length,
    responsesWithCitations,
    avgCitationsPerResponse: messages.length > 0 ? totalCitations / messages.length : 0,
    citationRate: messages.length > 0 ? (responsesWithCitations / messages.length) * 100 : 0,
  };

  return {
    documentPerformance,
    chunkUtilization,
    citationStats,
    unusedDocuments,
  };
};

function extractTopics(questions: string[]): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'what', 'when', 'where', 'who', 'how', 'why',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those',
  ]);

  const wordFrequency: Record<string, number> = {};

  for (const question of questions) {
    const words = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    for (const word of words) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  }

  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}
