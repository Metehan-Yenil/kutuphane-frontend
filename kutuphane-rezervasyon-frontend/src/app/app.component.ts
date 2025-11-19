import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="app-container">
      @if (authService.isLoggedIn()) {
      <nav class="navbar">
        <div class="nav-brand">
          <h2>📚 Kütüphane Rezervasyon</h2>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/rooms" routerLinkActive="active">Odalar</a>
          <a routerLink="/reservations" routerLinkActive="active">Rezervasyonlarım</a>
          <button class="logout-btn" (click)="logout()">Çıkış</button>
        </div>
        <div class="user-info">
          <span>👤 {{ authService.getCurrentUser()?.name }}</span>
          @if (authService.isAdmin()) {
            <span class="badge">ADMIN</span>
          }
        </div>
      </nav>
      }
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .navbar {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .nav-links {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background: #34495e;
    }

    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .user-info {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .badge {
      background: #f39c12;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .main-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}