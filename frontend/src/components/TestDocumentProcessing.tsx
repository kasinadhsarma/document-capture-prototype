import React, { useEffect, useState } from 'react';
import SimpleDocumentValidator from '../services/SimpleDocumentValidator';
import { ValidationResult, FaceDetectionResult } from '../types/validation';

const TestDocumentProcessing: React.FC = () => {
  const [validator] = useState(new SimpleDocumentValidator());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDocument = async () => {
      try {
        // Load sample passport image
        const img = new Image();
        img.src = '/sample_passport.jpg';
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Test document validation
        const result = await validator.validateDocument(img);
        setValidationResult(result);

        // Test face detection
        const faceResult = await validator.detectFaces(img);
        setFaceDetectionResult(faceResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    testDocument();
  }, [validator]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Document Processing Test Results</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {validationResult && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Document Validation Results</h3>
          <pre>{JSON.stringify(validationResult, null, 2)}</pre>
        </div>
      )}

      {faceDetectionResult && (
        <div>
          <h3>Face Detection Results</h3>
          <pre>{JSON.stringify(faceDetectionResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestDocumentProcessing;
