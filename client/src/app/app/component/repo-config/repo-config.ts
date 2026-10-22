import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../button/button';
import RepoConfigService, { type CreateRepoConfig } from './repo-config service/repo-config.service';

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
  errorMessage = signal<string>('');
  closeModal = output<void>();
  repoSaved = output<void>();

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      provider: [GitProvider.GITHUB, [Validators.required]],
      repoUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      accessToken: ['', [Validators.required]],
      baseBranch: ['main', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.isSubmitting()) return;
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);
    this.repoService
      .createRepoConfig(this.configForm.value as CreateRepoConfig)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.repoSaved.emit();
          this.closeModal.emit();
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  handleClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.handleClose();
    }
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = error.error;
      if (typeof responseError === 'object' && responseError !== null && 'message' in responseError) {
        const message = responseError.message;
        if (typeof message === 'string') return message;
      }
    }
    if (error instanceof Error) return error.message;
    return 'Unable to save repository configuration.';
  }
}
