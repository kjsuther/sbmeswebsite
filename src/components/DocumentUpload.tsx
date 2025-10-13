import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { uploadDocument, validateFile, UploadProgress } from '../lib/documentUploadService';
import { getSupportedExtensions } from '../utils/documentProcessor';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccess(false);
    setProgress(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    const result = await uploadDocument(selectedFile, (progressUpdate) => {
      setProgress(progressUpdate);
    });

    setIsUploading(false);

    if (result.success) {
      setSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete?.();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Upload failed');
    }

    setProgress(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const supportedExtensions = getSupportedExtensions();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-mn-primary mb-4">Upload Documents</h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-mn-accent-teal bg-mn-neutral-lightblue bg-opacity-20'
            : 'border-gray-300 hover:border-mn-accent-teal'
        }`}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />

        {!selectedFile ? (
          <>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop a document here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, PowerPoint, Word Documents, Images, TXT, MD
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={supportedExtensions.join(',')}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-mn-accent-teal text-white px-6 py-2 rounded-lg hover:bg-mn-primary transition-colors cursor-pointer"
            >
              Browse Files
            </label>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            {!isUploading && (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleUpload}
                  className="bg-mn-accent-teal text-white px-6 py-2 rounded-lg hover:bg-mn-primary transition-colors"
                >
                  Upload Document
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isUploading && progress && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Loader className="h-5 w-5 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-blue-800">{progress.message}</p>
          </div>
          {progress.progress !== undefined && progress.total !== undefined && (
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.progress / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Document uploaded and processed successfully!</p>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p className="font-semibold mb-1">Supported file formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>PDF documents (.pdf)</li>
          <li>Microsoft PowerPoint (.ppt, .pptx)</li>
          <li>Microsoft Word (.doc, .docx)</li>
          <li>Images (.jpg, .jpeg, .png, .gif, .bmp, .webp)</li>
          <li>Plain text (.txt)</li>
          <li>Markdown (.md)</li>
        </ul>
        <p className="mt-2">Maximum file size: 50 MB</p>
      </div>
    </div>
  );
};

export default DocumentUpload;
