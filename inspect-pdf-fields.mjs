import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Downloading work order contract template...');
const { data, error } = await supabase.storage
  .from('contract-templates')
  .download('work-order-contract-template.pdf');

if (error) {
  console.error('Error downloading:', error);
  process.exit(1);
}

const arrayBuffer = await data.arrayBuffer();
const pdfDoc = await PDFDocument.load(arrayBuffer);
const form = pdfDoc.getForm();

const fields = form.getFields();
console.log(`\nFound ${fields.length} form fields:\n`);
fields.forEach((field) => {
  const type = field.constructor.name;
  const name = field.getName();
  console.log(`- ${name} (${type})`);
});
