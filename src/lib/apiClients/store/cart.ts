import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    description?: string;
    price: number;
    status: string;
    images: Array<{
      id: string;
      url: string;
    }>;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponse {
  success: boolean;
  data?: Cart;
  message?: string;
  error?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

function getStoreId(): string {
  const storeData = getStoreData();
  const storeId = storeData?.storeId || storeData?.store?.id;
  if (!storeId) {
    throw new Error("Store ID not found.");
  }
  return storeId;
}

export async function getCart(): Promise<CartResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/cart`, {
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

export async function addToCart(data: AddToCartRequest): Promise<CartResponse> {
  try {
    const storeId = getStoreId();
    const url = `${BASE_URL}/store/${storeId}/cart`;
    const body = JSON.stringify(data);
    
    console.log('[Cart] Adding to cart:', { url, data, body });
    
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const result = await response.json();
    console.log('[Cart] Response:', result);

    if (!response.ok) {
      return { success: false, error: result.error?.message || `API Error: ${response.status}` };
    }
    return result;
  } catch (error) {
    console.error('[Cart] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

export async function removeFromCart(itemId: string): Promise<CartResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/cart/${itemId}`, {
      method: "DELETE",
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

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/cart`, {
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

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/cart/${itemId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      return { success: false, error: `API Error: ${response.status}` };
    }
    return response.json();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
