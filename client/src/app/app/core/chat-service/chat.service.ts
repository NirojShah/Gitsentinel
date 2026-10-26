import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, type Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';

export interface ChatRecord {
  id: string;
  chatName: string | null;
  repoId: string;
  gitRepo: {
    repoUrl: string;
  };
}

export interface ChatUpdateRecord {
  id: string;
  chatName: string | null;
  repoId: string;
}

interface ChatApiResponse<T> {
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = `${API_BASE_URL}/chat`;
  private readonly http = inject(HttpClient);

  fetchChats(): Observable<ChatApiResponse<ChatRecord[]>> {
    return defer(() =>
      this.http.get<ChatApiResponse<ChatRecord[]>>(this.apiUrl, {
        headers: this.authorizationHeaders(),
      }),
    );
  }

  createChat(repoId: string, chatName: string): Observable<ChatApiResponse<ChatRecord>> {
    return defer(() =>
      this.http.post<ChatApiResponse<ChatRecord>>(
        this.apiUrl,
        { repoId, chatName },
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  updateChat(chatId: string, chatName: string): Observable<ChatApiResponse<ChatUpdateRecord>> {
    return defer(() =>
      this.http.patch<ChatApiResponse<ChatUpdateRecord>>(
        `${this.apiUrl}/${encodeURIComponent(chatId)}`,
        { chatId, chatName },
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  fetchChat(chatId: string): Observable<ChatApiResponse<ChatRecord>> {
    return defer(() =>
      this.http.get<ChatApiResponse<ChatRecord>>(
        `${this.apiUrl}/${encodeURIComponent(chatId)}`,
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  deleteChat(chatId: string): Observable<ChatApiResponse<void>> {
    return defer(() =>
      this.http.delete<ChatApiResponse<void>>(
        `${this.apiUrl}/${encodeURIComponent(chatId)}`,
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  private authorizationHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be signed in to access chats.');
    }

    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
