import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const message =
          typeof data === 'object' &&
          data !== null &&
          'message' in data &&
          typeof (data as Record<string, unknown>).message === 'string'
            ? (data as Record<string, string>).message
            : 'Operação realizada com sucesso.';

        const responseData =
          typeof data === 'object' && data !== null && 'data' in data
            ? (data as Record<string, unknown>).data
            : data;

        return {
          success: true,
          message,
          timestamp: new Date().toISOString(),
          data: responseData,
        };
      }),
    );
  }
}
