import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PhotoCamera, Upload as UploadIcon } from '@mui/icons-material';
import FaceDetection from '../FaceDetection';
import ValidationResults from '../ValidationResults';
import { documentValidator } from '../../services/DocumentValidator';
import { DocumentProcessingResult } from '../../types/validation';

const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const DropzoneArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

interface DocumentUploaderProps {
  onValidationComplete?: (result: DocumentProcessingResult) => void;
  isProcessing?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onValidationComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<DocumentProcessingResult | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const processDocument = async (imageData: ImageData) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await documentValidator.validateDocument(imageData);
      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (err) {
      setError('Error processing document. Please try again.');
      console.error('Document processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Create ImageData from File
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Error processing image');
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      processDocument(imageData);
    };
    img.src = url;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const captureWebcam = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('Failed to capture image from webcam');
      return;
    }

    setImageUrl(imageSrc);

    // Create ImageData from webcam capture
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Error processing webcam image');
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      processDocument(imageData);
    };
    img.src = imageSrc;
  }, []);

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    setFile(null);
    setValidationResult(null);
    setError(null);
  };

  return (
    <UploadContainer>
      <Typography variant="h5" gutterBottom>
        Document Upload
      </Typography>

      {!isWebcamActive ? (
        <Box width="100%">
          <DropzoneArea {...getRootProps()}>
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
            <Typography>
              {isDragActive
                ? 'Drop the document here'
                : 'Drag and drop a document, or click to select'}
            </Typography>
          </DropzoneArea>
          <Button
            startIcon={<PhotoCamera />}
            onClick={toggleWebcam}
            sx={{ mt: 2 }}
            fullWidth
            variant="outlined"
          >
            Use Webcam
          </Button>
        </Box>
      ) : (
        <Box width="100%">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', borderRadius: 8 }}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              onClick={captureWebcam}
              variant="contained"
              startIcon={<PhotoCamera />}
              fullWidth
            >
              Capture
            </Button>
            <Button onClick={toggleWebcam} variant="outlined" fullWidth>
              Cancel
            </Button>
          </Stack>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      {imageUrl && !isProcessing && (
        <FaceDetection imageUrl={imageUrl} />
      )}

      {validationResult && (
        <ValidationResults
          result={validationResult}
          isLoading={isProcessing}
          error={error}
        />
      )}

      {isProcessing && (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <Typography>Processing document...</Typography>
        </Box>
      )}
    </UploadContainer>
  );
};

export default DocumentUploader;
