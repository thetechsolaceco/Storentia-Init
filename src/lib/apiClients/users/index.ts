import { fetchWithCredentials } from "../shared";
import { API_ENDPOINTS } from "../api";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff" | "customer";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserParams {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
}

export const usersAPI = {
  async getAll(params?: UserParams): Promise<UserAccount[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.offset) query.append("offset", String(params.offset));
    if (params?.search) query.append("search", params.search);
    if (params?.role) query.append("role", params.role);
    const queryStr = query.toString();
    return fetchWithCredentials(`${API_ENDPOINTS.USERS_GET_ALL}${queryStr ? `?${queryStr}` : ""}`);
  },

  async getById(id: string): Promise<UserAccount> {
    return fetchWithCredentials(`${API_ENDPOINTS.USERS_GET_BY_ID}/${id}`);
  },

  async create(data: Partial<UserAccount>): Promise<UserAccount> {
    return fetchWithCredentials(API_ENDPOINTS.USERS_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<UserAccount>): Promise<UserAccount> {
    return fetchWithCredentials(`${API_ENDPOINTS.USERS_UPDATE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchWithCredentials(`${API_ENDPOINTS.USERS_DELETE}/${id}`, {
      method: "DELETE",
    });
  },
};
