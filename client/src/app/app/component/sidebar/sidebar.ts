import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

export interface ChatThread {
  id: string;
  title: string;
  repoName: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  // Inputs from Parent
  chatHistory = input<ChatThread[]>([]);
  configuredRepos = input<string[]>([]);
  activeThreadId = input<string>('');
  userName = input<string>('Developer');

  // Outputs to Parent
  newChatRequested = output<void>();
  threadSelected = output<string>();
  openConfigRequested = output<void>();
}