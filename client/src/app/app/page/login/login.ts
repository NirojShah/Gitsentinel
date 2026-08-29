import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../component/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = signal<string>('');
  password = signal<string>('');

  handleLogin() {
    console.log('Logging in with:', {
      email: this.email(),
      password: this.password(),
    });
  }
}