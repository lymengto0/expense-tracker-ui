import { Observable } from 'rxjs';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, Transaction, TransactionInput, TransactionType } from '../core/models';
import { TransactionService } from '../core/transaction.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <h3>{{ transaction() ? 'Edit transaction' : 'Add transaction' }}</h3>

      <div class="row">
        <label
          >Type
          <select formControlName="type">
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </label>
        <label
          >Amount
          <input type="number" step="0.01" min="0.01" formControlName="amount" />
        </label>
      </div>

      <div class="row">
        <label
          >Category
          <select formControlName="categoryId">
            <option value="">Select...</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </label>
        <label
          >Date
          <input type="date" formControlName="date" />
        </label>
      </div>

      <label
        >Note
        <input type="text" maxlength="500" formControlName="note" />
      </label>

      @if (categories().length === 0) {
        <p class="error">You have no categories yet. Create one first.</p>
      }
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <div class="actions">
        <button type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving...' : 'Save' }}
        </button>
        <button type="button" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(TransactionService);

  transaction = input<Transaction | null>(null);
  categories = input<Category[]>([]);
  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    type: ['Expense' as TransactionType, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    note: [''],
  });

  ngOnInit() {
    const t = this.transaction();
    if (t) {
      this.form.patchValue({
        type: t.type,
        amount: t.amount,
        categoryId: String(t.categoryId),
        date: t.date.slice(0, 10),
        note: t.note ?? '',
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const payload: TransactionInput = {
      type: v.type,
      amount: Number(v.amount),
      categoryId: Number(v.categoryId),
      date: `${v.date}T00:00:00`,
      note: v.note.trim() || null,
    };

    this.saving.set(true);
    this.error.set('');

    const observer = {
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.error.set(err.error?.message ?? 'Could not save. Check the values and try again.');
      },
    };

    const t = this.transaction();
    if (t) {
      this.api.update(t.id, payload).subscribe(observer);
    } else {
      this.api.create(payload).subscribe(observer);
    }
  }
}
