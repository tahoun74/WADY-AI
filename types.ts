export interface ExtensionTokenData {
  token: string;
  supplierId: string;
  userId: string;
  expiresAt: number;
}

export interface WadyPayload {
  text: string;
  page_url: string;
  source_hint: 'whatsapp_web' | 'generic_web';
  context?: {
    chat_name?: string;
    sender_display?: string;
    message_ts?: string;
  };
}

export enum MessageType {
  SAVE_TOKEN = 'SAVE_TOKEN',
  GET_CONTEXT = 'GET_CONTEXT',
  CONTEXT_RESULT = 'CONTEXT_RESULT',
  SHOW_NOTIFICATION = 'SHOW_NOTIFICATION'
}

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

export const STORAGE_KEY = 'wady_extension_auth';

export const API_BASE_URL = 'https://api.wady.ai/v1'; // Mock URL based on specs