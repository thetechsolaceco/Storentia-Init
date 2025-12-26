import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";

export interface StoreInfo {
  id: string;
  name: string;
  description?: string;
  favicon?: string | null;
  logoBlackWhite?: string | null;
  logoColoured?: string | null;
  socialMediaUrls?: {
    twitter?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  whatsappNumber?: string;
  address?: string;
  mobile?: string;
  landline?: string;
  contactEmail?: string;
  supportEmail?: string;
  createdAt: string;
}

export interface StoreInfoResponse {
  success: boolean;
  data?: StoreInfo;
  message?: string;
}

export interface StoreProductImage {
  id: string;
  url: string;
  storeId: string;
  productId: string;
  metadata?: {
    s3Key?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductCollection {
  id: string;
  productId: string;
  collectionId: string;
  createdAt: string;
  collection: {
    id: string;
    title: string;
  };
}

export interface StoreProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  storeId: string;
  status: "ACTIVE" | "DRAFT" | "UNLISTED";
  createdAt: string;
  updatedAt: string;
  user_cartId?: string | null;
  images: StoreProductImage[];
  collections: ProductCollection[];
  _count?: {
    orderItems: number;
    wishlists: number;
  };
}

export interface StoreProductsResponse {
  success: boolean;
  data?: StoreProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface StoreProductResponse {
  success: boolean;
  data?: StoreProduct;
  message?: string;
}

export interface PublicProductParams {
  page?: number;
  limit?: number;
  status?: string;
  collectionId?: string;
  search?: string;
}

export interface StoreCollection {
  id: string;
  title: string;
  description?: string;
  imageId?: string | null;
  image?: string | null;
  products?: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreCollectionsResponse {
  success: boolean;
  data?: {
    collections: StoreCollection[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface PublicCollectionParams {
  page?: number;
  limit?: number;
  search?: string;
}

function getStoreId(): string {
  const storeData = getStoreData();
  const storeId = storeData?.storeId || storeData?.store?.id;
  if (!storeId) {
    throw new Error("Store ID not found.");
  }
  return storeId;
}

export const storeAPI = {
  // Get store details
  async getStore(storeId?: string): Promise<StoreInfoResponse> {
    try {
      const id = storeId || getStoreId();
      const response = await fetch(`${BASE_URL}/store/${id}/public/store`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return response.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Network error" };
    }
  },

  // Get all public collections for a store
  async getPublicCollections(params?: PublicCollectionParams, storeId?: string): Promise<StoreCollectionsResponse> {
    try {
      const id = storeId || getStoreId();
      const query = new URLSearchParams();
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.search !== undefined) query.append("search", params.search);
      const queryStr = query.toString();

      const response = await fetch(
        `${BASE_URL}/store/${id}/public/collections${queryStr ? `?${queryStr}` : ""}`,
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

  // Get all public products for a store
  async getPublicProducts(params?: PublicProductParams, storeId?: string): Promise<StoreProductsResponse> {
    try {
      const id = storeId || getStoreId();
      const query = new URLSearchParams();
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.status) query.append("status", params.status);
      if (params?.collectionId) query.append("collectionId", params.collectionId);
      if (params?.search) query.append("search", params.search);
      const queryStr = query.toString();

      const response = await fetch(
        `${BASE_URL}/store/${id}/public/products${queryStr ? `?${queryStr}` : ""}`,
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

  // Get single public product by ID
  async getPublicProductById(productId: string, storeId?: string): Promise<StoreProductResponse> {
    try {
      const id = storeId || getStoreId();
      const response = await fetch(
        `${BASE_URL}/store/${id}/public/products/${productId}`,
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

  // Get trending products
  async getTrendingProducts(limit: number = 20, storeId?: string): Promise<StoreProductsResponse> {
    try {
      const id = storeId || getStoreId();
      const response = await fetch(
        `${BASE_URL}/store/${id}/public/products/trending?limit=${limit}`,
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

  // Get recommended products
  async getRecommendedProducts(limit: number = 20, storeId?: string): Promise<StoreProductsResponse> {
    try {
      const id = storeId || getStoreId();
      const response = await fetch(
        `${BASE_URL}/store/${id}/public/products/recommended?limit=${limit}`,
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
};
