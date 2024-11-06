import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { ValidationResult } from '../../types/validation';

interface ValidationResultsProps {
  result: ValidationResult;
  isLoading: boolean;
  error: string | null;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  result,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={2}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography>Processing validation results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3, bgcolor: '#f8f8f8' }}>
      <Typography variant="h6" gutterBottom>
        Document Validation Results
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Extracted Information:
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography>Name: {result.extractedData.name}</Typography>
          <Typography>Document Number: {result.extractedData.documentNumber}</Typography>
          <Typography>Expiration Date: {result.extractedData.expirationDate}</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Document Type: {result.documentType}
        </Typography>
        <Typography>
          Confidence: {(result.confidence * 100).toFixed(1)}%
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Fraud Detection Results:
        </Typography>
        <Box sx={{ pl: 2 }}>
          {result.fraudDetectionResults.map((check, index) => (
            <Typography key={index} color={check.passed ? 'success.main' : 'error.main'}>
              {check.check}: {check.passed ? 'Passed' : 'Failed'}
              {check.confidence && ` (${(check.confidence * 100).toFixed(1)}% confidence)`}
              {check.details && ` - ${check.details}`}
            </Typography>
          ))}
        </Box>
      </Box>

      <Typography
        variant="h6"
        sx={{ mt: 2, color: result.isValid ? 'success.main' : 'error.main' }}
      >
        Overall Status: {result.isValid ? 'Valid' : 'Invalid'} Document
      </Typography>
    </Paper>
  );
};

export default ValidationResults;
