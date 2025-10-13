import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found. Chatbot functionality will be limited.');
}

export const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
}) : null;

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

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
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  try {
    if (onStream) {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        temperature: 0.7,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onStream(content);
        }
      }

      return fullResponse;
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      });

      return response.choices[0].message.content || '';
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
  if (!openai) {
    return 'New Conversation';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate a short, concise title (max 6 words) for a conversation that starts with the following message. Only respond with the title, nothing else.',
        },
        {
          role: 'user',
          content: firstMessage,
        },
      ],
      temperature: 0.5,
      max_tokens: 20,
    });

    return response.choices[0].message.content?.trim() || 'New Conversation';
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Conversation';
  }
};
