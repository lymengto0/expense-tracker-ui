import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="left">
        <span class="brand"><i></i>Expense Tracker</span>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
        </nav>
      </div>
      <div class="right">
        <span class="email">{{ auth.email() }}</span>
        <button (click)="auth.logout()">Log out</button>
      </div>
    </header>
  `,
  styles: [`
    header {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px;
      padding: 18px 0; margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    .left, .right, nav { display: flex; align-items: center; gap: 8px; }
    .left { gap: 24px; flex-wrap: wrap; }
    .brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; }
    .brand i {
      width: 12px; height: 12px; border-radius: 4px; display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }
    nav a {
      padding: 6px 12px; border-radius: 8px; color: var(--muted);
      font-weight: 500; text-decoration: none;
    }
    nav a:hover { background: #eef0f4; color: var(--text); }
    nav a.active { background: var(--primary-soft); color: var(--primary); }
    .email { color: var(--muted); font-size: 14px; }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
}