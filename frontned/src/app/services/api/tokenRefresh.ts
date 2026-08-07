import type { AuthResponse, RefreshTokenPayload } from "../../types/auth";
import { API_ENDPOINTS } from "../../constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken } as RefreshTokenPayload),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}
