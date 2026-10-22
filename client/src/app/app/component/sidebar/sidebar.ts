import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../button/button';
import type { RepoConfig } from '../repo-config/repo-config service/repo-config.service';

export interface ChatThread {
  id: string;
  title: string;
  repoName: string;
  repoId: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ButtonComponent, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  // Inputs from Parent
  chatHistory = input<ChatThread[]>([]);
  configuredRepos = input<RepoConfig[]>([]);
  activeThreadId = input<string>('');
  userName = input<string>('Developer');

  // Outputs to Parent
  newChatRequested = output<void>();
  threadSelected = output<string>();
  openConfigRequested = output<void>();
}