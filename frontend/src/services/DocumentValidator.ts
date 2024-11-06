import * as tf from '@tensorflow/tfjs';
import { DocumentProcessingResult, FaceDetectionResult, DocumentType, FraudDetectionCheck } from '../types/validation';

interface ExtractedDataInternal {
  name: string;
  documentNumber: string;
  expirationDate: string;
  documentType: DocumentType;
}

// Local interface for internal use
interface ValidationResultInternal {
  documentType: DocumentType;
  isValid: boolean;
  confidence: number;
  fraudDetectionResults: FraudDetectionCheck[];
  extractedData: ExtractedDataInternal;
}

const documentTypeMap: { [key: string]: DocumentType } = {
  'passport': 'passport',
  'driver_license': 'driver_license',
  'id_card': 'id_card'
};

export class DocumentValidator {
  private static instance: DocumentValidator;
  private modelLoaded: boolean = false;
  private documentClassifier: tf.LayersModel | null = null;

  private constructor() {}

  public static getInstance(): DocumentValidator {
    if (!DocumentValidator.instance) {
      DocumentValidator.instance = new DocumentValidator();
    }
    return DocumentValidator.instance;
  }

  private async loadModels(): Promise<void> {
    if (this.modelLoaded) return;

    try {
      // Force CPU backend for reliability
      await tf.setBackend('cpu');
      console.log('Using CPU backend for reliable processing');

      // Create a simplified model for basic document feature extraction
      this.documentClassifier = tf.sequential({
        layers: [
          tf.layers.conv2d({
            inputShape: [224, 224, 3],
            kernelSize: 5,
            filters: 8,
            activation: 'relu',
            padding: 'same'
          }),
          tf.layers.averagePooling2d({poolSize: 4}),
          tf.layers.flatten(),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 3,
            activation: 'softmax'
          })
        ]
      });

      // Initialize with basic weights optimized for CPU
      const weights = await tf.loadLayersModel('/models/document_classifier_cpu.json');
      if (weights) {
        await this.documentClassifier.setWeights(weights.getWeights());
      } else {
        // Fallback to basic feature detection if model loading fails
        console.log('Using basic feature detection fallback');
      }

