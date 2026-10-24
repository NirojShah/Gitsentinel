import { Component, inject, signal } from '@angular/core';
import { McpService, type McpTool, type McpStatus } from '../../core/mcp-service/mcp.service';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-mcp-status',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './mcp-status.html',
  styleUrl: './mcp-status.scss',
})
export class McpStatusComponent {
  private readonly mcpService = inject(McpService);

  mcpStatus = signal<McpStatus | null>(null);
  mcpTools = signal<McpTool[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  isExpanded = signal<boolean>(false);

  ngOnInit() {
    this.loadMcpStatus();
  }

  loadMcpStatus() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.mcpService.getStatus().subscribe({
      next: (status) => {
        this.mcpStatus.set(status);
        if (status.connected) {
          this.loadMcpTools();
        }
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Failed to load MCP status'));
        this.isLoading.set(false);
      },
    });
  }

  loadMcpTools() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.mcpService.getTools().subscribe({
      next: (response) => {
        this.mcpTools.set(response.data || []);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Failed to load MCP tools'));
        this.isLoading.set(false);
      },
    });
  }

  connectToMcp() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.mcpService.connect().subscribe({
      next: () => {
        this.loadMcpStatus();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Failed to connect to MCP'));
        this.isLoading.set(false);
      },
    });
  }

  disconnectFromMcp() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.mcpService.disconnect().subscribe({
      next: () => {
        this.loadMcpStatus();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Failed to disconnect from MCP'));
        this.isLoading.set(false);
      },
    });
  }

  toggleExpanded() {
    this.isExpanded.update((value) => !value);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = error.error;
      if (typeof responseError === 'object' && responseError !== null && 'message' in responseError) {
        const message = responseError.message;
        if (typeof message === 'string') return message;
      }
    }
    if (error instanceof Error) return error.message;
    return fallback;
  }
}
