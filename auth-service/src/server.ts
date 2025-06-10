// src/server.ts
import express, { Express} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './api/auth/auth.routes';
import { PrismaClient } from '@prisma/client';
import { pinoHttp } from 'pino-http';

dotenv.config();

const app: Express = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(pinoHttp({
  level: process.env.LOG_LEVEL || 'info',
}));
app.use(cors(corsOptions));

const port = process.env.PORT || 3000;
export const prisma = new PrismaClient();

async function main() {
  app.use(express.json());

  // API routes
  app.use('/api/auth', authRoutes);

  // Swagger Docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const server = app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
    }
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
          console.log('HTTP server closed.');
          await prisma.$disconnect();
          console.log('Prisma client disconnected.');
          process.exit(0);
      });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 