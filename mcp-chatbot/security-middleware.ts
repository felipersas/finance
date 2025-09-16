// security-middleware.ts
// Adicione este middleware ao seu chatbot para validar chamadas internas

import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  isInternalCall?: boolean;
}

/**
 * Valida se uma origem é permitida
 */
const isOriginAllowed = (origin: string | undefined, serviceName: string | undefined, allowedOrigins: string[]): boolean => {
  if (allowedOrigins.length === 0) {
    return true; // Se não há restrições, permite todos
  }

  // Verifica por nome do serviço (mais confiável)
  if (serviceName && allowedOrigins.includes(serviceName)) {
    return true;
  }

  // Verifica por origem/host
  if (origin) {
    return allowedOrigins.some(allowedOrigin => {
      // Permite correspondência exata
      if (origin === allowedOrigin) return true;

      // Permite correspondência de subdomínio/container name
      if (origin.includes(allowedOrigin)) return true;

      // Permite padrões como *.domain.com
      if (allowedOrigin.startsWith('*')) {
        const domain = allowedOrigin.substring(1);
        return origin.endsWith(domain);
      }

      return false;
    });
  }

  return false;
};

/**
 * Middleware para validar chamadas internas entre serviços
 */
export const validateInternalCall = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const internalToken = req.headers['x-internal-token'] as string;
  const expectedToken = process.env.INTERNAL_API_TOKEN;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  // Verifica o token interno
  if (!internalToken || internalToken !== expectedToken) {
    return res.status(403).json({
      error: 'Unauthorized - Invalid internal token',
      message: 'This service is only accessible by authorized internal services'
    });
  }


  // Verifica se a origem é permitida (opcional)
  const origin = req.headers['origin'] || req.headers['host'];
  const userAgent = req.headers['user-agent'];
  const serviceName = req.headers['x-service-name'] as string;

  // Valida se a origem/serviço está na lista de permitidos
  if (allowedOrigins.length > 0) {
    const isAllowed = isOriginAllowed(origin, serviceName, allowedOrigins);

    if (!isAllowed) {
      console.warn(`Blocked request from unauthorized origin/service:`, {
        origin,
        serviceName,
        userAgent,
        allowedOrigins,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: 'Forbidden - Origin not allowed',
        message: 'This service is only accessible by authorized origins'
      });
    }
  }

  // Log para auditoria
  console.log(`Internal call validated:`, {
    token: internalToken.substring(0, 10) + '...',
    origin,
    serviceName,
    userAgent,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  req.isInternalCall = true;
  next();
};

/**
 * Middleware adicional para validar IP ranges (opcional)
 */
export const validateDockerNetwork = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  // Permite apenas IPs da rede Docker (172.20.0.0/16)
  const isDockerNetwork = clientIP?.startsWith('172.20.') ||
                          clientIP?.startsWith('127.0.') ||
                          clientIP === '::1';

  if (!isDockerNetwork) {
    console.warn(`Blocked external access attempt from IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'This service is not accessible from external networks'
    });
  }

  next();
};

/**
 * Exemplo de uso no seu app principal:
 *
 * import express from 'express';
 * import { validateInternalCall, validateDockerNetwork } from './security-middleware';
 *
 * const app = express();
 *
 * // Aplica validações a todas as rotas
 * app.use(validateDockerNetwork);
 * app.use(validateInternalCall);
 *
 * // Suas rotas aqui
 * app.post('/chat', (req, res) => {
 *   // Código do chatbot
 * });
 */