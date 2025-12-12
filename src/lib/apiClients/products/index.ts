import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";
import { API_ENDPOINTS } from "../api";

export type ProductStatus = "ACTIVE" | "DRAFT" | "UNLISTED";

export interface ProductImage {
  id: string;
  url: string;
  storeId?: string;
  productId?: string;
  metadata?: {
    s3Key?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price?: number;
  storeId?: string;
  sku?: string;
  status?: ProductStatus;
  stock?: number;
  images?: ProductImage[];
  collections?: unknown[];
  user_cartId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  success: boolean;
  data?: Product[];
  pagination?: Pagination;
  message?: string;
}

export interface ProductResponse {
  success: boolean;
  data?: Product;
  message?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  data?: ProductImage;
  message?: string;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price?: number;
  sku?: string;
  status: ProductStatus;
  stock?: number;
  category?: string;
  tags?: string[];
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  sku?: string;
  status?: ProductStatus;
  stock?: number;
  category?: string;
  tags?: string[];
}

function getStoreId(): string {
  const storeData = getStoreData();
  const storeId = storeData?.storeId || storeData?.store?.id;
  if (!storeId) {
    throw new Error("Store ID not found. Please validate your API key first.");
  }
  return storeId;
}

function getProductsEndpoint(storeId: string): string {
  return `${API_ENDPOINTS.USER_STORE}/${storeId}/products`;
}


export const productsAPI = {
  async getAll(params?: ProductParams): Promise<ProductsResponse> {
    try {
      const storeId = getStoreId();
      const query = new URLSearchParams();
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.status) query.append("status", params.status);
      if (params?.search) query.append("search", params.search);
      const queryStr = query.toString();

      const response = await fetch(
        `${BASE_URL}${getProductsEndpoint(storeId)}${queryStr ? `?${queryStr}` : ""}`,
        { method: "GET", credentials: "include" }
      );

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async getById(productId: string): Promise<ProductResponse> {
    try {
      const storeId = getStoreId();
      const response = await fetch(
        `${BASE_URL}${getProductsEndpoint(storeId)}/${productId}`,
        { method: "GET", credentials: "include" }
      );

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async create(data: CreateProductData): Promise<ProductResponse> {
    try {
      const storeId = getStoreId();
      const response = await fetch(`${BASE_URL}${getProductsEndpoint(storeId)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData?.error?.message || `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async update(productId: string, data: UpdateProductData): Promise<ProductResponse> {
    try {
      const storeId = getStoreId();
      const response = await fetch(`${BASE_URL}${getProductsEndpoint(storeId)}/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData?.error?.message || `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async delete(productId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const storeId = getStoreId();
      const response = await fetch(`${BASE_URL}${getProductsEndpoint(storeId)}/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async uploadImage(productId: string, file: File): Promise<ImageUploadResponse> {
    try {
      const storeId = getStoreId();
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${BASE_URL}${getProductsEndpoint(storeId)}/${productId}/images/upload`,
        { method: "POST", credentials: "include", body: formData }
      );

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async removeImage(productId: string, imageId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const storeId = getStoreId();
      const response = await fetch(
        `${BASE_URL}${getProductsEndpoint(storeId)}/${productId}/images/${imageId}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async bulkUpdateStatus(productIds: string[], status: ProductStatus): Promise<{ success: boolean; message?: string }> {
    try {
      const storeId = getStoreId();
      const response = await fetch(`${BASE_URL}${getProductsEndpoint(storeId)}/bulk/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds, status }),
      });

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  async bulkDelete(productIds: string[]): Promise<{ success: boolean; message?: string }> {
    try {
      const storeId = getStoreId();
      const response = await fetch(`${BASE_URL}${getProductsEndpoint(storeId)}/bulk/delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },
};
