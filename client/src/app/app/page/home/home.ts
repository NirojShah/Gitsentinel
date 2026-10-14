import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SidebarComponent, type ChatThread } from '../../component/sidebar/sidebar';
import { ChatWindowComponent, type ChatMessage } from '../../component/chat-window/chat-window';
import { RepoConfigModalComponent } from '../../component/repo-config/repo-config';
import { NavbarComponent } from '../../component/navbar/navbar';
import { MessageService, type MessageRecord } from '../../core/message-service/message.service';

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

  chatHistory = signal<ChatThread[]>([
    { id: '1', title: 'Fix auth memory leak', repoName: 'gitsentinel/client' },
  ]);
  configuredRepos = signal<string[]>(['gitsentinel/client', 'gitsentinel/server']);
  selectedRepo = signal<string>('gitsentinel/client');
  activeThreadId = signal<string>('1');
  isModalOpen = signal<boolean>(false);

  messages = signal<ChatMessage[]>([]);
  messageError = signal<string>('');
  isLoadingMessages = signal<boolean>(false);

  private readonly messageService = inject(MessageService);

  ngOnInit() {
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
    this.messageService.sendMessage(chatId, text).subscribe({
      next: ({ body }) => this.messages.update((messages) => [...messages, this.toChatMessage(body)]),
      error: (error: unknown) => this.messageError.set(this.getErrorMessage(error, 'Unable to send message.')),
    });
  }

  onThreadSelected(chatId: string) {
    this.activeThreadId.set(chatId);
    this.messages.set([]);
    this.loadMessages(chatId);
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