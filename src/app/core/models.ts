export interface AuthResponse {
  token: string;
  email: string;
  expiresAt: string;
}

export interface Category {
  id: number;
  name: string;
}
export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  note: string | null;
  date: string;
  categoryId: number;
  categoryName: string;
}

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  note: string | null;
  date: string;
  categoryId: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionFilter {
  page: number;
  pageSize: number;
  fromDate?: string;
  toDate?: string;
  categoryId?: number | null;
  type?: string;
}