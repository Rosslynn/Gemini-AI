
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Attachment {
  id: string;
  mimeType: string;
  data: string; // Base64
  previewUrl: string;
  name: string;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  searchEntryPoint?: { renderedContent: string };
  groundingChunks?: {
    web?: { uri: string; title: string };
  }[];
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isThinking?: boolean;
  attachments?: Attachment[];
  groundingMetadata?: GroundingMetadata;
}

export enum ModelType {
  FAST = 'gemini-2.5-flash',
  SMART = 'gemini-3-pro-preview',
}

export interface ChatSessionConfig {
  model: ModelType;
  temperature?: number;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
}
