import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../core/header.component';
import { CategoryService } from '../core/category.service';
import { Category } from '../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, HeaderComponent],
  template: `
    <div class="page">
      <app-header />
      <h2>Categories</h2>

      <form class="add" [formGroup]="form" (ngSubmit)="add()">
        <input type="text" placeholder="New category name" maxlength="100" formControlName="name" />
        <button type="submit" [disabled]="form.invalid">Add</button>
      </form>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <ul>
        @for (c of categories(); track c.id) {
          <li>
            @if (editingId() === c.id) {
              <input
                type="text"
                maxlength="100"
                [value]="c.name"
                #editInput
                (keyup.enter)="saveEdit(c, editInput.value)"
              />
              <button (click)="saveEdit(c, editInput.value)">Save</button>
              <button (click)="editingId.set(null)">Cancel</button>
            } @else {
              <span class="name">{{ c.name }}</span>
              <button (click)="editingId.set(c.id)">Rename</button>
              <button (click)="remove(c)">Delete</button>
            }
          </li>
        } @empty {
          <li class="empty">No categories yet. Add your first one above.</li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 600px;
        margin: 30px auto;
        padding: 0 16px;
      }
      .add {
        display: flex;
        gap: 8px;
        margin: 16px 0;
      }
      .add input {
        flex: 1;
      }
      input,
      button {
        padding: 8px;
        font-size: 14px;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      .name {
        flex: 1;
      }
      .empty {
        color: #777;
      }
      .error {
        color: #c0392b;
      }
    `,
  ],
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(CategoryService);

  categories = signal<Category[]>([]);
  editingId = signal<number | null>(null);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.list().subscribe((c) => this.categories.set(c));
  }

  add() {
    const name = this.form.getRawValue().name.trim();
    if (!name) return;
    this.error.set('');
    this.api.create(name).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Could not add the category.'),
    });
  }

  saveEdit(c: Category, value: string) {
    const name = value.trim();
    if (!name) return;
    this.error.set('');
    this.api.rename(c.id, name).subscribe({
      next: () => {
        this.editingId.set(null);
        this.load();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Could not rename the category.'),
    });
  }

  remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.error.set('');
    this.api.remove(c.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message ?? 'Could not delete the category.'),
    });
  }
}
