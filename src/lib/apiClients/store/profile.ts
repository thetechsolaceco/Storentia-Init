import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  storeId?: string;
  role?: string;
  status?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: { user: UserProfile } | UserProfile;
  message?: string;
  error?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
  error?: string;
}

function getStoreId(): string {
  const storeData = getStoreData();
  const storeId = storeData?.storeId || storeData?.store?.id;
  if (!storeId) {
    throw new Error("Store ID not found.");
  }
  return storeId;
}

export async function getUserProfile(): Promise<ProfileResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/@me`, {
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
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/@me`, {
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
