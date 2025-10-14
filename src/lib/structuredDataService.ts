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
  let queryBuilder = supabase
    .from('structured_data')
    .select('*');

  if (query.documentId) {
    queryBuilder = queryBuilder.eq('uploaded_document_id', query.documentId);
  }

  if (query.conditions) {
    for (const condition of query.conditions) {
      const jsonPath = `data->>${condition.field}`;

      switch (condition.operator) {
        case 'eq':
          queryBuilder = queryBuilder.eq(jsonPath, condition.value);
          break;
        case 'neq':
          queryBuilder = queryBuilder.neq(jsonPath, condition.value);
          break;
        case 'gt':
          queryBuilder = queryBuilder.gt(jsonPath, condition.value);
          break;
        case 'gte':
          queryBuilder = queryBuilder.gte(jsonPath, condition.value);
          break;
        case 'lt':
          queryBuilder = queryBuilder.lt(jsonPath, condition.value);
          break;
        case 'lte':
          queryBuilder = queryBuilder.lte(jsonPath, condition.value);
          break;
        case 'like':
          queryBuilder = queryBuilder.like(jsonPath, `%${condition.value}%`);
          break;
        case 'ilike':
          queryBuilder = queryBuilder.ilike(jsonPath, `%${condition.value}%`);
          break;
        case 'in':
          queryBuilder = queryBuilder.in(jsonPath, condition.value);
          break;
      }
    }
  }

  if (query.searchText) {
    queryBuilder = queryBuilder.textSearch('searchable_text', query.searchText, {
      type: 'websearch',
      config: 'english'
    });
  }

  if (query.limit) {
    queryBuilder = queryBuilder.limit(query.limit);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error querying structured data:', error);
    throw error;
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
