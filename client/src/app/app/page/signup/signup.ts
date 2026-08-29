import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../component/button/button';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  // Required fields based on UserCreateInput
  email = signal<string>('');
  username = signal<string>('');
  password = signal<string>('');
  
  // Optional fields & UI validation
  name = signal<string>('');
  confirmPassword = signal<string>('');

  handleSignup() {
    if (this.password() !== this.confirmPassword()) {
      alert('Passwords do not match!');
      return;
    }

    // Matches your UserCreateInput type structure
    const payload = {
      email: this.email(),
      username: this.username(),
      password: this.password(),
      name: this.name() || null, // Optional in UserCreateInput
    };

    console.log('UserCreateInput Payload:', payload);
  }
}