export enum TweetStyle {
  PROFESSIONAL = 'Professional & Insightful',
  HYPE = 'Excited & Hype',
  EDUCATIONAL = 'Educational & Tutorial',
  CONTRARIAN = 'Skeptical & Contrarian',
  MEME = 'Witty & Casual'
}

export enum PostType {
  SINGLE = 'Single Tweet',
  THREAD = 'Thread (3-5 tweets)'
}

export interface TweetOption {
  content: string[]; // Array of strings. If single tweet, length is 1.
  reasoning: string; // Why the AI wrote it this way
}

export interface GeneratedResult {
  options: TweetOption[];
  sources?: Array<{ title: string; uri: string }>; // For grounding
}

export interface GenerateRequest {
  topic: string;
  style: TweetStyle;
  type: PostType;
  useSearch: boolean;
}