import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DocumentProcessingResult } from '../types/validation';

interface DocumentUploadProps {
  onFileUpload: (file: File) => Promise<DocumentProcessingResult>;
  onWebcamCapture: (imageSrc: string) => Promise<DocumentProcessingResult>;
  isProcessing: boolean;
}

const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  margin: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const DropzoneArea = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  width: '100%',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  }
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  marginTop: '16px',
  borderRadius: '4px'
});

const WebcamContainer = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px'
});

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileUpload,
  onWebcamCapture,
  isProcessing
}) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [validationResult, setValidationResult] = useState<DocumentProcessingResult | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    try {
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      setError(null);
      const result = await onFileUpload(file);
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing document');
      setValidationResult(null);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const handleWebcamCapture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    try {
      setPreview(imageSrc);
      setError(null);
      const result = await onWebcamCapture(imageSrc);
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error capturing image');
      setValidationResult(null);
    }
  }, [onWebcamCapture]);

  return (
    <UploadContainer>
      <Typography variant="h5" gutterBottom>Document Upload</Typography>
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        {!showWebcam ? (
          <DropzoneArea {...getRootProps()}>
            <input {...getInputProps()} />
            <Typography>Drag and drop a document here, or click to select</Typography>
          </DropzoneArea>
        ) : (
          <WebcamContainer>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
            <Button onClick={handleWebcamCapture} disabled={isProcessing}>Capture</Button>
          </WebcamContainer>
        )}
        <Button onClick={() => setShowWebcam(!showWebcam)} sx={{ mt: 2 }}>
          {showWebcam ? 'Switch to File Upload' : 'Switch to Webcam'}
        </Button>
        {isProcessing && <CircularProgress sx={{ mt: 2 }} />}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {preview && <PreviewImage src={preview} alt="Document preview" />}
        {validationResult && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <pre>{JSON.stringify(validationResult, null, 2)}</pre>
          </Box>
        )}
      </Box>
    </UploadContainer>
  );
};
