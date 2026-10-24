import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SidebarComponent, type ChatThread } from '../../component/sidebar/sidebar';
import { ChatWindowComponent, type ChatMessage } from '../../component/chat-window/chat-window';
import { RepoConfigModalComponent } from '../../component/repo-config/repo-config';
import { NavbarComponent } from '../../component/navbar/navbar';
import { McpStatusComponent } from '../../component/mcp-status/mcp-status';
import { MessageService, type MessageRecord } from '../../core/message-service/message.service';
import RepoConfigService, { type RepoConfig } from '../../component/repo-config/repo-config service/repo-config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, ChatWindowComponent, RepoConfigModalComponent, NavbarComponent, McpStatusComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  // Resizable Sidebar Width (default 280px)
  sidebarWidth = signal<number>(280);
  private isDragging = false;

  chatHistory = signal<ChatThread[]>([]);
  configuredRepos = signal<RepoConfig[]>([]);
  selectedRepo = signal<string>('');
  selectedRepoName = computed(
    () => this.configuredRepos().find((repo) => repo.id === this.selectedRepo())?.repoUrl ?? 'No repository selected',
  );
  activeThreadId = signal<string>('');
  isModalOpen = signal<boolean>(false);

  messages = signal<ChatMessage[]>([]);
  messageError = signal<string>('');
  isLoadingMessages = signal<boolean>(false);
  isSendingMessage = signal<boolean>(false);
  displayedError = computed(() => this.messageError());

  private readonly messageService = inject(MessageService);
  private readonly repoConfigService = inject(RepoConfigService);

  ngOnInit() {
    this.loadConfiguredRepositories();
    this.loadMessages(this.activeThreadId());
  }

  // Resizer Drag Handlers
  startResizing(event: MouseEvent) {
    this.isDragging = true;
    event.preventDefault();

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.isDragging) return;
      // Clamp width between min 200px and max 500px for good UX
      const newWidth = Math.min(Math.max(moveEvent.clientX - 16, 200), 500);
      this.sidebarWidth.set(newWidth);
    };

    const onMouseUp = () => {
      this.isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  onNewChat() {
    this.activeThreadId.set('');
    this.messages.set([]);
    this.messageError.set('');
  }

  onSendMessage(text: string) {
    const chatId = this.activeThreadId();
    if (!chatId) {
      this.messageError.set('Select an existing chat before sending a message.');
      return;
    }

    this.messageError.set('');
    this.isSendingMessage.set(true);
    this.messageService
      .sendMessage(chatId, text)
      .pipe(finalize(() => this.isSendingMessage.set(false)))
      .subscribe({
        next: ({ body }) => this.messages.update((messages) => [...messages, this.toChatMessage(body)]),
        error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to send message.')),
      });
  }

  onThreadSelected(chatId: string) {
    this.activeThreadId.set(chatId);
    this.messages.set([]);
    this.loadMessages(chatId);
  }

  onRepositoriesSaved() {
    this.isModalOpen.set(false);
    this.loadConfiguredRepositories();
  }

  private loadConfiguredRepositories() {
    this.repoConfigService
      .getConfiguredRepositories()
      .subscribe({
        next: ({ data }) => {
          this.configuredRepos.set(data ?? []);
          if (!this.selectedRepo() && data.length > 0) {
            this.selectedRepo.set(data[0].id);
          }
        },
        error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to load repositories.')),
      });
  }

  private loadMessages(chatId: string) {
    if (!chatId) return;

    this.isLoadingMessages.set(true);
    this.messageError.set('');
    this.messageService
      .fetchMessages(chatId)
      .pipe(finalize(() => this.isLoadingMessages.set(false)))
      .subscribe({
        next: ({ body }) => this.messages.set(body.map((message) => this.toChatMessage(message))),
        error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to load messages.')),
      });
  }

  private toChatMessage(message: MessageRecord): ChatMessage {
    return {
      id: message.id,
      sender: message.sender ? 'user' : 'assistant',
      text: message.content,
      timestamp: new Date(message.createdAt),
      mcpToolsAvailable: (message as any).mcpToolsAvailable,
    };
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