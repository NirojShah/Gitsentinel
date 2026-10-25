import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SidebarComponent, type ChatThread } from '../../component/sidebar/sidebar';
import { ChatWindowComponent, type ChatMessage } from '../../component/chat-window/chat-window';
import { RepoConfigModalComponent } from '../../component/repo-config/repo-config';
import { NavbarComponent } from '../../component/navbar/navbar';
import { McpStatusComponent } from '../../component/mcp-status/mcp-status';
import { MessageService, type MessageRecord } from '../../core/message-service/message.service';
import { ChatService, type ChatRecord } from '../../core/chat-service/chat.service';
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
  editingRepository = signal<RepoConfig | null>(null);
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
  isCreatingChat = signal<boolean>(false);
  displayedError = computed(() => this.messageError());

  private readonly messageService = inject(MessageService);
  private readonly chatService = inject(ChatService);
  private readonly repoConfigService = inject(RepoConfigService);

  ngOnInit() {
    this.loadConfiguredRepositories();
    this.loadChatHistory();
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
    if (this.isCreatingChat()) return;
    const repoId = this.selectedRepo() || this.configuredRepos()[0]?.id;
    if (!repoId) {
      this.messageError.set('Connect a repository before creating a chat.');
      this.isModalOpen.set(true);
      return;
    }

    this.messageError.set('');
    this.isCreatingChat.set(true);
    const repoUrl = this.configuredRepos().find((repo) => repo.id === repoId)?.repoUrl ?? 'Repository';
    this.chatService
      .createChat(repoId, 'New chat')
      .pipe(finalize(() => this.isCreatingChat.set(false)))
      .subscribe({
        next: ({ data }) => {
          const thread = this.toChatThread(data, repoUrl);
          this.chatHistory.update((threads) => [thread, ...threads.filter((item) => item.id !== thread.id)]);
          this.activeThreadId.set(thread.id);
          this.selectedRepo.set(thread.repoId);
          this.messages.set([]);
        },
        error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to create chat.')),
      });
  }

  private loadChatHistory() {
    this.chatService.fetchChats().subscribe({
      next: ({ data }) => {
        const threads = (data ?? []).map((chat) => this.toChatThread(chat, chat.gitRepo.repoUrl));
        this.chatHistory.set(threads);
        if (!this.activeThreadId() && threads.length > 0) {
          this.onThreadSelected(threads[0].id);
        }
      },
      error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to load chat history.')),
    });
  }

  private toChatThread(chat: ChatRecord, repoName: string): ChatThread {
    return {
      id: chat.id,
      title: chat.chatName?.trim() || 'New chat',
      repoName,
      repoId: chat.repoId,
    };
  }

  onRenameChat(chatId: string) {
    const thread = this.chatHistory().find((item) => item.id === chatId);
    if (!thread) return;
    const chatName = window.prompt('Rename chat', thread.title)?.trim();
    if (!chatName || chatName === thread.title) return;

    this.chatService.updateChat(chatId, chatName).subscribe({
      next: () => this.chatHistory.update((threads) =>
        threads.map((item) => item.id === chatId ? { ...item, title: chatName } : item),
      ),
      error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to rename chat.')),
    });
  }

  onDeleteMessage(messageId: string) {
    const chatId = this.activeThreadId();
    if (!chatId || !window.confirm('Delete this message?')) return;

    this.messageService.deleteMessage(chatId, messageId).subscribe({
      next: () => this.messages.update((messages) => messages.filter((message) => message.id !== messageId)),
      error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to delete message.')),
    });
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
        next: ({ body }) => this.messages.update((messages) => [
          ...messages,
          this.toChatMessage(body.userMessage),
          this.toChatMessage(body),
        ]),
        error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to send message.')),
      });
  }

  onThreadSelected(chatId: string) {
    this.activeThreadId.set(chatId);
    this.messages.set([]);
    const selectedThread = this.chatHistory().find((thread) => thread.id === chatId);
    if (selectedThread) this.selectedRepo.set(selectedThread.repoId);
    this.loadMessages(chatId);
  }

  onRepositoriesSaved() {
    this.closeRepoConfig();
    this.loadConfiguredRepositories();
  }

  openRepoConfig() {
    this.editingRepository.set(null);
    this.isModalOpen.set(true);
  }

  closeRepoConfig() {
    this.isModalOpen.set(false);
    this.editingRepository.set(null);
  }

  onEditRepository(repositoryId: string) {
    this.repoConfigService.getRepository(repositoryId).subscribe({
      next: ({ data }) => {
        this.editingRepository.set(data);
        this.isModalOpen.set(true);
      },
      error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to load repository details.')),
    });
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
      mcpToolsAvailable: message.mcpToolsAvailable,
      mcpToolsExecuted: message.mcpToolsExecuted,
      mcpWarning: message.mcpWarning,
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