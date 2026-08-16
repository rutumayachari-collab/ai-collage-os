import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { AuthResponse, LoginCredentials, RegisterCredentials } from "../types/auth";
import type { ApiResponse } from "../types/api";

export class AuthService extends BaseService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials);
  }

  async logout(): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  }
}

export const authService = new AuthService();
