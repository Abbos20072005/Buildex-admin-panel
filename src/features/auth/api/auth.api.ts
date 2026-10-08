import { api, ApiError, extractTokens, session } from "@/shared/api";
import type { AdminUser, ChangePasswordInput, LoginCredentials } from "../model/types";

interface AdminDto {
  id: number;
  username: string;
  full_name?: string;
  position?: string;
  access_level?: "staff" | "super_admin";
  must_change_password?: boolean;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
}

function toAdminUser(dto: AdminDto): AdminUser {
  const legacyName = [dto.first_name, dto.last_name].filter(Boolean).join(" ").trim();
  return {
    id: dto.id,
    username: dto.username,
    name: dto.full_name?.trim() || legacyName || dto.username,
    position: dto.position?.trim() ?? "",
    isSuperuser: dto.access_level === "super_admin" || !!dto.is_superuser,
    mustChangePassword: !!dto.must_change_password,
  };
}

export const authApi = {
  /** GET /admin/auth/me/ */
  async me(): Promise<AdminUser> {
    const user = toAdminUser(await api.get<AdminDto>("/auth/me/"));
    session.setCached(user);
    return user;
  },

  /** POST /admin/auth/login/ → tokens, then the profile */
  async login({ username, password }: LoginCredentials): Promise<AdminUser> {
    const data = await api.post<unknown>(
      "/auth/login/",
      { username: username.trim(), password },
      { retryOnUnauthorized: false },
    );
    const tokens = extractTokens(data);
    if (!tokens.access) throw new ApiError(500, "no-token", data);
    session.setTokens(tokens.access, tokens.refresh);

    try {
      return await authApi.me();
    } catch (error) {
      session.clear();
      throw error;
    }
  },

  /** POST /admin/auth/change-password/ → the profile (tokens stay valid) */
  async changePassword({ oldPassword, newPassword }: ChangePasswordInput): Promise<AdminUser> {
    const user = toAdminUser(
      await api.post<AdminDto>("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      }),
    );
    session.setCached(user);
    return user;
  },

  logout() {
    session.clear();
  },

  /** profile cached from the last session (only if a token is still stored) */
  cachedUser(): AdminUser | null {
    return session.accessToken ? session.getCached<AdminUser>() : null;
  },
};
