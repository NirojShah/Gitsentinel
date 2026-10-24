import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

export interface McpStatus {
  status: string;
  connected: boolean;
  message: string;
}

export interface McpToolExecution {
  status: string;
  data?: unknown;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class McpService {
  private readonly baseUrl = 'http://localhost:5000/app/v1/mcp';

  constructor(private readonly http: HttpClient) {}

  getStatus(): Observable<McpStatus> {
    return this.http.get<McpStatus>(`${this.baseUrl}/status`);
  }

  getTools(): Observable<{ status: string; data: McpTool[]; message: string }> {
    return this.http.get<{ status: string; data: McpTool[]; message: string }>(`${this.baseUrl}/tools`);
  }

  executeTool(toolName: string, args: Record<string, unknown>): Observable<McpToolExecution> {
    return this.http.post<McpToolExecution>(`${this.baseUrl}/execute`, { toolName, args });
  }

  connect(): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.baseUrl}/connect`, {});
  }

  disconnect(): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.baseUrl}/disconnect`, {});
  }
}
