import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { getRelatedContent, SearchResult } from '../lib/searchService';

interface RelatedContentProps {
  contentId: string;
  contentType: string;
  title?: string;
}

const RelatedContent: React.FC<RelatedContentProps> = ({ contentId, contentType, title }) => {
  const navigate = useNavigate();
  const [relatedItems, setRelatedItems] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRelatedContent();
  }, [contentId, contentType]);

  const loadRelatedContent = async () => {
    setIsLoading(true);
    try {
      const items = await getRelatedContent(contentId, contentType, 5);
      setRelatedItems(items);
    } catch (error) {
      console.error('Error loading related content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'conversation':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleItemClick = (item: SearchResult) => {
    if (item.url) {
      navigate(item.url);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-mn-accent-teal" />
        <h3 className="text-lg font-semibold text-mn-primary">Related Content</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Content similar to {title || 'this page'}
      </p>

      <div className="space-y-3">
        {relatedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="p-4 border border-gray-200 rounded-lg hover:border-mn-accent-teal hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {item.title}
                  </h4>
                  <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {Math.round(item.relevance_score * 100)}% match
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <Link
          to={`/search?related=${contentId}`}
          className="text-sm text-mn-accent-teal hover:text-mn-primary font-medium"
        >
          View all related content
        </Link>
      </div>
    </div>
  );
};

export default RelatedContent;
