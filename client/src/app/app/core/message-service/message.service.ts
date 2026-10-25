import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, type Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';

export interface MessageRecord {
  id: string;
  sender: string | null;
  chatId: string;
  content: string;
  createdAt: string;
  mcpToolsAvailable?: Array<{ name: string; description?: string }>;
  mcpToolsExecuted?: number;
  mcpWarning?: string;
}

export interface SentMessageRecord extends MessageRecord {
  userMessage: MessageRecord;
}

interface MessageApiResponse<T> {
  body: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly apiUrl = `${API_BASE_URL}/message`;
  private readonly http = inject(HttpClient);

  fetchMessages(chatId: string): Observable<MessageApiResponse<MessageRecord[]>> {
    return defer(() =>
      this.http.get<MessageApiResponse<MessageRecord[]>>(
        `${this.apiUrl}/${encodeURIComponent(chatId)}`,
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  sendMessage(chatId: string, content: string): Observable<MessageApiResponse<SentMessageRecord>> {
    return defer(() =>
      this.http.post<MessageApiResponse<SentMessageRecord>>(
        this.apiUrl,
        { chatId, content },
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  deleteMessage(chatId: string, messageId: string): Observable<void> {
    return defer(() =>
      this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(chatId)}`, {
        headers: this.authorizationHeaders(),
        params: new HttpParams().set('messageId', messageId),
      }),
    );
  }

  private authorizationHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be signed in to access chat messages.');
    }

    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
