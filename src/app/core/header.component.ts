import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <nav>
        <strong>Expense Tracker</strong>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
        <a routerLink="/categories" routerLinkActive="active">Categories</a>
      </nav>
      <div>
        <span>{{ auth.email() }}</span>
        <button (click)="auth.logout()">Log out</button>
      </div>
    </header>
  `,
  styles: [`
    header { display: flex; justify-content: space-between; align-items: center;
             padding: 12px 0; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
    nav { display: flex; gap: 16px; align-items: center; }
    a { text-decoration: none; color: #555; }
    a.active { color: #0b5ed7; font-weight: 600; }
    span { margin-right: 12px; color: #555; }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
}