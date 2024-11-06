import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { ValidationResult } from '../../types/validation';

interface ValidationResultsProps {
  result?: ValidationResult;
  isLoading?: boolean;
  error?: string | null;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  result,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Validating document...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!result || !result.extractedData) {
    return null;
  }

  const getConfidenceColor = (confidence: number): "success" | "warning" | "error" => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "error";
  };

  const getStatusIcon = (passed: boolean, confidence: number) => {
    if (!passed) return <ErrorIcon color="error" />;
    return confidence >= 0.8 ? (
      <CheckCircleIcon color="success" />
    ) : (
      <WarningIcon color="warning" />
    );
  };

  return (
    <Card sx={{ mt: 3 }} data-testid="validation-results">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Document Validation Results
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Document Type:
            <Chip
              label={result.documentType.replace('_', ' ').toUpperCase()}
              color="primary"
              sx={{ ml: 1 }}
            />
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Overall Status:
            <Chip
              label={result.isValid ? 'VALID' : 'INVALID'}
              color={result.isValid ? 'success' : 'error'}
              sx={{ ml: 1 }}
            />
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Confidence Score:
            <Chip
              label={`${(result.confidence * 100).toFixed(1)}%`}
              color={getConfidenceColor(result.confidence)}
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Extracted Information
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Name"
              secondary={result.extractedData.name}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Document Number"
              secondary={result.extractedData.documentNumber}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Expiration Date"
              secondary={result.extractedData.expirationDate}
            />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Validation Checks
        </Typography>
        <List>
          {result.fraudDetectionResults.map((check, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {getStatusIcon(check.passed, check.confidence)}
              </ListItemIcon>
              <ListItemText
                primary={check.check}
                secondary={
                  <>
                    Confidence: {(check.confidence * 100).toFixed(1)}%
                    {check.details && ` • ${check.details}`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ValidationResults;
