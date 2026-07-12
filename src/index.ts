import { assetRoutes } from './modules/assets/routes';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ApiError } from './utils/ApiError';

dotenv.config();

const app = express();

// Security and Parsing Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ERP Backend is fully operational.',
    data: {}
  });
});

app.use('/api/assets', assetRoutes);

// Global Error Handler (Forces strict JSON format)
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SERVER] Enterprise ERP running on http://localhost:${PORT}`);
});