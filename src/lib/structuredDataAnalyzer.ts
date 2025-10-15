import { supabase } from './supabase';

export interface AnalysisResult {
  answer: string;
  data: any[];
  query: string;
}

export async function analyzeStructuredData(question: string): Promise<AnalysisResult | null> {
  const questionLower = question.toLowerCase();

  if (questionLower.includes('large') && (questionLower.includes('vendor') || questionLower.includes('company')) && questionLower.includes('employee')) {
    const { data, error } = await supabase
      .from('structured_data')
      .select('data')
      .neq('data->>Company Size Category', null)
      .limit(200);

    if (error || !data) {
      console.error('Error querying structured data:', error);
      return null;
    }

    const sizeCategories = new Map<string, Set<string>>();

    data.forEach(row => {
      const category = row.data['Company Size Category'];
      const employeeRange = row.data['Roughly how many employees work for your company?'];

      if (category && employeeRange) {
        if (!sizeCategories.has(category)) {
          sizeCategories.set(category, new Set());
        }
        sizeCategories.get(category)!.add(employeeRange);
      }
    });

    const categoryAnalysis = Array.from(sizeCategories.entries()).map(([category, ranges]) => ({
      category,
      ranges: Array.from(ranges)
    }));

    const largeVendors = categoryAnalysis.find(c => c.category === 'Large');

    if (largeVendors) {
      const rangesList = largeVendors.ranges.join(', ');
      const answer = `Based on the Final RFI Response List spreadsheet, vendors are classified as "Large" when they have ${rangesList} employees. The threshold for large vendors is 10,000 or more employees.`;

      return {
        answer,
        data: categoryAnalysis,
        query: 'Analyzed company size categories from structured data'
      };
    }
  }

  if (questionLower.includes('how many') && questionLower.includes('vendor') && questionLower.includes('large')) {
    const { data, error } = await supabase
      .from('structured_data')
      .select('data')
      .eq('data->>Company Size Category', 'Large')
      .limit(200);

    if (error || !data) {
      console.error('Error querying structured data:', error);
      return null;
    }

    const uniqueVendors = new Set();
    data.forEach(row => {
      const vendorName = row.data['What is the name of the organization you represent? (if responding as an individual, enter your name if desired)'];
      if (vendorName) {
        uniqueVendors.add(vendorName);
      }
    });

    return {
      answer: `There are ${uniqueVendors.size} large vendors (10,000+ employees) that responded to the RFI.`,
      data: Array.from(uniqueVendors),
      query: 'Counted unique large vendors from structured data'
    };
  }

  if (questionLower.includes('list') && questionLower.includes('vendor') && questionLower.includes('large')) {
    const { data, error } = await supabase
      .from('structured_data')
      .select('data')
      .eq('data->>Company Size Category', 'Large')
      .limit(200);

    if (error || !data) {
      console.error('Error querying structured data:', error);
      return null;
    }

    const uniqueVendors = new Set();
    data.forEach(row => {
      const vendorName = row.data['What is the name of the organization you represent? (if responding as an individual, enter your name if desired)'];
      if (vendorName) {
        uniqueVendors.add(vendorName);
      }
    });

    const vendorList = Array.from(uniqueVendors).sort();
    return {
      answer: `The following large vendors (10,000+ employees) responded to the RFI:\n\n${vendorList.map((v, i) => `${i + 1}. ${v}`).join('\n')}`,
      data: vendorList,
      query: 'Retrieved list of large vendors from structured data'
    };
  }

  return null;
}
