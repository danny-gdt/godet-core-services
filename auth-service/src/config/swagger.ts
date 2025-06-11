import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Microservice API',
      version: '1.0.0',
      description: 'A simple Express authentication service API documented with Swagger',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Le glob {js,ts} fonctionne à la fois en développement (.ts) et en production (.js).
  apis: [path.join(__dirname, '..', 'api', '**', '*.{js,ts}')],
};

export const swaggerSpec = swaggerJsdoc(options); 