import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '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';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fvlstvvvwrtmuujxwxml.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bHN0dnZ2d3J0bXV1anh3eG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5ODMsImV4cCI6MjA3NDc0NDk4M30.JzI45Ay51RtsEJMMJjh9SrftWQQVeOCMVF9z9jqowdw';

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

const callChatCompletionEdgeFunction = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<any> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/chat-completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      messages,
      model: options.model || 'gpt-4o-mini',
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Edge function error: ${errorData.error || response.statusText}`);
  }

  return response.json();
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

export const generateChatResponse = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const response = await callChatCompletionEdgeFunction(messages, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '';

    if (onStream && content) {
      const words = content.split(' ');
      for (const word of words) {
        onStream(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }

    return content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
  try {
    const response = await callChatCompletionEdgeFunction([
      {
        role: 'system',
        content: 'Generate a short, concise title (max 6 words) for a conversation that starts with the following message. Only respond with the title, nothing else.',
      },
      {
        role: 'user',
        content: firstMessage,
      },
    ], {
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 20,
    });

    return response.choices[0].message.content?.trim() || 'New Conversation';
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Conversation';
  }
};
