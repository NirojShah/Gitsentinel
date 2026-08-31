import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
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
  configuredRepos = input<string[]>([]);
  selectedRepo = input<string>('');
  messages = input<ChatMessage[]>([]);

  repoChanged = output<string>();
  messageSent = output<string>();

  inputMessage = signal<string>('');

  handleSend() {
    if (!this.inputMessage().trim()) return;
    this.messageSent.emit(this.inputMessage());
    this.inputMessage.set('');
  }
}