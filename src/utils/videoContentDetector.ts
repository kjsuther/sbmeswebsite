export interface VideoMetadata {
  title: string;
  url: string;
  duration?: string;
  timestamps: VideoTimestamp[];
  relatedVideos: string[];
  hasTranscript: boolean;
}

export interface VideoTimestamp {
  time: string;
  topic: string;
  content: string;
}

export const detectVideoContent = (text: string): VideoMetadata | null => {
  const hasVideoIndicators =
    text.includes('Video URL:') ||
    text.includes('Video Title:') ||
    text.includes('video content') ||
    text.includes('Watch Video') ||
    text.includes('Timestamp') ||
    /\b\d{1,2}:\d{2}\b/g.test(text);

  if (!hasVideoIndicators) {
    return null;
  }

  const titleMatch = text.match(/Video Title:\s*(.+?)(?:\n|$)/i);
  const urlMatch = text.match(/Video URL:\s*(https?:\/\/[^\s\n]+)/i);
  const durationMatch = text.match(/Duration:\s*(.+?)(?:\n|$)/i);

  const timestamps: VideoTimestamp[] = [];
  const timestampPattern = /(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(?:\d{1,2}:\d{2}(?::\d{2})?)?[:\s]*(.+?)(?=\n(?:\d{1,2}:\d{2}|$)|$)/gi;
  let match;

  while ((match = timestampPattern.exec(text)) !== null) {
    const time = match[1];
    const content = match[2]?.trim();

    if (content && content.length > 3) {
      const topicMatch = content.match(/^([^:\n]+?)(?::|\n|$)/);
      const topic = topicMatch ? topicMatch[1].trim() : content.substring(0, 50);

      timestamps.push({
        time,
        topic,
        content: content.substring(0, 500)
      });
    }
  }

  const relatedVideoPattern = /(?:Related Videos?|See also|Watch next)[:\s]*([^\n]+(?:\n(?!#+|\n)[^\n]+)*)/gi;
  const relatedVideos: string[] = [];

  while ((match = relatedVideoPattern.exec(text)) !== null) {
    const videoLines = match[1].split('\n').filter(line => line.trim());
    relatedVideos.push(...videoLines.map(v => v.trim()).filter(v => v.length > 0));
  }

  const hasTranscript =
    text.toLowerCase().includes('transcript:') ||
    text.toLowerCase().includes('full transcript') ||
    text.match(/\[\d{2}:\d{2}\]/g) !== null;

  if (!titleMatch && !urlMatch && timestamps.length === 0) {
    return null;
  }

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Video Content',
    url: urlMatch ? urlMatch[1].trim() : '',
    duration: durationMatch ? durationMatch[1].trim() : undefined,
    timestamps,
    relatedVideos: relatedVideos.slice(0, 5),
    hasTranscript
  };
};

export const enhanceChunkWithVideoMetadata = (
  chunk: string,
  videoMetadata: VideoMetadata | null
): string => {
  if (!videoMetadata) {
    return chunk;
  }

  let enhanced = chunk;

  if (videoMetadata.url && !enhanced.includes(videoMetadata.url)) {
    enhanced = `[VIDEO: ${videoMetadata.title}]\n[URL: ${videoMetadata.url}]\n\n${enhanced}`;
  }

  if (videoMetadata.timestamps.length > 0) {
    const relevantTimestamps = videoMetadata.timestamps.filter(ts =>
      chunk.toLowerCase().includes(ts.topic.toLowerCase().substring(0, 20))
    );

    if (relevantTimestamps.length > 0) {
      const timestampInfo = relevantTimestamps
        .map(ts => `[${ts.time}] ${ts.topic}`)
        .join('; ');
      enhanced = `[VIDEO TIMESTAMPS: ${timestampInfo}]\n\n${enhanced}`;
    }
  }

  return enhanced;
};

export const extractVideoReferences = (text: string): string[] => {
  const urls: string[] = [];

  const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
  const vimeoPattern = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/gi;
  const genericVideoPattern = /https?:\/\/[^\s]+\.(?:mp4|webm|ogg|mov)/gi;

  let match;
  while ((match = youtubePattern.exec(text)) !== null) {
    urls.push(match[0]);
  }

  while ((match = vimeoPattern.exec(text)) !== null) {
    urls.push(match[0]);
  }

  while ((match = genericVideoPattern.exec(text)) !== null) {
    urls.push(match[0]);
  }

  return [...new Set(urls)];
};
