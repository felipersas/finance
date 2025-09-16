import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { NotFound } from '../errors/not-found';
import { Unauthorized } from '../errors/unauthorized';

export interface ExternalRequestOptions {
  timeout?: number;
  serviceName?: string;
  additionalHeaders?: Record<string, string>;
}

@Injectable()
export class ExternalHttpService {
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.internalToken =
      this.configService.get<string>('INTERNAL_API_TOKEN') || '';

    if (!this.internalToken) {
      throw new Error(
        'INTERNAL_API_TOKEN is required for external service communication',
      );
    }
  }

  async post<T = any>(
    url: string,
    data: any,
    options: ExternalRequestOptions = {},
  ): Promise<T> {
    return this.makeRequest('POST', url, data, options);
  }

  async get<T = any>(
    url: string,
    options: ExternalRequestOptions = {},
  ): Promise<T> {
    return this.makeRequest('GET', url, undefined, options);
  }

  async put<T = any>(
    url: string,
    data: any,
    options: ExternalRequestOptions = {},
  ): Promise<T> {
    return this.makeRequest('PUT', url, data, options);
  }

  async delete<T = any>(
    url: string,
    options: ExternalRequestOptions = {},
  ): Promise<T> {
    return this.makeRequest('DELETE', url, undefined, options);
  }

  private async makeRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    options: ExternalRequestOptions = {},
  ): Promise<T> {
    const {
      timeout = 60000,
      serviceName = 'external-service',
      additionalHeaders = {},
    } = options;

    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Token': this.internalToken,
      'User-Agent': `mcp-api-internal/1.0`,
      'X-Service-Name': 'mcp-api',
      ...additionalHeaders,
    };

    try {
      let response: any;

      switch (method) {
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, data, { headers, timeout }),
          );
          break;
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(url, { headers, timeout }),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, data, { headers, timeout }),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, { headers, timeout }),
          );
          break;
        default:
          throw new Error('Method not implemented');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.status === 403) {
        throw new Unauthorized(`Unauthorized to access ${serviceName}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.status === 404) {
        throw new NotFound(`${serviceName} not found`);
      }

      throw new Error(`Failed to communicate with ${serviceName}`);
    }
  }
}
