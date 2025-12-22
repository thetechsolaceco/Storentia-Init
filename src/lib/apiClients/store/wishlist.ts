import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";

export interface WishlistProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  storeId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
  }>;
}

export interface WishlistItem {
  id: string;
  productId: string;
  wishlistId: string;
  createdAt: string;
  product: WishlistProduct;
}

export interface Wishlist {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  wishlistItems: WishlistItem[];
}

export interface WishlistResponse {
  success: boolean;
  data?: Wishlist;
  message?: string;
  error?: string;
}

export interface WishlistCountResponse {
  success: boolean;
  data?: { itemCount: number };
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

export async function getWishlist(): Promise<WishlistResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/wishlist`, {
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

export async function getWishlistCount(): Promise<WishlistCountResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/wishlist/count`, {
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

export async function addToWishlist(productId: string): Promise<WishlistResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/wishlist`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }
    return response.json();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function removeFromWishlist(itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/wishlist/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function clearWishlist(): Promise<{ success: boolean; error?: string }> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/wishlist`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
