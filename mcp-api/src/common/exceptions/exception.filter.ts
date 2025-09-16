import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log('exception', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocorreu um erro inesperado.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        if ('message' in responseBody) {
          const messageContent = (responseBody as Record<string, unknown>)
            .message;

          if (typeof messageContent === 'string') {
            message = messageContent;
          } else if (Array.isArray(messageContent)) {
            message = messageContent.join(', ');
          }
        }
      }
    }
    if (exception instanceof PayloadTooLargeException) {
      message = 'Arquivo excede o limite de 10Mb para upload.';
    }
    if (message.includes('Unexpected field -')) {
      const messageSplited = message.split(' - ').slice(1).join(' - ');
      message = 'Nome do campo de arquivo inesperado - ' + messageSplited;
    }

    response.status(status).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
