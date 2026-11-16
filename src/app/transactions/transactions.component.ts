import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../core/header.component';
import { CategoryService } from '../core/category.service';
import { TransactionService } from '../core/transaction.service';
import { Category, Transaction } from '../core/models';
import { TransactionFormComponent } from './transaction-form.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, HeaderComponent, TransactionFormComponent],
  template: `
    <div class="page">
      <app-header />

      <div class="top">
        <h2>Transactions</h2>
        <button (click)="openAdd()">+ Add transaction</button>
      </div>

      @if (showForm()) {
        <app-transaction-form
          [transaction]="editing()"
          [categories]="categories()"
          (saved)="onSaved()"
          (cancelled)="closeForm()"
        />
      }

      <form class="filters" [formGroup]="filters" (ngSubmit)="applyFilters()">
        <label>From <input type="date" formControlName="fromDate" /></label>
        <label>To <input type="date" formControlName="toDate" /></label>
        <label
          >Category
          <select formControlName="categoryId">
            <option value="">All</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </label>
        <label
          >Type
          <select formControlName="type">
            <option value="">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </label>
        <button type="submit">Filter</button>
        <button type="button" (click)="resetFilters()">Reset</button>
      </form>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th class="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (t of items(); track t.id) {
            <tr>
              <td>{{ t.date | date: 'mediumDate' }}</td>
              <td>{{ t.categoryName }}</td>
              <td>{{ t.note }}</td>
              <td
                class="num"
                [class.income]="t.type === 'Income'"
                [class.expense]="t.type === 'Expense'"
              >
                {{ t.type === 'Income' ? '+' : '-' }}{{ t.amount | number: '1.2-2' }}
              </td>
              <td class="actions">
                <button (click)="openEdit(t)">Edit</button>
                <button (click)="remove(t)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="empty">
                {{ loading() ? 'Loading...' : 'No transactions found.' }}
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="paging">
        <button (click)="goTo(page() - 1)" [disabled]="page() <= 1">Previous</button>
        <span>Page {{ page() }} of {{ totalPages() }} ({{ total() }} total)</span>
        <button (click)="goTo(page() + 1)" [disabled]="page() >= totalPages()">Next</button>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 900px;
        margin: 30px auto;
        padding: 0 16px;
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-end;
        margin: 16px 0;
      }
      .filters label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;
      }
      input,
      select,
      button {
        padding: 7px;
        font-size: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 1px solid #eee;
      }
      .num {
        text-align: right;
      }
      .income {
        color: #1e8e3e;
      }
      .expense {
        color: #c0392b;
      }
      .actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }
      .empty {
        text-align: center;
        color: #777;
      }
      .paging {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 16px;
      }
      .error {
        color: #c0392b;
      }
    `,
  ],
})
export class TransactionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(TransactionService);
  private categoryApi = inject(CategoryService);

  readonly pageSize = 10;

  items = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);
  total = signal(0);
  page = signal(1);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editing = signal<Transaction | null>(null);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  filters = this.fb.nonNullable.group({
    fromDate: [''],
    toDate: [''],
    categoryId: [''],
    type: [''],
  });

  ngOnInit() {
    this.categoryApi.list().subscribe((c) => this.categories.set(c));
    this.load();
  }

  load() {
    const f = this.filters.getRawValue();
    this.loading.set(true);
    this.error.set('');

    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        fromDate: f.fromDate,
        toDate: f.toDate,
        categoryId: f.categoryId ? Number(f.categoryId) : null,
        type: f.type,
      })
      .subscribe({
        next: (r) => {
          this.items.set(r.items);
          this.total.set(r.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Could not load transactions.');
        },
      });
  }

  applyFilters() {
    this.page.set(1);
    this.load();
  }

  resetFilters() {
    this.filters.reset();
    this.page.set(1);
    this.load();
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  openAdd() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(t: Transaction) {
    this.editing.set(t);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  onSaved() {
    this.closeForm();
    this.load();
  }

  remove(t: Transaction) {
    if (!confirm(`Delete "${t.note || t.categoryName}" (${t.amount})?`)) return;
    this.api.remove(t.id).subscribe({
      next: () => {
        // If we deleted the last item on this page, go back one page
        if (this.items().length === 1 && this.page() > 1) this.page.update((p) => p - 1);
        this.load();
      },
      error: () => this.error.set('Could not delete the transaction.'),
    });
  }
}
