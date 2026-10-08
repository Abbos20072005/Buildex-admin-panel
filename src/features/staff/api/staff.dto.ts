/** Raw shape of /admin/staff/ — only the mappers touch this. */

export interface StaffDto {
  id: number;
  username: string;
  full_name: string;
  position?: string | null;
  access_level: "staff" | "super_admin";
  must_change_password?: boolean;
  status: "active" | "blocked";
  block_reason?: "manual" | "failed_attempts" | null;
  failed_login_attempts?: number;
  last_login?: string | null;
  created_by?: { id: number; username: string; full_name: string } | null;
  created_at: string;
}

export interface ResetPasswordDto {
  password: string;
  must_change_password: boolean;
}
