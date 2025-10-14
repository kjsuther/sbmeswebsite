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
    const { data: allData, error: fetchError } = await supabase
      .from('structured_data')
      .select('*')
      .limit(query.limit || 1000);

    if (fetchError) {
      console.error('Error querying structured data:', fetchError);
      throw fetchError;
    }

    let filtered = allData || [];

    if (query.conditions && query.conditions.length > 0) {
      filtered = filtered.filter(row => {
        return query.conditions!.every(condition => {
          const fieldValue = row.data[condition.field];
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
      });
    }

    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      filtered = filtered.filter(row =>
        row.searchable_text?.toLowerCase().includes(searchLower)
      );
    }

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
  const lines = extractedText.split('\n');

  let currentSheet: string | null = null;
  let headers: string[] = [];

  for (const line of lines) {
    if (line.startsWith('=== Sheet')) {
      const match = line.match(/=== Sheet \d+: (.+) ===/);
      currentSheet = match ? match[1] : null;
      headers = [];
      continue;
    }

    if (line.startsWith('Column Headers:')) {
      headers = line
        .substring('Column Headers:'.length)
        .split('|')
        .map(h => h.trim())
        .filter(h => h.length > 0);
      continue;
    }

    if (line.startsWith('Row ')) {
      const match = line.match(/^Row (\d+): (.+)$/);
      if (!match) continue;

      const rowNumber = parseInt(match[1], 10);
      const rowData = match[2];
      const values = rowData
        .split('|')
        .map(v => v.trim());

      const data: Record<string, any> = {};
      const searchableFields: string[] = [];

      for (let i = 0; i < headers.length && i < values.length; i++) {
        const header = headers[i];
        const value = values[i];

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
  }

  return rows;
}
