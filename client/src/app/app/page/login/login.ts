import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../component/button/button';
import LoginService from './login-service/login-serivce';

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
  loginService = inject(LoginService)

  message = this.loginService.errorMessage

  handleLogin() {
    this.loginService.login(this.email(), this.password())
      .subscribe(data => {
        console.log(data)
      })
  };
}
