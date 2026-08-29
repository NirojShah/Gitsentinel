import { Component, input, output } from '@angular/core';

export type ButtonType = 'primary' | 'secondary' | 'normal';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class ButtonComponent {
  title = input.required<string>();
  type = input<ButtonType>('normal');
  size = input<ButtonSize>('md');

  // Outputs
  onClick = output<void>();

  handleClick() {
    this.onClick.emit();
  }
}