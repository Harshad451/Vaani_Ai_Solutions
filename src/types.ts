/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SenderType = 'CUSTOMER' | 'AI' | 'AGENT' | 'SYSTEM';
export type TicketStatus = 'AI_PENDING' | 'RESOLVED' | 'ESCALATED';

export interface Message {
  id: string;
  sender: SenderType;
  content: string;
  createdAt: string;
  intent?: string;
  confidence?: number;
  sentiment?: string;
  detectedLanguage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  itemName: string;
  status: string;
  paymentMode: string;
  cost: number;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  phoneNumber: string;
  status: TicketStatus;
  detectedLanguage?: string;
  lastIntent?: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Angry';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  humanRequested?: boolean;
  escalationDismissed?: boolean;
  slaExpiresAt?: string;
  assignedToId?: string;
  assignedToName?: string;
  rating?: number;
  ratingFeedback?: string;
  copilotSuggestion?: string;
  orderId?: string;
  orderDetail?: Order;
  channel?: 'WHATSAPP' | 'WEB' | 'EMAIL' | 'SMS';
  languagePreference?: string;
  awaitingLanguageSelection?: boolean;
  customerEmail?: string;
  resolvedEmailPreview?: {
    subject: string;
    from: string;
    to: string;
    html: string;
    sentAt: string;
  };
  companyName?: string;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  companyName?: string;
}

export interface DatasetItem {
  id: string;
  query: string;
  language: string;
  intent: string;
  sentiment: string;
  shouldEscalate: boolean;
  expectedReply: string;
  scriptType: 'Native' | 'Latin/Transliterated' | 'Code-Mixed';
}

export interface AndroidFile {
  path: string;
  name: string;
  content: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'json';
  description: string;
}
