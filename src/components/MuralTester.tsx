import React, { useState } from 'react';
import { TestTube, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const MuralTester: React.FC = () => {
  const [muralUrl, setMuralUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
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
          apiKey: apiKey || undefined,
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
    setApiKey('');
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
              Test extracting text content from Mural boards using ScrapingDog (JavaScript rendering) or browser automation.
              This tester will handle dynamic content and extract all visible text from the board.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Browser Automation Required</h4>
            <p className="text-sm text-amber-700 mt-1">
              Mural boards render content dynamically with JavaScript and require clicking "Enter as visitor"
              buttons. This tester uses headless browser automation (Puppeteer) to:
            </p>
            <ul className="text-sm text-amber-700 mt-2 ml-4 space-y-1 list-disc">
              <li>Load the Mural board in a real browser environment</li>
              <li>Automatically click "Enter as visitor" buttons</li>
              <li>Wait for content to fully load</li>
              <li>Extract all visible text from the rendered board</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2 font-medium">
              Note: Extraction may take 10-30 seconds due to browser automation overhead.
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

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              ScrapingDog API Key (Optional)
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ScrapingDog API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, uses ScrapingDog for faster extraction. Otherwise falls back to browser automation.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Extraction Mode
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-600">
                {apiKey ? (
                  <>Uses ScrapingDog API for JavaScript rendering and content extraction (faster, ~5-10 seconds)</>
                ) : (
                  <>Falls back to browser automation to click "Enter as visitor" and extract content (~10-30 seconds)</>
                )}
              </p>
            </div>
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
                  <span>{apiKey ? 'Extract with ScrapingDog' : 'Extract with Browser Automation'}</span>
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
        <h4 className="font-semibold text-sm text-gray-700 mb-2">How This Works</h4>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">With ScrapingDog API:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-2">
              <li>Renders JavaScript content using headless browsers</li>
              <li>Waits for dynamic content to load (10 seconds)</li>
              <li>Extracts all text from SVG elements and visible content</li>
              <li>Faster processing (~5-10 seconds)</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Without API Key (Browser Automation):</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-2">
              <li>Launches headless browser with full automation</li>
              <li>Clicks "Enter as visitor" buttons automatically</li>
              <li>Waits for canvas and content to fully render</li>
              <li>Slower but more interactive (~10-30 seconds)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuralTester;
