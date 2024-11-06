# Document Capture Prototype - Technical Assessment

## Features Demonstrated
1. Document Information Extraction
   - Name extraction from OCR
   - Document number identification
   - Expiration date parsing

2. Advanced Security Features
   - Face detection with confidence scoring
   - Fraud detection algorithms
   - Multiple document type support
   - ML-based validation

## Technical Implementation
- Frontend: React + TypeScript
- Backend: Node.js + Express
- OCR: Tesseract.js
- ML Models: TensorFlow.js
- Face Detection: TensorFlow Face-API
- Validation: Custom ML models

## Screenshots
1. Document Upload Interface (01_upload_interface.png)
   - Drag-and-drop functionality
   - Webcam capture support
   - Multiple document type handling

2. Processing Results (02_processing_results.png)
   - Extracted information display
   - Face detection results
   - Fraud detection analysis
   - Validation confidence scores

## API Documentation
```typescript
POST /api/documents/extract
Content-Type: multipart/form-data

Response:
{
  "success": boolean,
  "extractedData": {
    "name": string,
    "documentNumber": string,
    "expirationDate": string
  },
  "documentType": "passport" | "driver_license" | "id_card",
  "fraudDetectionResults": Array<{
    "check": string,
    "passed": boolean,
    "confidence": number,
    "details": string
  }>,
  "faceDetection": {
    "faceDetected": boolean,
    "confidence": number,
    "landmarks": Array<{x: number, y: number}>
  },
  "confidence": number,
  "isValid": boolean
}
```

## Testing Instructions
1. Start the backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Access the application at http://localhost:3000
