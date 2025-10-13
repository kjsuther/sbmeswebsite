import React, { useState, useEffect } from 'react';
import { Trash2, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getUploadedDocuments, deleteDocument, UploadedDocument } from '../lib/documentUploadService';

interface DocumentListProps {
  refreshTrigger?: number;
}

const DocumentList: React.FC<DocumentListProps> = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await getUploadedDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (documentId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This will also remove all associated chunks from the knowledge base.`)) {
      return;
    }

    setDeletingId(documentId);
    const result = await deleteDocument(documentId);

    if (result.success) {
      await loadDocuments();
    } else {
      alert(`Failed to delete document: ${result.error}`);
    }

    setDeletingId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileTypeLabel = (mimeType: string): string => {
    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
      'application/vnd.ms-powerpoint': 'PowerPoint',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'application/vnd.ms-excel': 'Excel',
      'text/plain': 'Text',
      'text/markdown': 'Markdown',
      'image/jpeg': 'Image',
      'image/png': 'Image',
      'image/gif': 'Image',
    };
    return typeMap[mimeType] || 'Document';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-mn-primary mb-4">Uploaded Documents</h3>
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-mn-primary mb-4">Uploaded Documents</h3>
        <div className="text-center py-8">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No documents uploaded yet</p>
          <p className="text-sm text-gray-400 mt-2">Upload your first document using the form above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-mn-primary mb-4">
        Uploaded Documents ({documents.length})
      </h3>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <FileText className="h-6 w-6 text-mn-accent-teal flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{doc.filename}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>{getFileTypeLabel(doc.file_type)}</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>{doc.chunk_count} chunks</span>
                  <span className="truncate">{formatDate(doc.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(doc.processing_status)}
                <span className={`text-sm font-medium ${
                  doc.processing_status === 'completed' ? 'text-green-600' :
                  doc.processing_status === 'failed' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {getStatusText(doc.processing_status)}
                </span>
              </div>

              <button
                onClick={() => handleDelete(doc.id, doc.filename)}
                disabled={deletingId === doc.id}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Delete document"
              >
                <Trash2 className={`h-5 w-5 ${
                  deletingId === doc.id ? 'text-red-400 animate-pulse' : 'text-gray-400 group-hover:text-red-600'
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.some(doc => doc.processing_status === 'failed') && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Some documents failed to process</p>
            <p>Try deleting and re-uploading the failed documents. If the issue persists, check the file format and content.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
