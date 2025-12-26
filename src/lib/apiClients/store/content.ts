import { BASE_URL } from "../shared";

export interface ContentFileData {
  title: string;
  content: string;
  lastUpdated: string;
}

export interface ContentItem {
  id: string;
  store_id: string;
  file_key: string;
  file_data: ContentFileData;
  createdAt: string;
  updatedAt: string;
}

export interface ContentResponse {
  success: boolean;
  data?: ContentItem[];
  message?: string;
}

export interface SingleContentResponse {
  success: boolean;
  data?: ContentItem;
  message?: string;
}

// Predefined policy keys
export const POLICY_KEYS = {
  PRIVACY: "privacy-policy",
  TERMS: "terms-of-service",
  SHIPPING: "shipping-policy",
  REFUND: "refund-policy",
  ABOUT: "about-us",
} as const;

function getStoreId(): string {
  const envStoreId = process.env.NEXT_PUBLIC_STORENTIA_STOREID;
  if (envStoreId) return envStoreId;
  throw new Error("Store ID not found.");
}

export async function getPublicContent(storeId?: string): Promise<ContentResponse> {
  try {
    const id = storeId || getStoreId();
    const response = await fetch(`${BASE_URL}/store/${id}/public/content`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, message: `API Error: ${response.status}` };
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function getContentBySlug(
  slug: string,
  storeId?: string
): Promise<SingleContentResponse> {
  try {
    const id = storeId || getStoreId();
    const response = await fetch(`${BASE_URL}/store/${id}/public/content/${slug}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, message: `API Error: ${response.status}` };
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}
