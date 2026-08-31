import { Component, signal } from '@angular/core';
import { SidebarComponent, type ChatThread } from '../../component/sidebar/sidebar';
import { ChatWindowComponent, type ChatMessage } from '../../component/chat-window/chat-window';
import { RepoConfigModalComponent } from '../../component/repo-config/repo-config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, ChatWindowComponent, RepoConfigModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
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

  messages = signal<ChatMessage[]>([
    { id: '1', sender: 'assistant', text: 'Hello! Ask me anything about your code.', timestamp: new Date() },
  ]);

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
    this.messages.set([]);
  }

  onSendMessage(text: string) {
    this.messages.update((m) => [...m, { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() }]);
  }
}