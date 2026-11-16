import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Create account</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="email" placeholder="Email" formControlName="email" />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          formControlName="password"
        />
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Please wait...' : 'Register' }}
        </button>
      </form>
      <p>Already have an account? <a routerLink="/login">Log in</a></p>
    </div>
  `,
  styles: [
    `
      .box {
        max-width: 340px;
        margin: 80px auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      input,
      button {
        padding: 10px;
        font-size: 16px;
      }
      .error {
        color: #c0392b;
        margin: 0;
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();

    this.auth.register(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not register. Is the API running?');
      },
    });
  }
}
