import { generateEmbedding } from './openai';
import { supabase } from './supabase';
import { queryStructuredData, StructuredDataRow } from './structuredDataService';

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: any;
  source_page?: string;
  document_name?: string;
  uploaded_document_id?: string | null;
  storage_path?: string | null;
  type: 'vector' | 'structured';
  structuredData?: StructuredDataRow;
}

export interface HybridSearchOptions {
  vectorLimit?: number;
  structuredLimit?: number;
  similarityThreshold?: number;
  includeStructured?: boolean;
}

async function extractQueryAttributes(query: string): Promise<{
  keywords: string[];
  filters: Array<{ field: string; operator: any; value: any }>;
}> {
  const lowerQuery = query.toLowerCase();
  const filters: Array<{ field: string; operator: any; value: any }> = [];
  const keywords: string[] = [];

  const sizePatterns = [
    { pattern: /\b(large|big|major|enterprise)\b/i, field: 'Company Size Category', value: 'Large' },
    { pattern: /\b(medium|mid-size|mid-sized)\b/i, field: 'Company Size Category', value: 'Medium' },
    { pattern: /\b(small|startup|boutique)\b/i, field: 'Company Size Category', value: 'Small' }
  ];

  for (const { pattern, field, value } of sizePatterns) {
    if (pattern.test(lowerQuery)) {
      filters.push({ field, operator: 'ilike', value });
    }
  }

  const typePatterns = [
    { pattern: /\bvendor/i, field: 'What type of organization are you representing with your response? (An option must be selected to enable the remaining questions)', value: 'Vendor' },
    { pattern: /\bgovernment/i, field: 'What type of organization are you representing with your response? (An option must be selected to enable the remaining questions)', value: 'Government' },
    { pattern: /\bindividual/i, field: 'What type of organization are you representing with your response? (An option must be selected to enable the remaining questions)', value: 'Individual' }
  ];

  for (const { pattern, field, value } of typePatterns) {
    if (pattern.test(lowerQuery)) {
      filters.push({ field, operator: 'ilike', value });
    }
  }

  const words = lowerQuery.split(/\s+/).filter(w => w.length > 3);
  keywords.push(...words);

  return { keywords, filters };
}

export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<SearchResult[]> {
  const {
    vectorLimit = 50,
    structuredLimit = 100,
    similarityThreshold = 0.1,
    includeStructured = true
  } = options;

  const results: SearchResult[] = [];

  const embedding = await generateEmbedding(query);

  const { data: vectorChunks, error: vectorError } = await supabase.rpc(
    'match_document_chunks',
    {
      query_embedding: embedding,
      match_threshold: similarityThreshold,
      match_count: vectorLimit,
    }
  );

  if (vectorError) {
    console.error('Vector search error:', vectorError);
  } else if (vectorChunks) {
    results.push(...vectorChunks.map((chunk: any) => ({
      ...chunk,
      type: 'vector' as const
    })));
  }

  if (includeStructured) {
    try {
      const { keywords, filters } = await extractQueryAttributes(query);

      const structuredResults = await queryStructuredData({
        conditions: filters.length > 0 ? filters : undefined,
        searchText: keywords.join(' & '),
        limit: structuredLimit
      });

      for (const row of structuredResults) {
        results.push({
          id: row.id || `structured_${row.row_number}`,
          content: row.searchable_text,
          similarity: 0.95,
          metadata: { isStructured: true, data: row.data },
          source_page: `/documents/${row.uploaded_document_id}`,
          document_name: 'Structured Data',
          uploaded_document_id: row.uploaded_document_id,
          storage_path: null,
          type: 'structured',
          structuredData: row
        });
      }
    } catch (structuredError) {
      console.error('Structured search error (non-fatal):', structuredError);
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);

  return results;
}

export async function extractVendorList(searchResults: SearchResult[]): Promise<string[]> {
  const vendors = new Set<string>();

  for (const result of searchResults) {
    if (result.type === 'structured' && result.structuredData) {
      const data = result.structuredData.data;

      const companyNameField = Object.keys(data).find(key =>
        key.toLowerCase().includes('name of the organization') ||
        key.toLowerCase().includes('company name') ||
        key.toLowerCase() === 'organization'
      );

      const companySizeField = Object.keys(data).find(key =>
        key.toLowerCase().includes('company size category') ||
        key.toLowerCase().includes('size')
      );

      if (companyNameField && data[companyNameField]) {
        const companyName = String(data[companyNameField]).trim();
        const companySize = companySizeField ? String(data[companySizeField]).trim() : '';

        if (companySize.toLowerCase() === 'large') {
          vendors.add(companyName);
        }
      }
    } else if (result.content) {
      const content = result.content;
      if (content.includes('Vendor') && content.includes('Large')) {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('|') && line.includes('Vendor') && line.includes('Large')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length > 5 && parts[5] === 'Vendor' && parts[7] === 'Large') {
              const companyName = parts[4];
              if (companyName && companyName.length > 0) {
                vendors.add(companyName);
              }
            }
          }
        }
      }
    }
  }

  return Array.from(vendors).sort();
}
