import { Component, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-repo-config-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './repo-config.html',
  styleUrl: './repo-config.scss',
})
export class RepoConfigModalComponent {
  closeModal = output<void>();
}