  import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
  import { ButtonComponent } from '../button/button';
  import { Router, RouterLink } from '@angular/router';
  import { ProfileService, type ProfileInfo } from '../profile/profile-service/profile-service';

  @Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [ButtonComponent, RouterLink],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
  })
  export class NavbarComponent implements OnInit {
    // Inputs
    userName = input<string>('Account');
    userAvatar = input<string>('A');
    activeRepo = input<string>('gitsentinel/client');
    readonly profileInfo = signal<ProfileInfo | null>(null);
    readonly profileError = signal<string>('');
    readonly displayedName = computed(
      () => this.profileInfo()?.name || this.profileInfo()?.username || this.userName(),
    );
    readonly displayedAvatar = computed(() => {
      const initials = this.displayedName()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('');
      return initials.toUpperCase() || this.userAvatar();
    });
    private readonly profileService = inject(ProfileService);
    private readonly router = inject(Router);

    // Outputs
    openConfigRequested = output<void>();
    newChatRequested = output<void>();

    // Profile Menu Toggle State
    isProfileMenuOpen = signal<boolean>(false);

    ngOnInit(): void {
      this.profileService.fetchProfileInfo()
        .then((profile) => this.profileInfo.set(profile))
        .catch((error: unknown) => {
          this.profileError.set(error instanceof Error ? error.message : 'Unable to load account details.');
        });
    }

    toggleProfileMenu() {
      this.isProfileMenuOpen.update((v) => !v);
    }

    signOut(): void {
      localStorage.removeItem('token');
      void this.router.navigate(['/login']);
    }
  }