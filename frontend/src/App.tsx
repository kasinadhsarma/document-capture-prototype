import React, { useCallback, useState } from 'react';
import './App.css';
import { DocumentUpload } from './components/DocumentUpload';
import SimpleDocumentValidator from './services/SimpleDocumentValidator';
import { DocumentProcessingResult } from './types/validation';
import TestDocumentProcessing from './components/TestDocumentProcessing';

const validator = new SimpleDocumentValidator();

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<DocumentProcessingResult | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);

      // Create an image element to get ImageData
      const img = new Image();
      img.src = URL.createObjectURL(file);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create canvas to get ImageData
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Process document
      const result = await validator.validateDocument(imageData);
      const faceDetectionResult = await validator.detectFaces(imageData);

      const fullResult: DocumentProcessingResult = {
        ...result,
        faceDetection: faceDetectionResult,
        success: true,
        isValid: result.confidence > 0.7
      };

      setValidationResult(fullResult);
      return fullResult;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleWebcamCapture = useCallback(async (imageSrc: string) => {
    try {
      setIsProcessing(true);

      // Create an image element to get ImageData
      const img = new Image();
      img.src = imageSrc;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create canvas to get ImageData
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Process document
      const result = await validator.validateDocument(imageData);
      const faceDetectionResult = await validator.detectFaces(imageData);

      const fullResult: DocumentProcessingResult = {
        ...result,
        faceDetection: faceDetectionResult,
        success: true,
        isValid: result.confidence > 0.7
      };

      setValidationResult(fullResult);
      return fullResult;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="App">
      <DocumentUpload
        onFileUpload={handleFileUpload}
        onWebcamCapture={handleWebcamCapture}
        isProcessing={isProcessing}
      />
      {validationResult && (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h3>Validation Results</h3>
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            {JSON.stringify(validationResult, null, 2)}
          </pre>
        </div>
      )}
      <TestDocumentProcessing />
    </div>
  );
}

export default App;
