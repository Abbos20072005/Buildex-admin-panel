/** Kirish darajasi: "Xodim" works in the sections, "Super admin" also manages the staff. */
export type AccessLevel = "staff" | "super_admin";

/** `blocked` is read-only: it changes through the block / unblock actions. */
export type StaffStatus = "active" | "blocked";

/** Why an account is blocked: by an admin, or by 5 wrong passwords in a row. */
export type BlockReason = "manual" | "failed_attempts";

/** Xodim: an account that signs in to the admin panel with a login and a password. */
export interface StaffMember {
  id: number;
  username: string;
  fullName: string;
  /** job title; empty when not set */
  position: string;
  accessLevel: AccessLevel;
  mustChangePassword: boolean;
  status: StaffStatus;
  blockReason: BlockReason | null;
  failedLoginAttempts: number;
  /** ISO time; null — never signed in */
  lastLogin: string | null;
  /** who created the account; null — the system */
  createdBy: { id: number; username: string; fullName: string } | null;
  createdAt: string;
}

/** What the editor sends (POST creates, PATCH changes everything but the login and password). */
export interface StaffInput {
  fullName: string;
  position: string;
  accessLevel: AccessLevel;
  mustChangePassword: boolean;
}

/** Create-only fields. */
export interface StaffCreateInput extends StaffInput {
  username: string;
  password: string;
}

export interface StaffFilters {
  search?: string;
  accessLevel?: AccessLevel;
  status?: StaffStatus;
}

export interface StaffListParams {
  filters: StaffFilters;
  page: number;
  pageSize: number;
}

/** Answer of "Parolni tiklash": the password is shown once. */
export interface ResetPasswordResult {
  password: string;
  mustChangePassword: boolean;
}
