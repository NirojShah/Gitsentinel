  import { Component, input, output, signal } from '@angular/core';
  import { ButtonComponent } from '../button/button';

  @Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [ButtonComponent],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
  })
  export class NavbarComponent {
    // Inputs
    userName = input<string>('Niroj Shah');
    userAvatar = input<string>('N');
    activeRepo = input<string>('gitsentinel/client');

    // Outputs
    openConfigRequested = output<void>();
    newChatRequested = output<void>();

    // Profile Menu Toggle State
    isProfileMenuOpen = signal<boolean>(false);

    toggleProfileMenu() {
      this.isProfileMenuOpen.update((v) => !v);
    }
  }