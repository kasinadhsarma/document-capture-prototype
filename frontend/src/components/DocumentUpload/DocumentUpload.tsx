import React, { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import SimpleDocumentValidator from '../../services/SimpleDocumentValidator';
import { ValidationResult } from '../../types/validation';
import ValidationResults from '../ValidationResults/ValidationResults';
import './DocumentUpload.css';

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validator = new SimpleDocumentValidator();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessing(true);
    console.log('Processing file:', selectedFile.name);

    try {
      const img = new Image();
      img.onload = async () => {
        console.log('Image loaded, dimensions:', img.width, 'x', img.height);
        try {
          const result = await validator.validateDocument(img);
          console.log('Validation result:', result);
          setValidationResult(result);
        } catch (error) {
          console.error('Validation error:', error);
        }
        setProcessing(false);
      };
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        setProcessing(false);
      };
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error processing document:', error);
      setProcessing(false);
    }
  };

  return (
    <Box data-testid="document-upload" sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Document Upload
      </Typography>

      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          mb: 2,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          data-testid="file-input"
        />
        <Typography>
          {processing ? (
            <CircularProgress size={24} />
          ) : (
            'Drag and drop a document here, or click to select'
          )}
        </Typography>
      </Box>

      {validationResult && (
        <Box data-testid="validation-container">
          <ValidationResults result={validationResult} />
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