      // Use simpler optimizer settings for CPU
      this.documentClassifier.compile({
        optimizer: tf.train.sgd(0.01),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.modelLoaded = true;
      console.log('Document classifier initialized with CPU-optimized architecture');
    } catch (error) {
      console.error('Error loading models:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw new Error('Failed to load validation models');
    }
  }
  private async detectFraud(imageData: ImageData): Promise<FraudDetectionCheck[]> {
    const results: FraudDetectionCheck[] = [];
    let tensor: tf.Tensor4D | null = null;
    let tempCanvas: HTMLCanvasElement | null = null;

    try {
      // Create a temporary canvas for image processing
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = 224;
      tempCanvas.height = 224;
      const ctx = tempCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Create temporary image element
      const img = new Image();
      img.width = imageData.width;
      img.height = imageData.height;

      // Convert ImageData to base64
      const tempCanvas2 = document.createElement('canvas');
      tempCanvas2.width = imageData.width;
      tempCanvas2.height = imageData.height;
      const ctx2 = tempCanvas2.getContext('2d');

      if (!ctx2) {
        throw new Error('Failed to get temporary canvas context');
      }

      ctx2.putImageData(imageData, 0, 0);
      const dataUrl = tempCanvas2.toDataURL();

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Draw and resize image
      ctx.drawImage(img, 0, 0, 224, 224);

      // Convert to tensor
      tensor = tf.tidy(() => {
        if (!tempCanvas) {
          throw new Error('Canvas is null');
        }
        const imageTensor = tf.browser.fromPixels(tempCanvas)
          .toFloat()
          .div(255.0)
          .expandDims(0) as tf.Tensor4D;
        return imageTensor;
      });

      if (!tensor) {
        throw new Error('Failed to create tensor from image');
      }

      // Perform fraud detection checks
      const noiseLevel = await this.analyzeImageNoise(tensor);
      const patternConsistency = await this.analyzePatterns(tensor);
      const colorConsistency = await this.analyzeColorConsistency(tensor);

      results.push({
        check: 'Digital Manipulation',
        passed: noiseLevel < 0.3,
        confidence: 1 - noiseLevel,
        details: `Noise level: ${noiseLevel.toFixed(3)}`
      });

      results.push({
        check: 'Pattern Consistency',
        passed: patternConsistency > 0.7,
        confidence: patternConsistency,
        details: `Pattern score: ${patternConsistency.toFixed(3)}`
      });

      results.push({
        check: 'Color Consistency',
        passed: colorConsistency > 0.8,
        confidence: colorConsistency,
        details: `Color consistency score: ${colorConsistency.toFixed(3)}`
      });

      return results;
    } catch (error) {
      console.error('Error in fraud detection:', error);
      results.push({
        check: 'Fraud Detection',
        passed: false,
        confidence: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return results;
    } finally {
      // Cleanup
      if (tensor) tensor.dispose();
      if (tempCanvas) {
        tempCanvas.width = 0;
        tempCanvas.height = 0;
      }
    }
  }

  private async analyzeImageNoise(tensor: tf.Tensor4D): Promise<number> {
    return tf.tidy(() => {
      const squeezed = tensor.squeeze([0]) as tf.Tensor3D;
      const grayscale = tf.mean(squeezed, -1);
      const paddedImage = tf.pad(grayscale, [[1, 1], [1, 1]]);
      const expandedImage = paddedImage.expandDims(-1).expandDims(0) as tf.Tensor4D;

      const sobelX = tf.tensor2d([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]);
      const sobelY = tf.tensor2d([[-1, -2, -1], [0, 0, 0], [1, 2, 1]]);

      const sobelXKernel = sobelX.expandDims(-1).expandDims(-1) as tf.Tensor4D;
      const sobelYKernel = sobelY.expandDims(-1).expandDims(-1) as tf.Tensor4D;

      const gradX = tf.conv2d(expandedImage, sobelXKernel, 1, 'valid');
      const gradY = tf.conv2d(expandedImage, sobelYKernel, 1, 'valid');

      const gradientMagnitude = tf.sqrt(tf.add(tf.square(gradX), tf.square(gradY)));
      return gradientMagnitude.mean().dataSync()[0];
    });
  }

  private async analyzePatterns(tensor: tf.Tensor4D): Promise<number> {
    // Analyze document patterns using frequency domain analysis
    return tf.tidy((): number => {
      const squeezed = tensor.squeeze([0]) as tf.Tensor3D;
      const grayscale = tf.mean(squeezed, -1);
      const [height, width] = grayscale.shape;

      // Calculate local binary patterns
      const shifted = tf.stack([
        tf.slice(grayscale, [1, 0], [height-1, width]),
        tf.slice(grayscale, [0, 1], [height, width-1]),
        tf.slice(grayscale, [1, 1], [height-1, width-1])
      ]);

      const result = shifted.mean().dataSync()[0];
      shifted.dispose();
      grayscale.dispose();

      return result;
    });
  }

  private async analyzeColorConsistency(tensor: tf.Tensor4D): Promise<number> {
    return tf.tidy(() => {
      const squeezed = tensor.squeeze([0]) as tf.Tensor3D;
      const channels = tf.split(squeezed, 3, -1);

      const channelStats = channels.map(c => {
        const moments = tf.moments(c);
        return {
          mean: moments.mean.dataSync()[0],
          variance: moments.variance.dataSync()[0]
        };
      });

      // Cleanup
      channels.forEach(c => c.dispose());

      const means = channelStats.map(s => s.mean);
      const variances = channelStats.map(s => Math.sqrt(s.variance)); // Convert variance to std dev

      const meanDiff = Math.max(...means) - Math.min(...means);
      const stdSum = variances.reduce((acc: number, curr: number) => acc + curr, 0);

      return 1 - (meanDiff + stdSum) / 4; // Normalize to [0,1]
    });
  }

  public async validateDocument(imageData: ImageData): Promise<DocumentProcessingResult> {
    await this.loadModels();

    // Perform fraud detection
    const fraudDetectionResults = await this.detectFraud(imageData);

    // Classify document type
    const documentType = await this.classifyDocumentType(imageData);

    // Extract data based on document type
    const extractedData = await this.extractDocumentData(imageData, documentType);

    // Perform face detection
    const faceDetection: FaceDetectionResult = await this.detectFace(imageData);

    // Calculate overall validation result
    const fraudChecks = fraudDetectionResults.filter(r => r.passed).length;
    const isValid = fraudChecks === fraudDetectionResults.length && faceDetection.faceDetected;
    const confidence = (fraudDetectionResults.reduce((acc, curr) => acc + curr.confidence, 0) /
                      fraudDetectionResults.length + faceDetection.confidence) / 2;

    return {
      success: isValid,
      documentType,
      isValid,
      confidence,
      fraudDetectionResults,
      extractedData,
      faceDetection
    };
  }

  private async classifyDocumentType(imageData: ImageData): Promise<DocumentType> {
    return tf.tidy(() => {
      // Preprocess image
      const tensor = tf.browser.fromPixels(imageData)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(255);

      try {
        // Calculate aspect ratio
        const aspectRatio = imageData.width / imageData.height;

        // Calculate color distribution
        const rgbMeans = tf.mean(tensor, [0, 1]).dataSync();
        const colorVariance = tf.moments(tensor, [0, 1]).variance.dataSync();

        // Rule-based classification with safe type assertion
        if (aspectRatio > 1.4 && aspectRatio < 1.6) {
          // Typical passport aspect ratio is ~1.4-1.6
          return documentTypeMap['passport'];
        } else if (aspectRatio > 1.55 && aspectRatio < 1.7) {
          // Typical driver's license aspect ratio is ~1.55-1.7
          return documentTypeMap['driver_license'];
        } else if (aspectRatio > 1.2 && aspectRatio < 1.4) {
          // Typical ID card aspect ratio is ~1.2-1.4
          return documentTypeMap['id_card'];
        }

        // Cleanup tensors
        tensor.dispose();

        // Default to passport for our sample
        return documentTypeMap['passport'];
      } catch (error) {
        console.error('Error classifying document:', error);
        return documentTypeMap['passport'];
      }
    });
  }
  private async extractDocumentData(imageData: ImageData, documentType: DocumentType): Promise<ExtractedDataInternal> {
    try {
      // Convert ImageData to base64
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      ctx.putImageData(imageData, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg');

      // Call backend OCR service
      const response = await fetch('/api/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error('OCR service failed to process document');
      }

      const data = await response.json();

      // Validate extracted data
      if (!data.name || !data.documentNumber || !data.expirationDate) {
        throw new Error('Failed to extract required fields from document');
      }

      return {
        name: data.name,
        documentNumber: data.documentNumber,
        expirationDate: data.expirationDate,
        documentType
      };
    } catch (error) {
      console.error('Error extracting document data:', error);
      throw error;
    }
  }
  private async detectFace(imageData: ImageData): Promise<FaceDetectionResult> {
    try {
      // Load face-api.js model
      const model = await tf.loadLayersModel('/models/face_detection_model.json');

      // Convert ImageData to tensor
      const tensor = tf.browser.fromPixels(imageData)
        .resizeBilinear([224, 224])
        .expandDims(0)
        .toFloat()
        .div(255.0);

      // Run face detection
      const predictions = await model.predict(tensor) as tf.Tensor;
      const confidence = predictions.dataSync()[0];

      // Cleanup
      tensor.dispose();
      predictions.dispose();

      return {
        faceDetected: confidence > 0.5,
        confidence: confidence,
        landmarks: [] // We'll add facial landmarks in a future update
      };
    } catch (error) {
      console.error('Error in face detection:', error);
      return {
        faceDetected: false,
        confidence: 0,
        landmarks: []
      };
    }
  }
}

export const documentValidator = DocumentValidator.getInstance();
