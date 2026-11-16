import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { API_URL } from '../core/config';
import { Category } from '../core/models';
import { HeaderComponent } from '../core/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports : [HeaderComponent],
  template: `
    <div class="page">
       <app-header />

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
