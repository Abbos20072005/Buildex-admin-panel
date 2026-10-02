export interface AdminUser {
  id: number;
  username: string;
  /** "First Last", falls back to the username */
  name: string;
  isSuperuser: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
