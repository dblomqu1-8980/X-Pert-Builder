
export enum Platform {
  X = 'X (Twitter)',
  LINKEDIN = 'LinkedIn'
}

export enum PostStyle {
  PROFESSIONAL = 'Professional & Insightful',
  HYPE = 'Excited & Hype',
  EDUCATIONAL = 'Educational & Tutorial',
  CONTRARIAN = 'Skeptical & Contrarian',
  MEME = 'Witty & Casual'
}

export enum PostType {
  SINGLE = 'Short Post',
  THREAD = 'Thread / Long-form'
}

export interface PostOption {
  content: string[]; // Array of strings. If X thread, multiple items. If LI, usually 1 item.
  reasoning: string; // Why the AI wrote it this way
}

export interface GeneratedResult {
  options: PostOption[];
  sources?: Array<{ title: string; uri: string }>; // For grounding
  imageData?: string; // Base64 encoded image string
}

export interface GenerateRequest {
  topic: string;
  style: PostStyle;
  type: PostType;
  platform: Platform;
  useSearch: boolean;
  generateImage: boolean;
}
