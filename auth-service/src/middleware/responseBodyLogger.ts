// src/middleware/responseLogger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function responseLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  res.locals.responseBody = undefined;

  res.send = function (body: any): Response {
    res.locals.responseBody = body;
    return originalSend.apply(this, arguments as any);
  };

  res.on('finish', () => {
    const logger = req.log;
    const { statusCode } = res;
    
    const logData: { res: { statusCode: number, body?: any } } = {
      res: {
        statusCode: statusCode,
      },
    };

    // --- LA LOGIQUE INTELLIGENTE ---
    // On vérifie le type de contenu de la réponse
    const contentType = res.getHeader('Content-Type');
    
    // On ne logue le corps que pour les réponses de type 'application/json'
    if (typeof contentType === 'string' && contentType.includes('application/json')) {
      const resBody = res.locals.responseBody;
      if (resBody) {
        try {
          // On s'assure que c'est bien un objet JSON parsé
          logData.res.body = (typeof resBody === 'string') ? JSON.parse(resBody) : resBody;
        } catch (e) {
          // Au cas où ce n'est pas du JSON valide, on ne fait rien pour éviter les erreurs
        }
      }
    }
    // Pour tout autre type de contenu (HTML, CSS, etc.), on ne logue pas le corps.
    
    logger.info(logData, 'Response sent');
  });

  next();
}