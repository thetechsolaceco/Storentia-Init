import { BASE_URL } from "../shared";
import { API_ENDPOINTS } from "../api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: string;
}

export interface StoreOwner {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: StoreOwner;
}

export interface StoreData {
  keyId: string;
  storeId: string;
  store: Store;
  permissions: string[];
  type: string;
  metadata?: {
    description?: string;
  };
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  store_data?: StoreData;
}

export interface UserResponse {
  success: boolean;
  data?: {
    user: User;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const authAPI = {
  async validateKey(apiKey: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.AUTH_VALIDATE_KEY}?key=${encodeURIComponent(apiKey)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error occurred",
      };
    }
  },

  getGoogleAuthUrl(): string {
    return `${BASE_URL}${API_ENDPOINTS.AUTH_GOOGLE}`;
  },

  initiateGoogleAuth(): void {
    window.location.href = `${BASE_URL}${API_ENDPOINTS.AUTH_GOOGLE}`;
  },

  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_ME}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        return { success: false };
      }
      const data: UserResponse = await response.json();
      return data;
    } catch {
      return { success: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH_LOGOUT}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    clearUserSession();
  },
};

const STORAGE_KEYS = {
  USER: "storentia_user",
  API_KEY: "storentia_api_key",
  STORE: "storentia_store",
} as const;

export function setUserSession(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export function getUserSession(): { user: User | null } {
  if (typeof window === "undefined") {
    return { user: null };
  }
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  const user = userStr ? JSON.parse(userStr) : null;
  return { user };
}

export function clearUserSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.STORE);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const result = await authAPI.getCurrentUser();
  return result.success && !!result.data?.user;
}

export function isAuthenticatedLocal(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEYS.USER);
}

export function setApiKey(apiKey: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }
}

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
}

export function setStoreData(storeData: StoreData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(storeData));
  }
}

export function getStoreData(): StoreData | null {
  if (typeof window === "undefined") return null;
  const storeStr = localStorage.getItem(STORAGE_KEYS.STORE);
  return storeStr ? JSON.parse(storeStr) : null;
}

export function setAuthSession(storeData: StoreData, apiKey: string): void {
  setApiKey(apiKey);
  setStoreData(storeData);
}

export function getAuthSession(): {
  apiKey: string | null;
  storeData: StoreData | null;
} {
  return {
    apiKey: getApiKey(),
    storeData: getStoreData(),
  };
}

export function clearAuthSession(): void {
  clearUserSession();
}
