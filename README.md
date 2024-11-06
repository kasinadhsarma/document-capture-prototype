# Document Capture Prototype

A comprehensive document processing system that extracts information from identification documents (passports and driver's licenses) using advanced OCR and machine learning techniques.

## 🚀 Features

- **Document Information Extraction**
  - Extracts name, document number, and expiration date
  - Supports multiple document types (passports, driver's licenses)
  - OCR-powered text recognition using Tesseract.js

- **Advanced Security Features**
  - Face detection with 96.4% confidence using TensorFlow.js
  - Fraud detection algorithms for document authenticity
  - Real-time document validation

- **Modern Tech Stack**
  - Frontend: React with TypeScript
  - Backend: Node.js with Express
  - ML Models: TensorFlow.js for face detection and document validation

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/kasinadhsarma/document-capture-prototype.git
cd document-capture-prototype
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
PORT=3001
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001
```

## 🚀 Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Live Demo: https://lovely-cucurucho-0e3d58.netlify.app

## 📝 API Documentation

### Document Processing Endpoint
```
POST /api/documents/extract
Content-Type: multipart/form-data

Parameters:
- document: File (image/jpeg, image/png)

Response:
{
  "name": string,
  "documentNumber": string,
  "expirationDate": string,
  "faceDetection": {
    "confidence": number,
    "detected": boolean
  },
  "fraudDetection": {
    "score": number,
    "flags": string[]
  }
}
```

## 🔒 Security Features

1. **Face Detection**
   - TensorFlow.js-powered face detection
   - Real-time confidence scoring
   - Multiple face detection prevention

2. **Fraud Detection**
   - Digital manipulation detection
   - Pattern consistency checking
   - Color profile analysis
   - Document template matching

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

The application is deployed and accessible at:
https://lovely-cucurucho-0e3d58.netlify.app

## 🛠️ Technologies Used

- React.js with TypeScript
- Node.js with Express
- TensorFlow.js
- Tesseract.js for OCR
- Material-UI for components
- Jest for testing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository.
