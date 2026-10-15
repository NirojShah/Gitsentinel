import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, type Observable } from 'rxjs';

export interface ChatRecord {
  id: string;
  chatName: string | null;
  repoId: string;
  gitRepo: {
    repoUrl: string;
  };
}

interface ChatApiResponse<T> {
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = 'http://localhost:5000/app/v1/chat';
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

  private authorizationHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be signed in to access chats.');
    }

    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
