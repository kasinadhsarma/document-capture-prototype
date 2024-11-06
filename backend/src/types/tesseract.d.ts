declare module 'tesseract.js' {
  export interface WorkerOptions {
    logger?: (arg: any) => void;
  }

  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      lines: Array<{
        text: string;
        confidence: number;
      }>;
    };
  }

  export interface Worker {
    load(): Promise<void>;
    loadLanguage(lang: string): Promise<void>;
    initialize(lang: string): Promise<void>;
    terminate(): Promise<void>;
    recognize(
      image: string | Buffer | ImageLike,
      options?: { logger?: (arg: any) => void }
    ): Promise<RecognizeResult>;
  }

  export interface ImageLike {
    width: number;
    height: number;
    data: Uint8Array | Uint8ClampedArray;
  }

  export interface CreateWorkerOptions {
    logger?: (arg: any) => void;
    errorHandler?: (arg: any) => void;
  }

  export function createWorker(options?: CreateWorkerOptions): Promise<Worker>;
}

declare module 'mrz' {
  export interface MRZFields {
    documentCode?: string;
    documentNumber?: string;
    firstName?: string | null;
    lastName?: string | null;
    nationality?: string;
    sex?: string;
    expirationDate?: string;
    personalNumber?: string;
    birthDate?: string;
    issuingState?: string;
  }

  export interface MRZResult {
    valid: boolean;
    fields: MRZFields;
    details: Array<{
      line: string;
      valid: boolean;
      fields: { [key: string]: string };
      validation: { [key: string]: boolean };
    }>;
  }

  export function parse(text: string): MRZResult;
}
