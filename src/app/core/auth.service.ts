import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { AuthResponse } from './models';

const STORAGE_KEY = 'expense_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private session = signal<AuthResponse | null>(this.load());

  readonly email = () => this.session()?.email ?? '';

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  isLoggedIn(): boolean {
    const s = this.session();
    return !!s && new Date(s.expiresAt).getTime() > Date.now();
  }

  register(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, { email, password })
      .pipe(tap((res) => this.save(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.save(res)));
  }

  logout() {
    this.session.set(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    this.router.navigate(['/login']);
  }

  private save(res: AuthResponse) {
    this.session.set(res);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(res)); } catch {}
  }

  private load(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}