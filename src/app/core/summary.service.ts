import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from './config';
import { Summary } from './models';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);

  get(month: number, year: number) {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<Summary>(`${API_URL}/summary`, { params });
  }
}
