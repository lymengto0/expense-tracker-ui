export interface AuthResponse {
  token: string;
  email: string;
  expiresAt: string;
}

export interface Category {
  id: number;
  name: string;
}