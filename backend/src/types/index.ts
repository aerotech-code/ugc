// User & Session Models
export interface User {
  id: string;
  email: string;
  role: 'applicant' | 'reviewer' | 'admin';
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  department?: string;
  position?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  applicationId?: string;
  status: 'active' | 'closed' | 'waiting';
  assignedAgent?: string;
  metadata: SessionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMetadata {
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
}

// Message Models
export interface Message {
  id: string;
  sessionId: string;
  sender: 'user' | 'agent' | 'system' | 'bot';
  type: 'text' | 'file' | 'form' | 'template';
  content: MessageContent;
  attachments?: Attachment[];
  metadata: MessageMetadata;
  timestamp: Date;
  readBy: string[];
}

export interface MessageContent {
  text?: string;
  formData?: Record<string, unknown>;
  templateId?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface MessageMetadata {
  intent?: string;
  confidence?: number;
  aiGenerated?: boolean;
}

export interface ApplicationRequest {
  id: string;
  sessionId: string;
  type: string; // 'leave', 'expense', 'access', etc.
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  formData: Record<string, unknown>;
  documents: Document[];
  timeline: StatusChange[];
  submittedAt?: Date;
  completedAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface StatusChange {
  status: string;
  changedAt: Date;
  changedBy: string;
  comment?: string;
}

// API Response types
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiResponse<T = unknown> implements IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;

  constructor(statusCode: number, data?: T, message?: string) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.data = data;
    this.message = message || (this.success ? 'Success' : 'Error');
    this.status = statusCode;
  }
}

export interface PaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}