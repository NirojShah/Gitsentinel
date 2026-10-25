import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api-base-url';

export interface SignupInput {
  email: string;
  username: string;
  password: string;
  name?: string;
}

interface SignupResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SignupService {
  private readonly http = inject(HttpClient);

  signup(input: SignupInput): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${API_BASE_URL}/user/signup`, input);
  }
}
