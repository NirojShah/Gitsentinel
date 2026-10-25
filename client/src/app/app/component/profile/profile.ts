import { Component, inject, signal, type OnInit } from '@angular/core';
import { ProfileService, type ProfileIcon, type ProfileInfo } from './profile-service/profile-service';

@Component({
  imports: [],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {

  profileService = inject(ProfileService)
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
}
