import * as tf from '@tensorflow/tfjs';
import { documentValidator } from '../services/DocumentValidator';

export interface TestResult {
  documentType: string;
  extractedData: {
    name: string;
    documentNumber: string;
    expirationDate: string;
  };
  validationResults: {
    isValid: boolean;
    confidence: number;
    fraudDetectionResults: Array<{
      check: string;
      passed: boolean;
      confidence: number;
    }>;
  };
}

export async function testDocumentProcessing(imagePath: string): Promise<TestResult> {
  console.log('Starting document processing test...');

  try {
    // Force CPU backend
    await tf.setBackend('cpu');
    console.log('Using CPU backend for processing');

    // Load test image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const imageData = await new Promise<ImageData>((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, img.width, img.height));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imagePath;
    });

    // Process document
    const validationResult = await documentValidator.validateDocument(imageData);

    console.log('Document processing completed');
    console.log('Document type:', validationResult.documentType);
    console.log('Extracted data:', validationResult.extractedData);
    console.log('Validation results:', {
      isValid: validationResult.isValid,
      confidence: validationResult.confidence,
      fraudDetectionResults: validationResult.fraudDetectionResults
    });

    return {
      documentType: validationResult.documentType,
      extractedData: validationResult.extractedData,
      validationResults: {
        isValid: validationResult.isValid,
        confidence: validationResult.confidence,
        fraudDetectionResults: validationResult.fraudDetectionResults
      }
    };
  } catch (error) {
    console.error('Document processing test failed:', error);
    throw error;
  }
}

export default testDocumentProcessing;
