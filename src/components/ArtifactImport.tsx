import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

interface ImportRow {
  title: string;
  description: string;
  url: string;
  category: string;
  subCategory: string;
  linkType: string;
  contentNotes: string;
  tags: string;
  fileType: string;
  owner: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface ArtifactImportProps {
  onImportComplete: () => void;
}

const ArtifactImport: React.FC<ArtifactImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    subCategory: '',
    linkType: '',
    contentNotes: '',
    tags: '',
    fileType: '',
    owner: '',
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('artifact_categories').select('id, name').order('display_order');
    if (data) setCategories(data);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    try {
      const data = await readFile(selectedFile);
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('Detected columns:', columns);
        setAvailableColumns(columns);

        const autoMapping = {
          title: findColumn(columns, ['title', 'name', 'artifact']),
          description: findColumn(columns, ['description', 'desc', 'details']),
          url: findColumn(columns, ['url', 'link', 'path']),
          category: findColumn(columns, ['category', 'type', 'classification']),
          subCategory: findColumn(columns, ['sub-category', 'subcategory', 'sub category']),
          linkType: findColumn(columns, ['link type', 'linktype', 'link-type']),
          contentNotes: findColumn(columns, ['content notes', 'contentnotes', 'notes', 'content_notes']),
          tags: findColumn(columns, ['tags', 'keywords']),
          fileType: findColumn(columns, ['file type', 'filetype', 'type']),
          owner: findColumn(columns, ['owner', 'responsible', 'contact']),
        };

        console.log('Auto-mapped columns:', autoMapping);
        setColumnMapping(autoMapping);
        setPreviewData(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please ensure it is a valid Excel or CSV file.');
    }
  };

