import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = 'https://fvlstvvvwrtmuujxwxml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bHN0dnZ2d3J0bXV1anh3eG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5ODMsImV4cCI6MjA3NDc0NDk4M30.JzI45Ay51RtsEJMMJjh9SrftWQQVeOCMVF9z9jqowdw';
const openaiKey = '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';

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

const metadataContent = `VENDOR SIZE CLASSIFICATION DEFINITIONS:
- Large vendors: Organizations with 10,000 or more employees
- Medium vendors: Organizations with fewer than 10,000 employees but more than a small business threshold
- Small vendors: Organizations with a small number of employees

This classification is used in the Minnesota MES Modernization Challenge RFI responses to categorize vendors by size. In the Final RFI Response List spreadsheet, the "Company Size Category" column shows "Large" for vendors reporting "10,000+" or "10000+" employees.`;

async function addVendorSizeMetadata() {
  try {
    console.log('Checking if metadata already exists...');
    const { data: existing } = await supabase
      .from('document_chunks')
      .select('id')
      .ilike('content', '%VENDOR SIZE CLASSIFICATION DEFINITIONS%')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Metadata chunk already exists, skipping...');
      return;
    }

    console.log('Generating embedding for vendor size metadata...');
    const embedding = await generateEmbedding(metadataContent);

    console.log('Inserting metadata chunk...');
    const { error } = await supabase
      .from('document_chunks')
      .insert({
        uploaded_document_id: 'ac09cafc-2491-4c07-9628-af5dd989b3bd',
        document_name: 'Final RFI Response List.xlsx',
        source_page: '/documents/Final RFI Response List.xlsx',
        content: metadataContent,
        embedding: embedding,
      });

    if (error) {
      console.error('Error inserting metadata:', error);
      throw error;
    }

    console.log('Vendor size metadata added successfully!');
  } catch (error) {
    console.error('Failed to add vendor size metadata:', error);
    throw error;
  }
}

addVendorSizeMetadata();
