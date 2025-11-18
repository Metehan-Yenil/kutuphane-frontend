import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Gönderilen kayıt verisi:', this.registerData);

    this.authService.register(this.registerData).subscribe({
      next: (user) => {
        console.log('Kayıt başarılı:', user);
        console.log('Backend\'den dönen role:', user.role);
        this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Kayıt hatası:', error);
        this.errorMessage = error.error?.message || 'Kayıt sırasında bir hata oluştu!';
        this.isLoading = false;
      }
    });
  }
}