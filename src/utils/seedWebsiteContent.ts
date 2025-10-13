import { supabase } from '../lib/supabase';
import { generateEmbedding } from '../lib/openai';
import { extractWebsiteContent } from './websiteContentExtractor';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

const chunkText = (text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;

    if (start >= text.length - overlap) break;
  }

  return chunks;
};

export const seedWebsiteContent = async () => {
  try {
    console.log('Starting website content seeding...');

    const websiteContent = extractWebsiteContent();

    for (const item of websiteContent) {
      const chunks = chunkText(item.content);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        console.log(`Processing ${item.page} - chunk ${i + 1}/${chunks.length}`);

        const embedding = await generateEmbedding(chunk);

        const metadata = {
          source: 'website',
          page: item.page,
          title: item.title,
          category: item.category || null,
        };

        const { error } = await supabase
          .from('document_chunks')
          .insert({
            content: chunk,
            embedding,
            metadata,
            source_page: item.page,
            source_section: item.title,
            document_name: `Website - ${item.page}`,
            chunk_index: i,
          });

        if (error) {
          console.error(`Error inserting chunk for ${item.page}:`, error);
        }
      }
    }

    console.log('Website content seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding website content:', error);
    throw error;
  }
};
