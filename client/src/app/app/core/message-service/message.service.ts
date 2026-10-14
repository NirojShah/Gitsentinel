import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, type Observable } from 'rxjs';

export interface MessageRecord {
  id: string;
  sender: string | null;
  chatId: string;
  content: string;
  createdAt: string;
}

interface MessageApiResponse<T> {
  body: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly apiUrl = 'http://localhost:5000/app/v1/message';
  private readonly http = inject(HttpClient);

  fetchMessages(chatId: string): Observable<MessageApiResponse<MessageRecord[]>> {
    return defer(() =>
      this.http.get<MessageApiResponse<MessageRecord[]>>(
        `${this.apiUrl}/${encodeURIComponent(chatId)}`,
        { headers: this.authorizationHeaders() },
      ),
    );
  }

  sendMessage(chatId: string, content: string): Observable<MessageApiResponse<MessageRecord>> {
    return defer(() =>
      this.http.post<MessageApiResponse<MessageRecord>>(
        this.apiUrl,
        { chatId, content },
        { headers: this.authorizationHeaders() },
      ),
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
