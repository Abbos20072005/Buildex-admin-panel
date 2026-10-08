export interface AdminUser {
  id: number;
  username: string;
  /** full name, falls back to the username */
  name: string;
  /** job title; empty when not set */
  position: string;
  /** "Super admin" also reaches Sozlamalar → Xodimlar */
  isSuperuser: boolean;
  /** the account got a temporary password: the first screen is "set your own" */
  mustChangePassword: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}
