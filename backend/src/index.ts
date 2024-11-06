import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import documentRoutes from './routes/documentRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Upload directory: ${uploadDir}`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  try {
    // Cleanup temporary files in uploads directory
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      fs.unlinkSync(path.join(uploadDir, file));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
});
