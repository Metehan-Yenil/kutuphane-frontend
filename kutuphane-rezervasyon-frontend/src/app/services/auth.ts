import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'https://backend-production-e7d0.up.railway.app/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, request).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }
}