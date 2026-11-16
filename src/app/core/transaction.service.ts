import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from './config';
import { PagedResult, Transaction, TransactionFilter, TransactionInput } from './models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private url = `${API_URL}/transactions`;

  list(f: TransactionFilter) {
    let params = new HttpParams().set('page', f.page).set('pageSize', f.pageSize);
    if (f.fromDate) params = params.set('fromDate', f.fromDate);
    if (f.toDate) params = params.set('toDate', f.toDate);
    if (f.categoryId) params = params.set('categoryId', f.categoryId);
    if (f.type) params = params.set('type', f.type);
    return this.http.get<PagedResult<Transaction>>(this.url, { params });
  }

  create(input: TransactionInput) {
    return this.http.post<Transaction>(this.url, input);
  }

  update(id: number, input: TransactionInput) {
    return this.http.put<void>(`${this.url}/${id}`, input);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
