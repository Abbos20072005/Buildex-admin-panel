import { api, ApiError, extractTokens, session } from "@/shared/api";
import type { AdminUser, LoginCredentials } from "../model/types";

interface AdminDto {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
}

function toAdminUser(dto: AdminDto): AdminUser {
  const name = [dto.first_name, dto.last_name].filter(Boolean).join(" ").trim();
  return {
    id: dto.id,
    username: dto.username,
    name: name || dto.username,
    isSuperuser: !!dto.is_superuser,
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

  logout() {
    session.clear();
  },

  /** profile cached from the last session (only if a token is still stored) */
  cachedUser(): AdminUser | null {
    return session.accessToken ? session.getCached<AdminUser>() : null;
  },
};
