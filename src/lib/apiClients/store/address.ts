import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";

// The nested address data structure from API
export interface AddressData {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

// Full billing/address record from API
export interface Address {
  id: string;
  address: AddressData;
  createdAt: string;
}

export interface CreateAddressRequest {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  success: boolean;
  data?: Address[];
  error?: string;
}

export interface SingleAddressResponse {
  success: boolean;
  data?: Address;
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

export async function getAllAddresses(): Promise<AddressResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/billing`, {
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

export async function createAddress(data: CreateAddressRequest): Promise<SingleAddressResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/billing`, {
      method: "POST",
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

export async function updateAddress(addressId: string, data: CreateAddressRequest): Promise<SingleAddressResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/billing/${addressId}`, {
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

export async function deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/billing/${addressId}`, {
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

export async function setDefaultAddress(addressId: string): Promise<SingleAddressResponse> {
  try {
    const storeId = getStoreId();
    const response = await fetch(`${BASE_URL}/store/${storeId}/billing/${addressId}/default`, {
      method: "PATCH",
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
