import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface VideoReferenceProps {
  url: string;
  title?: string;
  timestamp?: string;
}

const VideoReference: React.FC<VideoReferenceProps> = ({ url, title, timestamp }) => {
  const getVideoThumbnail = (url: string): string | null => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return null;
    }

    return null;
  };

  const getVideoLink = (url: string, timestamp?: string): string => {
    if (!timestamp) return url;

    const timeMatch = timestamp.match(/(\d+):(\d+)(?::(\d+))?/);
    if (!timeMatch) return url;

    const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
    const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${totalSeconds}s`;
    }

    if (url.includes('vimeo.com')) {
      return `${url}#t=${totalSeconds}s`;
    }

    return url;
  };

  const thumbnail = getVideoThumbnail(url);
  const videoLink = getVideoLink(url, timestamp);

  return (
    <a
      href={videoLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-2 bg-mn-neutral-lightblue bg-opacity-20 hover:bg-opacity-30 border border-mn-accent-teal rounded-lg p-3 transition-all group"
    >
      {thumbnail ? (
        <div className="relative w-20 h-12 flex-shrink-0 rounded overflow-hidden">
          <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Play className="h-6 w-6 text-white" />
          </div>
        </div>
      ) : (
        <div className="bg-mn-accent-teal rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Play className="h-5 w-5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-mn-primary group-hover:text-mn-accent-teal transition-colors truncate">
          {title || 'Watch Video'}
        </div>
        {timestamp && (
          <div className="text-xs text-gray-600">
            Start at {timestamp}
          </div>
        )}
      </div>
      <ExternalLink className="h-4 w-4 text-mn-accent-teal flex-shrink-0" />
    </a>
  );
};

export default VideoReference;
