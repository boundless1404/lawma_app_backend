import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pick } from 'lodash';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestApi: HttpService,
    private configService: ConfigService,
  ) {}

  baseURL: string;
  headers: Record<string, unknown>;
  url_path: string;
  async requestApiService(
    path: string,
    {
      query = {},
      body = {},
      headers = {},
      method = 'GET',
      baseURL = '',
    }: {
      body?: Record<string, unknown>;
      query?: Record<string, unknown>;
      headers?: { Authorization?: string };
      method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
      baseURL?: string;
    } = {},
  ) {
    //
    const authToken = this.configService.getOrThrow(
      'AUTH_SERVER_API_ACCESS_TOKEN',
    );
    baseURL = baseURL || this.baseURL || this.configService.getOrThrow('AUTH_SERVER_URL');
    const Authorization = headers.Authorization || `Bearer ${authToken}`;

    const response = await this.requestApi.axiosRef(path, {
      headers: { ...headers, Authorization },
      params: query,
      data: body,
      method,
      baseURL,
    });

    return pick(response, ['data', 'headers', 'request', 'status']);
  }

  setup(url_path: string,  headers: Record<string, string>) {
    this.url_path = url_path;
    this.headers = headers;
    return this;
  }

  async send(method: 'GET' | 'POST'| 'PUT' | 'DELETE', data: Record<string, unknown>) {
    try {
      if(!this.url_path) {
        throw new Error('urlPath not saved')
      }
      const response = await this.requestApiService(this.url_path, {
        method,
        ...(data ? {body: data} : {}),
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      // Handle error appropriately
      throw new Error(
        `Error creating dedicated virtual account: ${error.message}`,
      );
    }
  } 
}
