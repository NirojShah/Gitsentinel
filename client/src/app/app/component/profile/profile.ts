import { Component, inject, type OnInit } from '@angular/core';
import { ProfileService, type ProfileIcon } from './profile-service/profile-service';

@Component({
  imports: [],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {

  profileService = inject(ProfileService)
  profileIcon: ProfileIcon | null = null;

  async ngOnInit() {
    this.profileIcon = this.profileService.profileIcon
  }
}
