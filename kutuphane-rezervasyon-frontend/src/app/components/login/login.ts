import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  public notificationService = inject(NotificationService);

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;

  onSubmit(): void {
    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (user) => {
        console.log('Giriş başarılı:', user);
        this.notificationService.success('Giriş başarılı!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (error) => {
        console.error('Giriş hatası:', error);
        this.notificationService.error('Email veya şifre hatalı!');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}