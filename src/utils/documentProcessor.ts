
export interface ProcessedDocument {
  text: string;
  metadata?: {
    pageCount?: number;
    author?: string;
    title?: string;
    [key: string]: any;
  };
}

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

export const getSupportedExtensions = (): string[] => {
  return Object.values(SUPPORTED_FILE_TYPES).flat();
};

export const isSupportedFileType = (filename: string): boolean => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return getSupportedExtensions().includes(extension);
};

export const getFileType = (filename: string): string => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  for (const [mimeType, extensions] of Object.entries(SUPPORTED_FILE_TYPES)) {
    if (extensions.includes(extension)) {
      return mimeType;
    }
  }

  return 'application/octet-stream';
};

const extractTextFromPlainText = async (file: File): Promise<string> => {
  try {
    return await file.text();
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error('Failed to read text file');
  }
};

const extractTextFromPDF = async (file: File): Promise<{ text: string; metadata?: any }> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${supabaseUrl}/functions/v1/extract-pdf-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract PDF text');
    }

    const result = await response.json();
    return { text: result.text, metadata: result.metadata };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

const extractTextFromPowerPoint = async (file: File): Promise<{ text: string; metadata?: any }> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${supabaseUrl}/functions/v1/extract-pptx-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract PowerPoint text');
    }

    const result = await response.json();
    return { text: result.text, metadata: result.metadata };
  } catch (error) {
    console.error('Error extracting text from PowerPoint:', error);
    throw new Error('Failed to extract text from PowerPoint');
  }
};

const extractTextFromWordDocument = async (file: File): Promise<{ text: string; metadata?: any }> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${supabaseUrl}/functions/v1/extract-docx-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract Word document text');
    }

    const result = await response.json();
    return { text: result.text, metadata: result.metadata };
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw new Error('Failed to extract text from Word document');
  }
};

const extractTextFromImage = async (file: File): Promise<{ text: string; metadata?: any }> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${supabaseUrl}/functions/v1/extract-image-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract text from image');
    }

    const result = await response.json();
    return { text: result.text, metadata: result.metadata };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const processDocument = async (file: File): Promise<ProcessedDocument> => {
  const fileType = getFileType(file.name);

  let text = '';
  const metadata: any = {
    filename: file.name,
    fileSize: file.size,
    fileType: fileType,
  };

  try {
    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      text = await extractTextFromPlainText(file);
    } else if (fileType === 'application/pdf') {
      const result = await extractTextFromPDF(file);
      text = result.text;
      Object.assign(metadata, result.metadata);
    } else if (fileType.includes('presentationml') || fileType.includes('ms-powerpoint')) {
      const result = await extractTextFromPowerPoint(file);
      text = result.text;
      Object.assign(metadata, result.metadata);
    } else if (fileType.includes('wordprocessingml') || fileType === 'application/msword') {
      const result = await extractTextFromWordDocument(file);
      text = result.text;
      Object.assign(metadata, result.metadata);
    } else if (fileType.startsWith('image/')) {
      const result = await extractTextFromImage(file);
      text = result.text;
      Object.assign(metadata, result.metadata);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the document');
    }

    return { text, metadata };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

export const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
