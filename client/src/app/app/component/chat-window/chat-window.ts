import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button';
import type { RepoConfig } from '../repo-config/repo-config service/repo-config.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  mcpToolsAvailable?: Array<{ name: string; description?: string }>;
  mcpToolsExecuted?: number;
  mcpWarning?: string;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindowComponent {
  // Inputs & Outputs
  configuredRepos = input<RepoConfig[]>([]);
  selectedRepo = input<string>('');
  activeThreadId = input<string>('');
  messages = input<ChatMessage[]>([]);
  errorMessage = input<string>('');
  isLoading = input<boolean>(false);
  isSending = input<boolean>(false);
  repoChanged = output<string>();
  messageSent = output<string>();
  deleteMessageRequested = output<string>();
  openConfigRequested = output<void>();

  inputMessage = signal<string>('');
  showMcpTools = signal<Record<string, boolean>>({});

  handleSend() {
    if (!this.inputMessage().trim()) return;
    this.messageSent.emit(this.inputMessage());
    this.inputMessage.set('');
  }

  toggleMcpTools(messageId: string) {
    this.showMcpTools.update((state) => ({
      ...state,
      [messageId]: !state[messageId],
    }));
  }

  hasMcpTools(message: ChatMessage): boolean {
    return message.mcpToolsAvailable !== undefined && message.mcpToolsAvailable.length > 0;
  }
}