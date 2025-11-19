import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RoomsComponent } from './components/rooms/rooms';
import { ReservationsComponent } from './components/reservations/reservations';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { AuthService } from './services/auth';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'reservations', component: ReservationsComponent },
  {
  path: 'admin',
  component: AdminPanelComponent,
  canActivate: [() => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isAdmin()) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  }]
}

];