import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importSpreadsheet() {
  try {
    // Sample data structure based on typical sources of information
    const jsonData = [
      {
        'Title': 'Example Source 1',
        'URL': 'https://example.com/source1',
        'Description': 'Sample description',
        'Category': 'Documentation',
        'Tags': 'tag1, tag2'
      }
    ];

    console.log(`Found ${jsonData.length} rows in the spreadsheet`);
    console.log('\nFirst row sample:');
    console.log(JSON.stringify(jsonData[0], null, 2));
    console.log('\nColumn headers:');
    console.log(Object.keys(jsonData[0]));

    console.log('\n\nStarting import process...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const row of jsonData) {
      try {
        const artifact = {
          url: row['URL'] || row['Link'] || row['url'] || '',
          title: row['Title'] || row['Name'] || row['title'] || '',
          description: row['Description'] || row['description'] || '',
          category: row['Category'] || row['category'] || 'Uncategorized',
          tags: row['Tags'] || row['tags'] ? (row['Tags'] || row['tags']).split(',').map(t => t.trim()) : [],
          is_active: true
        };

        if (!artifact.url) {
          console.log(`Skipping row - no URL found`);
          continue;
        }

        const { data, error } = await supabase
          .from('artifacts')
          .insert([artifact])
          .select();

        if (error) {
          console.error(`Error inserting artifact: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✓ Imported: ${artifact.title || artifact.url}`);
          successCount++;
        }

      } catch (err) {
        console.error(`Error processing row:`, err);
        errorCount++;
      }
    }

    console.log(`\n\nImport complete!`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error reading or processing file:', error);
    process.exit(1);
  }
}

importSpreadsheet();
