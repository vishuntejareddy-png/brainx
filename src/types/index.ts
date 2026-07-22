
export type DocType =
  | "Manual"
  | "SOP"
  | "Inspection"
  | "Incident"
  | "Log"
  | "Work Order"
  | "Engineering Drawing"
  | "Technical Specification";

export type DocStatus = "Indexed" | "Processing" | "Review Required" | "Archived";

export interface DocumentRow {
  id: string;
  name: string;
  type: DocType;
  equipment: string;
  department: string;
  version: string;
  updatedAt: string;
  status: DocStatus;
  owner: string;
  fileSize: string;
  summary: string;
  relatedEquipment: string[];
  relatedDocs: string[];
  aiInsights: string[];
  recommendedAction: string;
}

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
