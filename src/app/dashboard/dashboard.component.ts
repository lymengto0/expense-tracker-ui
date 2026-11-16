import {
  Component, DestroyRef, ElementRef, OnInit, effect, inject, signal, viewChild,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { HeaderComponent } from '../core/header.component';
import { SummaryService } from '../core/summary.service';
import { TransactionService } from '../core/transaction.service';
import { Summary, Transaction } from '../core/models';

Chart.register(...registerables);

const COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, DecimalPipe, DatePipe],
  template: `
    <div class="page">
      <app-header />

      <div class="top">
        <h2>Dashboard</h2>
        <label>Month
          <input type="month" #monthInput [value]="month()"
                 (change)="onMonthChange(monthInput.value)" />
        </label>
      </div>

      @if (error()) { <p class="error">{{ error() }}</p> }

      @if (summary(); as s) {
        <div class="cards">
          <div class="card">
            <span>Income</span>
            <strong class="income">{{ s.totalIncome | number: '1.2-2' }}</strong>
          </div>
          <div class="card">
            <span>Expenses</span>
            <strong class="expense">{{ s.totalExpense | number: '1.2-2' }}</strong>
          </div>
          <div class="card">
            <span>Balance</span>
            <strong [class.income]="s.balance >= 0" [class.expense]="s.balance < 0">
              {{ s.balance | number: '1.2-2' }}
            </strong>
          </div>
        </div>

        <h3>Spending by category</h3>
        @if (s.byCategory.length > 0) {
          <div class="chart-wrap"><canvas #chartCanvas></canvas></div>
          <table>
            <tbody>
              @for (c of s.byCategory; track c.categoryId) {
                <tr>
                  <td>{{ c.categoryName }}</td>
                  <td class="num">{{ c.total | number: '1.2-2' }}</td>
                  <td class="num">{{ c.percent }}%</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty">No expenses in this month.</p>
        }
      }

      <h3>Recent transactions</h3>
      <table>
        <tbody>
          @for (t of recent(); track t.id) {
            <tr>
              <td>{{ t.date | date: 'mediumDate' }}</td>
              <td>{{ t.categoryName }}</td>
              <td>{{ t.note }}</td>
              <td class="num" [class.income]="t.type === 'Income'" [class.expense]="t.type === 'Expense'">
                {{ t.type === 'Income' ? '+' : '-' }}{{ t.amount | number: '1.2-2' }}
              </td>
            </tr>
          } @empty {
            <tr><td class="empty">No transactions yet.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page { max-width: 800px; margin: 30px auto; padding: 0 16px; }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .top label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
    input { padding: 7px; font-size: 14px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px;
            display: flex; flex-direction: column; gap: 6px; }
    .card span { color: #666; font-size: 14px; }
    .card strong { font-size: 24px; }
    .chart-wrap { position: relative; height: 320px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    .num { text-align: right; }
    .income { color: #1e8e3e; }
    .expense { color: #c0392b; }
    .empty { color: #777; }
    .error { color: #c0392b; }
  `],
})
export class DashboardComponent implements OnInit {
  private summaryApi = inject(SummaryService);
  private txApi = inject(TransactionService);

  month = signal(new Date().toISOString().slice(0, 7)); // "2026-11"
  summary = signal<Summary | null>(null);
  recent = signal<Transaction[]>([]);
  error = signal('');

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  constructor() {
    // Redraw the chart whenever the data or the canvas changes
    effect(() => {
      const s = this.summary();
      const el = this.canvas();
      this.chart?.destroy();
      this.chart = null;
      if (!s || !el || s.byCategory.length === 0) return;

      this.chart = new Chart(el.nativeElement, {
        type: 'doughnut',
        data: {
          labels: s.byCategory.map((c) => c.categoryName),
          datasets: [{
            data: s.byCategory.map((c) => c.total),
            backgroundColor: s.byCategory.map((_, i) => COLORS[i % COLORS.length]),
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    });

    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }

  ngOnInit() {
    this.loadSummary();
    this.txApi.list({ page: 1, pageSize: 5 }).subscribe({
      next: (r) => this.recent.set(r.items),
    });
  }

  onMonthChange(value: string) {
    if (!value) return;
    this.month.set(value);
    this.loadSummary();
  }

  private loadSummary() {
    const [year, month] = this.month().split('-').map(Number);
    this.error.set('');
    this.summaryApi.get(month, year).subscribe({
      next: (s) => this.summary.set(s),
      error: () => this.error.set('Could not load the summary.'),
    });
  }
}