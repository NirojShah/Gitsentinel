<<<<<<< Updated upstream
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize, switchMap } from 'rxjs';
=======
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
>>>>>>> Stashed changes
import { SidebarComponent, type ChatThread } from '../../component/sidebar/sidebar';
import { ChatWindowComponent, type ChatMessage } from '../../component/chat-window/chat-window';
import { RepoConfigModalComponent } from '../../component/repo-config/repo-config';
import { NavbarComponent } from '../../component/navbar/navbar';
import { MessageService, type MessageRecord } from '../../core/message-service/message.service';
<<<<<<< Updated upstream
import { ChatService, type ChatRecord } from '../../core/chat-service/chat.service';
import RepoConfigService, { type RepoConfig } from '../../component/repo-config/repo-config service/repo-config.service';
=======
>>>>>>> Stashed changes

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, ChatWindowComponent, RepoConfigModalComponent, NavbarComponent],
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
<<<<<<< Updated upstream
  repositoryError = signal<string>('');
  displayedError = computed(
    () => [this.repositoryError(), this.messageError()].filter(Boolean).join(' '),
  );
  isLoadingMessages = signal<boolean>(false);
  isSendingMessage = signal<boolean>(false);

  private readonly messageService = inject(MessageService);
  private readonly chatService = inject(ChatService);
  private readonly repoConfigService = inject(RepoConfigService);
  private messageLoadRequest = 0;

  ngOnInit() {
    this.loadRepositories();
    this.loadChatHistory();
=======
  isLoadingMessages = signal<boolean>(false);

  private readonly messageService = inject(MessageService);

  ngOnInit() {
    this.loadMessages(this.activeThreadId());
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    this.messageLoadRequest += 1;
    this.activeThreadId.set('');
    this.messages.set([]);
    this.isLoadingMessages.set(false);
    this.messageError.set('');
  }

  onRepositoriesSaved() {
    this.loadRepositories();
  }

  onSendMessage(text: string) {
    const content = text.trim();
    if (!content || this.isSendingMessage()) return;

    const repoId = this.selectedRepo();
    if (!this.activeThreadId() && !repoId) {
      this.messageError.set('Configure a repository before starting a chat.');
=======
    this.activeThreadId.set('');
    this.messages.set([]);
    this.messageError.set('');
  }

  onSendMessage(text: string) {
    const chatId = this.activeThreadId();
    if (!chatId) {
      this.messageError.set('Select an existing chat before sending a message.');
>>>>>>> Stashed changes
      return;
    }

    this.messageError.set('');
<<<<<<< Updated upstream
    this.isSendingMessage.set(true);

    const selectionAtSend = this.messageLoadRequest;
    const currentChatId = this.activeThreadId();
    const send$ = currentChatId
      ? this.messageService.sendMessage(currentChatId, content)
      : this.chatService
          .createChat(repoId, content.slice(0, 100))
          .pipe(
            switchMap(({ data }) => {
              if (selectionAtSend === this.messageLoadRequest) {
                this.activeThreadId.set(data.id);
              }
              this.upsertChatThread(data);
              return this.messageService.sendMessage(data.id, content);
            }),
          );

    send$.pipe(finalize(() => this.isSendingMessage.set(false))).subscribe({
      next: ({ body }) => {
        if (this.activeThreadId() === body.chatId) {
          this.messages.update((messages) => [...messages, this.toChatMessage(body)]);
        }
      },
=======
    this.messageService.sendMessage(chatId, text).subscribe({
      next: ({ body }) => this.messages.update((messages) => [...messages, this.toChatMessage(body)]),
>>>>>>> Stashed changes
      error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to send message.')),
    });
  }

  onThreadSelected(chatId: string) {
<<<<<<< Updated upstream
    this.messageLoadRequest += 1;
    this.activeThreadId.set(chatId);
    const thread = this.chatHistory().find((chat) => chat.id === chatId);
    if (thread) this.selectedRepo.set(thread.repoId);
=======
    this.activeThreadId.set(chatId);
>>>>>>> Stashed changes
    this.messages.set([]);
    this.loadMessages(chatId);
  }

<<<<<<< Updated upstream
  private loadRepositories() {
    this.repoConfigService.getConfiguredRepositories().subscribe({
      next: ({ data }) => {
        this.repositoryError.set('');
        this.configuredRepos.set(data);
        if (!data.some((repo) => repo.id === this.selectedRepo())) {
          this.selectedRepo.set(data[0]?.id ?? '');
        }
      },
      error: (error: unknown) => this.repositoryError.set(this.getErrorMessage(error, 'Unable to load repositories.')),
    });
  }

  private loadChatHistory() {
    const selectionAtLoad = this.messageLoadRequest;
    this.isLoadingMessages.set(true);
    this.chatService.fetchChats().subscribe({
      next: ({ data }) => {
        this.chatHistory.set(data.map((chat) => this.toChatThread(chat)));
        if (selectionAtLoad !== this.messageLoadRequest) return;
        if (data.length) {
          this.onThreadSelected(data[0].id);
        } else {
          this.activeThreadId.set('');
          this.isLoadingMessages.set(false);
        }
      },
      error: (error: unknown) => {
        this.isLoadingMessages.set(false);
        this.messageError.set(this.getErrorMessage(error, 'Unable to load chat history.'));
      },
    });
  }

  private loadMessages(chatId: string) {
    if (!chatId) return;

    const requestId = ++this.messageLoadRequest;
=======
  private loadMessages(chatId: string) {
    if (!chatId) return;

>>>>>>> Stashed changes
    this.isLoadingMessages.set(true);
    this.messageError.set('');
    this.messageService
      .fetchMessages(chatId)
<<<<<<< Updated upstream
      .pipe(finalize(() => {
        if (requestId === this.messageLoadRequest) this.isLoadingMessages.set(false);
      }))
      .subscribe({
        next: ({ body }) => {
          if (requestId === this.messageLoadRequest && this.activeThreadId() === chatId) {
            this.messages.set(body.map((message) => this.toChatMessage(message)));
          }
        },
        error: (error: unknown) => {
          if (requestId === this.messageLoadRequest && this.activeThreadId() === chatId) {
            this.messageError.set(this.getErrorMessage(error, 'Unable to load messages.'));
          }
        },
=======
      .pipe(finalize(() => this.isLoadingMessages.set(false)))
      .subscribe({
        next: ({ body }) => this.messages.set(body.map((message) => this.toChatMessage(message))),
        error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to load messages.')),
>>>>>>> Stashed changes
      });
  }

  private toChatMessage(message: MessageRecord): ChatMessage {
    return {
      id: message.id,
      sender: message.sender ? 'user' : 'assistant',
      text: message.content,
      timestamp: new Date(message.createdAt),
    };
  }

<<<<<<< Updated upstream
  private toChatThread(chat: ChatRecord): ChatThread {
    return {
      id: chat.id,
      title: chat.chatName || 'New Chat',
      repoName: chat.gitRepo.repoUrl,
      repoId: chat.repoId,
    };
  }

  private upsertChatThread(chat: ChatRecord) {
    const thread = this.toChatThread(chat);
    this.chatHistory.update((threads) => [thread, ...threads.filter((item) => item.id !== thread.id)]);
  }

=======
>>>>>>> Stashed changes
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