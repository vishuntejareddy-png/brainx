/**
 * Global TypeScript type definitions for Industrial Brain AI.
 */

// ─── Documents ────────────────────────────────────────────────────────────────

export type DocumentStatus =
  | "Indexed"
  | "Processing"
  | "Failed"
  | "Review Required"
  | "Archived";

export type DocumentType =
  | "Manual"
  | "SOP"
  | "Inspection"
  | "Incident"
  | "Log"
  | "Work Order"
  | "Engineering Drawing"
  | "Technical Specification";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  equipment: string;
  uploadedAt: string;
  status: DocumentStatus;
}

export interface DocumentRow {
  id: string;
  name: string;
  type: DocumentType;
  equipment: string;
  department: string;
  version: string;
  updatedAt: string;
  status: DocumentStatus;
  owner: string;
  fileSize: string;
  summary: string;
  relatedEquipment: string[];
  relatedDocs: string[];
  aiInsights: string[];
  recommendedAction: string;
}


// ─── Equipment ────────────────────────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  criticality: "Low" | "Medium" | "High";
}

// ─── AI Copilot ───────────────────────────────────────────────────────────────

export interface RecentQuestion {
  id: string;
  question: string;
  result: string;
}

export type MessageRole = "user" | "assistant";

export interface Source {
  id: string;
  reference: string;
  excerpt: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sources?: Source[];
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export type TrendDirection = "up" | "down" | "neutral";

// ─── Maintenance ──────────────────────────────────────────────────────────────

export type MaintenancePriority = "Low" | "Medium" | "High" | "Critical";

export interface MaintenanceRecommendation {
  id: string;
  equipment: string;
  issue: string;
  priority: MaintenancePriority;
  aiSummary: string;
  relatedDocuments: string[];
  createdAt: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export type UploadStatus = "Uploading" | "Processing" | "Indexed" | "Failed";

export interface UploadQueueItem {
  id: string;
  name: string;
  fileType: string;
  progress: number;
  status: UploadStatus;
}

export interface RecentUpload {
  id: string;
  name: string;
  equipment: string;
  department: string;
  uploadedBy: string;
  time: string;
  status: UploadStatus;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  status: UploadStatus;
}
