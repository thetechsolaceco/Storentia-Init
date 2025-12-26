import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";

export interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message?: string;
  error?: string;
}

function getStoreId(): string {
  // First try environment variable
  const envStoreId = process.env.NEXT_PUBLIC_STORENTIA_STOREID;
  if (envStoreId) return envStoreId;

  const storeData = getStoreData();
  const storeId = storeData?.storeId || storeData?.store?.id;
  if (!storeId) {
    throw new Error("Store ID not found.");
  }
  return storeId;
}

export async function submitContactForm(
  data: ContactFormRequest,
  storeId?: string
): Promise<ContactFormResponse> {
  try {
    const id = storeId || getStoreId();
    const response = await fetch(`${BASE_URL}/store/${id}/public/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        error: error.message || `API Error: ${response.status}`,
      };
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
