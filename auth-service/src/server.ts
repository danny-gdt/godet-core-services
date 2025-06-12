// src/server.ts
import express, { Express} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './api/auth/auth.routes';
import { PrismaClient } from '@prisma/client';
import { pinoHttp } from 'pino-http';
import { responseLoggerMiddleware } from './middleware/responseBodyLogger';

dotenv.config();

const app: Express = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  optionsSuccessStatus: 200,
  credentials: true,
};

// IMPORTANT: Placer le middleware de capture AVANT pino-http.
// Il enveloppe `res.send` pour que `res.locals.responseBody` soit défini
// avant que pino-http ne finalise son log via le hook `customProps`.
app.use(responseLoggerMiddleware);

app.use(pinoHttp({
  level: process.env.LOG_LEVEL || 'info',
  // Utilise le hook `customProps` pour ajouter le corps de la réponse au log.
  // C'est la méthode la plus fiable car elle est appelée juste avant l'écriture du log.
  customProps: function (req, res) {
    const body = res.locals.responseBody;
    if (typeof body !== 'string') {
      return { resBody: body };
    }
    try {
      // Attempt to parse JSON string
      return { resBody: JSON.parse(body) };
    } catch (e) {
      // Not a JSON string, return as is
      return { resBody: body };
    }
  },
}));

app.use(cors(corsOptions));
app.use(express.json());

app.use((err: any, req: any, res: any, next: any) => {
  const logger = req.log;

  const statusCode = err.statusCode || 500;
  const responseBody = {
    message: err.message || 'An internal server error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // On logue au niveau 'error' et on inclut notre corps de réponse personnalisé
  logger.error({ err, resBody: responseBody }, 'Error handled by error middleware');
  
  // On envoie la réponse d'erreur au client
  res.status(statusCode).json(responseBody);
});

const port = process.env.PORT || 3000;
export const prisma = new PrismaClient();

async function main() {
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