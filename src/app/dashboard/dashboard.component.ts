import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { API_URL } from '../core/config';
import { Category } from '../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="page">
      <header>
        <h2>Dashboard</h2>
        <div>
          <span>{{ auth.email() }}</span>
          <button (click)="auth.logout()">Log out</button>
        </div>
      </header>

      <h3>Your categories ({{ categories().length }})</h3>
      <ul>
        @for (c of categories(); track c.id) {
          <li>{{ c.name }}</li>
        } @empty {
          <li>No categories yet.</li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 700px;
        margin: 40px auto;
        padding: 0 16px;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      header span {
        margin-right: 12px;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  categories = signal<Category[]>([]);

  ngOnInit() {
    this.http.get<Category[]>(`${API_URL}/categories`).subscribe((c) => this.categories.set(c));
  }
}
