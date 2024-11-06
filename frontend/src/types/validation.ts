import '@tensorflow/tfjs';

export type DocumentType = 'passport' | 'driver_license' | 'id_card';

export interface FaceDetectionResult {
  faceDetected: boolean;
  confidence: number;
  landmarks?: Array<{x: number; y: number}>;
}

export interface ExtractedData {
  name: string;
  documentNumber: string;
  expirationDate: string;
}

export interface FraudDetectionCheck {
  check: string;
  passed: boolean;
  confidence: number;
  details?: string;
}

export interface ValidationResult {
  success: boolean;
  error?: string;
  extractedData: ExtractedData;
  documentType: DocumentType;
  fraudDetectionResults: FraudDetectionCheck[];
  confidence: number;
  isValid: boolean;
}

export interface DocumentProcessingResult extends ValidationResult {
  faceDetection: FaceDetectionResult;
}