  const findColumn = (columns: string[], searchTerms: string[]): string => {
    for (const term of searchTerms) {
      const found = columns.find((col) => col.toLowerCase().includes(term.toLowerCase()));
      if (found) return found;
    }
    return '';
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let workbook: XLSX.WorkBook;

          if (file.name.endsWith('.csv')) {
            workbook = XLSX.read(data, { type: 'binary' });
          } else {
            workbook = XLSX.read(data, { type: 'array' });
          }

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            defval: '',
            blankrows: false,
            raw: false
          });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);

      if (file.name.endsWith('.csv')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const detectFileType = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('sharepoint')) return 'SharePoint';
    if (lowerUrl.includes('.xlsx') || lowerUrl.includes('.xls')) return 'Excel';
    if (lowerUrl.includes('.docx') || lowerUrl.includes('.doc')) return 'Word';
    if (lowerUrl.includes('.pptx') || lowerUrl.includes('.ppt')) return 'PowerPoint';
    if (lowerUrl.includes('.pdf')) return 'PDF';
    if (lowerUrl.includes('teams.microsoft.com')) return 'Teams';
    return '';
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImport = async () => {
    if (!file || !columnMapping.title || !columnMapping.url) {
      alert('Please select a file and map at least Title and URL columns');
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const allData = await readFile(file);
      const results: ImportResult = { success: 0, failed: 0, errors: [] };

      const categoryMap = new Map(categories.map((cat) => [cat.name.toLowerCase(), cat.id]));

      for (let i = 0; i < allData.length; i++) {
        const row = allData[i];

        try {
          const title = row[columnMapping.title]?.toString().trim();
          const url = row[columnMapping.url]?.toString().trim();

          if (!title || !url) {
            results.failed++;
            results.errors.push({ row: i + 2, error: 'Missing title or URL' });
            continue;
          }

          if (!validateUrl(url)) {
            results.failed++;
            results.errors.push({ row: i + 2, error: 'Invalid URL format' });
            continue;
          }

          const categoryName = columnMapping.category ? row[columnMapping.category]?.toString().trim() : '';
          const categoryId = categoryName ? categoryMap.get(categoryName.toLowerCase()) || null : null;

          const tagsString = columnMapping.tags ? row[columnMapping.tags]?.toString().trim() : '';
          const tags = tagsString
            ? tagsString.split(/[,;]/).map((t) => t.trim()).filter((t) => t.length > 0)
            : [];

          const fileType = columnMapping.fileType
            ? row[columnMapping.fileType]?.toString().trim()
            : detectFileType(url);

          const artifact = {
            title,
            description: columnMapping.description ? row[columnMapping.description]?.toString().trim() || null : null,
            url,
            category_id: categoryId,
            sub_category: columnMapping.subCategory ? row[columnMapping.subCategory]?.toString().trim() || null : null,
            link_type: columnMapping.linkType ? row[columnMapping.linkType]?.toString().trim() || null : null,
            content_notes: columnMapping.contentNotes ? row[columnMapping.contentNotes]?.toString().trim() || null : null,
            tags,
            file_type: fileType || null,
            owner: columnMapping.owner ? row[columnMapping.owner]?.toString().trim() || null : null,
          };

          const { error } = await supabase.from('project_artifacts').insert([artifact]);

          if (error) {
            results.failed++;
            results.errors.push({ row: i + 2, error: error.message });
          } else {
            results.success++;
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push({ row: i + 2, error: error.message || 'Unknown error' });
        }
      }

      setImportResult(results);
      if (results.success > 0) {
        onImportComplete();
      }
    } catch (error: any) {
      alert('Import failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadErrorReport = () => {
    if (!importResult || importResult.errors.length === 0) return;

    const csv = [
      ['Row Number', 'Error'].join(','),
      ...importResult.errors.map((err) => [err.row, `"${err.error}"`].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-mn-primary mb-4">Import Artifacts from Excel/CSV</h2>
        <p className="text-gray-600 mb-6">
          Upload an Excel (.xlsx) or CSV file containing your project artifacts. The file should include columns
          for title, URL, and optionally description, category, tags, file type, and owner.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <label className="cursor-pointer">
            <span className="inline-flex items-center space-x-2 bg-mn-accent-teal text-white px-6 py-3 rounded-lg hover:bg-mn-primary transition-colors">
              <Upload className="h-5 w-5" />
              <span>Choose File</span>
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          {file && (
            <p className="mt-4 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>
      </div>

      {availableColumns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-mn-primary mb-4">Map Columns</h3>
          <p className="text-gray-600 mb-4">
            Map the columns from your file to the artifact fields. Title and URL are required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <select
                value={columnMapping.title}
                onChange={(e) => setColumnMapping({ ...columnMapping, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <select
                value={columnMapping.url}
                onChange={(e) => setColumnMapping({ ...columnMapping, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <select
                value={columnMapping.description}
                onChange={(e) => setColumnMapping({ ...columnMapping, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={columnMapping.category}
                onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <select
                value={columnMapping.tags}
                onChange={(e) => setColumnMapping({ ...columnMapping, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={columnMapping.fileType}
                onChange={(e) => setColumnMapping({ ...columnMapping, fileType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <select
                value={columnMapping.owner}
                onChange={(e) => setColumnMapping({ ...columnMapping, owner: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
              <select
                value={columnMapping.subCategory}
                onChange={(e) => setColumnMapping({ ...columnMapping, subCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Type</label>
              <select
                value={columnMapping.linkType}
                onChange={(e) => setColumnMapping({ ...columnMapping, linkType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Notes</label>
              <select
                value={columnMapping.contentNotes}
                onChange={(e) => setColumnMapping({ ...columnMapping, contentNotes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">Select column (optional)</option>
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Preview (First 5 Rows)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold">Title</th>
                      <th className="text-left py-2 px-3 font-semibold">URL</th>
                      <th className="text-left py-2 px-3 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 px-3">{columnMapping.title ? row[columnMapping.title as keyof ImportRow] : '-'}</td>
                        <td className="py-2 px-3 text-xs">{columnMapping.url ? row[columnMapping.url as keyof ImportRow] : '-'}</td>
                        <td className="py-2 px-3">{columnMapping.category ? row[columnMapping.category as keyof ImportRow] : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleImport}
              disabled={isProcessing || !columnMapping.title || !columnMapping.url}
              className="flex items-center space-x-2 bg-mn-accent-teal text-white px-6 py-3 rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-5 w-5" />
              <span>{isProcessing ? 'Importing...' : 'Import Artifacts'}</span>
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-mn-primary mb-4">Import Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Successfully Imported</p>
                <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
              </div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Errors Encountered</span>
                </div>
                <button
                  onClick={downloadErrorReport}
                  className="text-sm text-mn-accent-teal hover:text-mn-primary transition-colors"
                >
                  Download Error Report
                </button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {importResult.errors.slice(0, 10).map((err, idx) => (
                  <div key={idx} className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Row {err.row}:</span> {err.error}
                  </div>
                ))}
                {importResult.errors.length > 10 && (
                  <p className="text-sm text-gray-600 mt-2">
                    And {importResult.errors.length - 10} more errors...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactImport;
