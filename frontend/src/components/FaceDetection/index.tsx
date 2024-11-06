import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Box, Typography, CircularProgress } from '@mui/material';

interface FaceDetectionProps {
  imageUrl: string;
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectFace = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load the model
        const model = await blazeface.load();

        // Load and prepare the image
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Create a canvas to get image data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        ctx.drawImage(img, 0, 0);

        // Run face detection
        const predictions = await model.estimateFaces(img, false);

        if (predictions.length > 0) {
          // Use the highest confidence score
          const highestConfidence = Math.max(...predictions.map(p => p.probability[0]));
          setConfidence(highestConfidence);
        } else {
          setError('No face detected in the document');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error detecting face');
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUrl) {
      detectFace();
    }
  }, [imageUrl]);

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Face Detection Results
      </Typography>

      {isLoading && (
        <Box display="flex" alignItems="center">
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Analyzing face...</Typography>
        </Box>
      )}

      {!isLoading && confidence !== null && (
        <Typography color="success.main">
          Face detected with {(confidence * 100).toFixed(1)}% confidence
        </Typography>
      )}

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FaceDetection;
