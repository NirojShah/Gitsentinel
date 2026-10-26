import { Component, inject, signal, type OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileService, type ProfileIcon, type ProfileInfo } from './profile-service/profile-service';

@Component({
  imports: [RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly router = inject(Router);
  profileService = inject(ProfileService);
  profileIcon: ProfileIcon | null = null;
  profileInfo = signal<ProfileInfo | null>(null);
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const profile = await this.profileService.fetchProfileInfo();
      this.profileInfo.set(profile);
      this.profileService.fetchprofileIcon(profile.name || profile.username);
      this.profileIcon = this.profileService.profileIcon;
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to load profile.');
    } finally {
      this.isLoading.set(false);
    }
  }

  signOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
