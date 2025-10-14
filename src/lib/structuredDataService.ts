import { supabase } from './supabase';

export interface StructuredDataRow {
  id?: string;
  uploaded_document_id: string;
  sheet_name: string | null;
  row_number: number;
  headers: string[];
  values: any[];
  data: Record<string, any>;
  searchable_text: string;
}

export async function saveStructuredData(rows: StructuredDataRow[]): Promise<void> {
  if (rows.length === 0) return;

  const { error } = await supabase
    .from('structured_data')
    .insert(rows);

  if (error) {
    console.error('Error saving structured data:', error);
    throw error;
  }
}

export async function deleteStructuredDataForDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('structured_data')
    .delete()
    .eq('uploaded_document_id', documentId);

  if (error) {
    console.error('Error deleting structured data:', error);
    throw error;
  }
}

export interface StructuredDataQuery {
  documentId?: string;
  conditions?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
    value: any;
  }>;
  searchText?: string;
  limit?: number;
}

export async function queryStructuredData(query: StructuredDataQuery): Promise<StructuredDataRow[]> {
  let whereClauses: string[] = [];
  const params: Record<string, any> = {};

  if (query.documentId) {
    whereClauses.push(`uploaded_document_id = '${query.documentId}'`);
  }

  if (query.conditions && query.conditions.length > 0) {
    for (let i = 0; i < query.conditions.length; i++) {
      const condition = query.conditions[i];
      const field = condition.field;
      const value = condition.value;

      switch (condition.operator) {
        case 'eq':
          whereClauses.push(`data->>'${field}' = '${value}'`);
          break;
        case 'ilike':
          whereClauses.push(`data->>'${field}' ILIKE '%${value}%'`);
          break;
        case 'like':
          whereClauses.push(`data->>'${field}' LIKE '%${value}%'`);
          break;
      }
    }
  }

  if (query.searchText) {
    whereClauses.push(`to_tsvector('english', searchable_text) @@ websearch_to_tsquery('english', '${query.searchText}')`);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const limitClause = query.limit ? `LIMIT ${query.limit}` : '';

  const sql = `
    SELECT *
    FROM structured_data
    ${whereClause}
    ORDER BY row_number
    ${limitClause}
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query: sql }) as any;

  if (error) {
    console.log('Falling back to client-side filtering...');
    console.log('Query conditions:', JSON.stringify(query.conditions, null, 2));
    console.log('Query searchText:', query.searchText);

    const { data: allData, error: fetchError } = await supabase
      .from('structured_data')
      .select('*')
      .limit(query.limit || 1000);

    if (fetchError) {
      console.error('Error querying structured data:', fetchError);
      throw fetchError;
    }

    console.log(`Fetched ${allData?.length || 0} total structured data rows`);
    let filtered = allData || [];

    if (query.conditions && query.conditions.length > 0) {
      console.log('Applying condition filters...');
      filtered = filtered.filter(row => {
        const matches = query.conditions!.every(condition => {
          const fieldValue = row.data[condition.field];
          console.log(`  Checking field "${condition.field}": "${fieldValue}" against "${condition.value}" (operator: ${condition.operator})`);

          if (!fieldValue) return false;

          switch (condition.operator) {
            case 'eq':
              return String(fieldValue).toLowerCase() === String(condition.value).toLowerCase();
            case 'ilike':
            case 'like':
              return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
            default:
              return false;
          }
        });
        return matches;
      });
      console.log(`After condition filtering: ${filtered.length} rows`);
    }

    if (query.searchText) {
      console.log('Applying text search filter...');
      const searchLower = query.searchText.toLowerCase();
      filtered = filtered.filter(row =>
        row.searchable_text?.toLowerCase().includes(searchLower)
      );
      console.log(`After text search: ${filtered.length} rows`);
    }

    console.log(`Returning ${filtered.length} structured data results`);
    return filtered.slice(0, query.limit || filtered.length);
  }

  return data || [];
}

export function parseExcelToStructuredData(
  documentId: string,
  extractedText: string,
  documentName: string
): StructuredDataRow[] {
  const rows: StructuredDataRow[] = [];

  let currentSheet: string | null = null;
  let headers: string[] = [];

  const sheetRegex = /=== Sheet \d+: (.+) ===/g;
  const headerRegex = /Column Headers: ([^\n]+)/g;
  const rowRegex = /Row (\d+): (.+?)(?=\nColumn Headers:|Row \d+:|=== Sheet|$)/gs;

  let sheetMatch;
  while ((sheetMatch = sheetRegex.exec(extractedText)) !== null) {
    currentSheet = sheetMatch[1];
  }

  let headerMatch;
  while ((headerMatch = headerRegex.exec(extractedText)) !== null) {
    headers = headerMatch[1]
      .split('|')
      .map(h => h.trim())
      .filter(h => h.length > 0);
  }

  let rowMatch;
  let rowsFound = 0;
  let rowsSkipped = 0;

  while ((rowMatch = rowRegex.exec(extractedText)) !== null) {
    rowsFound++;

    if (headers.length === 0) {
      console.warn(`Row ${rowMatch[1]} found without headers`);
      rowsSkipped++;
      continue;
    }

    const rowNumber = parseInt(rowMatch[1], 10);
    const rowData = rowMatch[2].replace(/\n/g, ' ').trim();
    const values = rowData
      .split('|')
      .map(v => v.trim());

    if (values.length < headers.length * 0.5) {
      console.warn(`Row ${rowNumber} has too few values (${values.length} vs ${headers.length} headers)`);
      rowsSkipped++;
      continue;
    }

    const data: Record<string, any> = {};
    const searchableFields: string[] = [];

    for (let j = 0; j < headers.length && j < values.length; j++) {
      const header = headers[j];
      const value = values[j];

      if (value) {
        data[header] = value;

        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue.toString() === value) {
          data[header] = numValue;
        }

        searchableFields.push(`${header}: ${value}`);
      }
    }

    const searchableText = searchableFields.join(' | ');

    rows.push({
      uploaded_document_id: documentId,
      sheet_name: currentSheet,
      row_number: rowNumber,
      headers,
      values,
      data,
      searchable_text: searchableText
    });
  }

  console.log(`parseExcelToStructuredData: Found ${rowsFound} row matches, parsed ${rows.length} rows, skipped ${rowsSkipped}`);
  return rows;
}

export async function reprocessExcelStructuredData(documentId: string): Promise<{ success: boolean; rowCount: number; error?: string }> {
  try {
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('content')
      .eq('uploaded_document_id', documentId)
      .order('chunk_number', { ascending: true });

    if (chunksError || !chunks) {
      throw new Error(`Failed to fetch chunks: ${chunksError?.message}`);
    }

    const fullText = chunks.map(c => c.content).join('\n');

    console.log(`Reprocessing Excel document ${documentId} from ${chunks.length} chunks...`);

    const { data: doc } = await supabase
      .from('uploaded_documents')
      .select('filename')
      .eq('id', documentId)
      .single();

    const structuredRows = parseExcelToStructuredData(documentId, fullText, doc?.filename || 'Unknown');

    if (structuredRows.length === 0) {
      throw new Error('No structured data rows parsed');
    }

    await supabase
      .from('structured_data')
      .delete()
      .eq('uploaded_document_id', documentId);

    console.log(`Deleted old structured data for document ${documentId}`);

    await saveStructuredData(structuredRows);

    console.log(`Saved ${structuredRows.length} structured data rows`);

    return { success: true, rowCount: structuredRows.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error reprocessing Excel structured data:', errorMessage);
    return { success: false, rowCount: 0, error: errorMessage };
  }
}
