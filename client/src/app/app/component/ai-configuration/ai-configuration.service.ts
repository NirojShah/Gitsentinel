import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, type Observable } from 'rxjs';

export type AiProvider = 'openai' | 'claude' | 'gemini';

export interface AiConfiguration {
  id: string;
  provider: AiProvider;
  model: string;
  apiKey: string;
  userId: string;
}

export interface AiConfigurationInput {
  provider: AiProvider;
  model: string;
  apiKey: string;
}

export interface AiConfigurationResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiConfigurationService {
  private readonly apiUrl = 'http://localhost:5000/app/v1/ai-configuration';
  private readonly http = inject(HttpClient);

  getConfigurations(page = 1, limit = 100): Observable<AiConfigurationResponse<AiConfiguration[]>> {
    return defer(() =>
      this.http.get<AiConfigurationResponse<AiConfiguration[]>>(this.apiUrl, {
        headers: this.authorizationHeaders(),
        params: new HttpParams().set('page', page).set('limit', limit),
      }),
    );
  }

  createConfiguration(
    configuration: AiConfigurationInput,
  ): Observable<AiConfigurationResponse<AiConfiguration>> {
    return defer(() =>
      this.http.post<AiConfigurationResponse<AiConfiguration>>(this.apiUrl, configuration, {
        headers: this.authorizationHeaders(),
      }),
    );
  }

  updateConfiguration(
    configurationId: string,
    configuration: AiConfigurationInput,
  ): Observable<AiConfigurationResponse<AiConfiguration>> {
    return defer(() =>
      this.http.put<AiConfigurationResponse<AiConfiguration>>(
        `${this.apiUrl}/${encodeURIComponent(configurationId)}`,
        configuration,
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  private authorizationHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be signed in to manage AI configurations.');
    }

    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
