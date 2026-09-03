import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../button/button';
import RepoConfigService, { type CreateRepoConfig } from './repo-config service/repo-config.service';
import { config } from 'rxjs';

export enum GitProvider {
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  BITBUCKET = 'BITBUCKET',
}

@Component({
  selector: 'app-repo-config-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './repo-config.html',
  styleUrl: './repo-config.scss',
})
export class RepoConfigModalComponent {

  repoService = inject(RepoConfigService);
  providers = Object.values(GitProvider);
  configForm: FormGroup;
  isSubmitting = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      provider: [GitProvider.GITHUB, [Validators.required]],
      repoUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      accessToken: ['', [Validators.required]],
      baseBranch: ['main', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      console.warn('[RepoConfigModal] Form is invalid:', this.configForm.errors);
      return;
    }

    this.isSubmitting.set(true);
    console.log('[RepoConfigModal] Submitting GitRepo Config:', this.configForm.value);

    this.repoService.createRepoConfig(this.configForm.value as CreateRepoConfig);

  }

  handleClose() {
    console.log('[RepoConfigModal] Close requested');
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.handleClose();
    }
  }
}