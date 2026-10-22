import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  AiConfigurationService,
  type AiConfiguration as AiConfigurationType,
  type AiConfigurationInput,
  type AiProvider,
} from './ai-configuration.service';

const AI_PROVIDERS: AiProvider[] = ['openai', 'claude', 'gemini'];

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-ai-configuration',
  styleUrl: './ai-configuration.scss',
  templateUrl: './ai-configuration.html',
})
export class AiConfiguration implements OnInit {
  private readonly aiConfigurationService = inject(AiConfigurationService);

  readonly providers = AI_PROVIDERS;
  readonly configurations = signal<AiConfigurationType[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly configForm = new FormGroup({
    provider: new FormControl<AiProvider>('openai', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    model: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
  });

  ngOnInit(): void {
    this.loadConfigurations();
  }

  loadConfigurations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.aiConfigurationService
      .getConfigurations()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.configurations.set(response.data ?? []),
        error: (error: unknown) =>
          this.errorMessage.set(this.getErrorMessage(error, 'Unable to load AI configurations.')),
      });
  }

  onSubmit(): void {
    if (this.isSaving()) return;
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    const configuration: AiConfigurationInput = {
      provider: this.configForm.controls.provider.value,
      model: this.configForm.controls.model.value.trim(),
    };
    const configurationId = this.editingId();

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSaving.set(true);
    const request = configurationId
      ? this.aiConfigurationService.updateConfiguration(configurationId, configuration)
      : this.aiConfigurationService.createConfiguration(configuration);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.resetForm();
        this.successMessage.set(
          configurationId ? 'AI configuration updated.' : 'AI configuration saved.',
        );
        this.loadConfigurations();
      },
      error: (error: unknown) =>
        this.errorMessage.set(this.getErrorMessage(error, 'Unable to save AI configuration.')),
    });
  }

  editConfiguration(configuration: AiConfigurationType): void {
    this.editingId.set(configuration.id);
    this.configForm.setValue({
      provider: configuration.provider,
      model: configuration.model,
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  cancelEditing(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.configForm.reset({
      provider: 'openai',
      model: '',
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = error.error;
      if (typeof responseError === 'object' && responseError !== null && 'message' in responseError) {
        const message = responseError.message;
        if (typeof message === 'string') return message;
      }
    }
    if (error instanceof Error) return error.message;
    return fallback;
  }
}
