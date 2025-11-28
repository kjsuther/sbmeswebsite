import React, { useState } from 'react';
import { TestTube, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const MuralTester: React.FC = () => {
  const [muralUrl, setMuralUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    content?: string;
    error?: string;
    metadata?: {
      elementsFound?: number;
      processingTime?: number;
      extractionMethod?: string;
    };
  } | null>(null);

  const handleExtract = async () => {
    if (!muralUrl.trim()) {
      setResult({
        success: false,
        error: 'Please enter a Mural board URL',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-mural-extraction`;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: muralUrl,
          username: username || undefined,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract content');
      }

      setResult(data);
    } catch (error) {
      console.error('Error extracting Mural content:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMuralUrl('');
    setUsername('');
    setPassword('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <TestTube className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Mural Content Extraction Tester</h3>
            <p className="text-sm text-blue-700 mt-1">
              Test extracting text content from Mural boards. This will help determine if automated extraction
              is feasible for your boards before implementing the full content search feature.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="muralUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Mural Board URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="muralUrl"
              value={muralUrl}
              onChange={(e) => setMuralUrl(e.target.value)}
              placeholder="https://app.mural.co/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the full URL of the Mural board you want to test
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Optional: Authentication (if board requires login)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username/Email
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave blank if the board is shared with visitor access
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleExtract}
              disabled={isLoading || !muralUrl.trim()}
              className="flex items-center space-x-2 bg-mn-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <TestTube className="h-5 w-5" />
                  <span>Extract Content</span>
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            {result.success ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Extraction Successful</h3>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">Extraction Failed</h3>
              </>
            )}
          </div>

          {result.success && result.metadata && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Extraction Metadata</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {result.metadata.elementsFound !== undefined && (
                  <div>
                    <span className="text-gray-600">Elements Found:</span>
                    <span className="ml-2 font-semibold">{result.metadata.elementsFound}</span>
                  </div>
                )}
                {result.metadata.processingTime !== undefined && (
                  <div>
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="ml-2 font-semibold">{result.metadata.processingTime}ms</span>
                  </div>
                )}
                {result.metadata.extractionMethod && (
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <span className="ml-2 font-semibold">{result.metadata.extractionMethod}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.success && result.content && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-700">Extracted Content</h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.content || '');
                  }}
                  className="text-sm text-mn-primary hover:text-blue-700 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {result.content}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Character count: {result.content.length.toLocaleString()}
              </p>
            </div>
          )}

          {result.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{result.error}</p>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-red-900">Troubleshooting Tips:</p>
                <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                  <li>Verify the Mural board URL is correct and accessible</li>
                  <li>Check if the board requires authentication (try providing credentials)</li>
                  <li>Ensure the board has visitor access enabled if not using credentials</li>
                  <li>Try accessing the board in your browser first to confirm it loads</li>
                </ul>
              </div>

              {muralUrl && (
                <div className="mt-4">
                  <a
                    href={muralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-mn-primary hover:text-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open board in new tab to verify access</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">What This Tests</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Whether the Mural board URL is accessible</li>
          <li>If visitor access works without authentication</li>
          <li>If provided credentials can authenticate successfully</li>
          <li>What content can be extracted from the board</li>
          <li>The feasibility of automated extraction for your specific boards</li>
        </ul>
      </div>
    </div>
  );
};

export default MuralTester;
