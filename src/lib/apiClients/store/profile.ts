import { BASE_URL } from "../shared";
import { API_ENDPOINTS } from "../api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: { user: UserProfile };
  message?: string;
  error?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
  error?: string;
}

export async function getUserProfile(): Promise<ProfileResponse> {
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_ME}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }
    return response.json();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function updateUserProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  try {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_PROFILE}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }
    return response.json();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
