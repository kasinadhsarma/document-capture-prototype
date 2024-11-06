import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const DetectionContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 500,
  margin: theme.spacing(2.5, 0),
}));

const Canvas = styled('canvas')({
  position: 'absolute',
  top: 0,
  left: 0,
});

const ResultsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.25),
  padding: theme.spacing(1.25),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

interface FaceDetectionProps {
  imageUrl: string;
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [detectionResults, setDetectionResults] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        await tf.setBackend('webgl');
        const model = await blazeface.load();
        if (isMounted) {
          await detectFaces(model);
        }
      } catch (error) {
        console.error('Error loading model:', error);
        setDetectionResults('Error loading face detection model');
        setIsLoading(false);
      }
    };

    const detectFaces = async (model: blazeface.BlazeFaceModel) => {
      if (!imageRef.current || !canvasRef.current) return;

      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Wait for image to load
      await new Promise((resolve) => {
        if (img.complete) resolve(null);
        else img.onload = () => resolve(null);
      });

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Detect faces
      const predictions = await model.estimateFaces(img, false);

      if (predictions.length === 0) {
        setDetectionResults('No face detected in document');
        setConfidenceScore(0);
        setIsLoading(false);
        return;
      }

      // Draw detections
      ctx.drawImage(img, 0, 0, img.width, img.height);

      predictions.forEach((prediction: any) => {
        const start = prediction.topLeft as [number, number];
        const end = prediction.bottomRight as [number, number];
        const size = [end[0] - start[0], end[1] - start[1]];

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(start[0], start[1], size[0], size[1]);

        // Calculate confidence score
        const score = prediction.probability[0];
        setConfidenceScore(score);

        // Analyze face quality
        const isGoodQuality = score > 0.8;

        setDetectionResults(
          isGoodQuality
            ? 'Face detected with good quality'
            : 'Face detected but quality could be improved'
        );
      });

      setIsLoading(false);
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return (
    <DetectionContainer>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Face detection"
        style={{ width: '100%', visibility: 'hidden', position: 'absolute' }}
        crossOrigin="anonymous"
      />
      <Canvas ref={canvasRef} />

      {isLoading ? (
        <Box display="flex" alignItems="center" justifyContent="center" p={2}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Loading face detection...</Typography>
        </Box>
      ) : (
        <ResultsContainer>
          <Typography variant="h6">Face Detection Results</Typography>
          <Typography>
            {detectionResults}
            {confidenceScore > 0 && ` (Confidence: ${(confidenceScore * 100).toFixed(1)}%)`}
          </Typography>
        </ResultsContainer>
      )}
    </DetectionContainer>
  );
};

export default FaceDetection;
