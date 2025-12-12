import { BASE_URL } from "../shared";
import { getStoreData } from "../auth";
import { API_ENDPOINTS } from "../api";

export interface Collection {
  id: string;
  title: string;
  description?: string;
  imageId?: string | null;
  image?: string | null;
  products?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CollectionsResponse {
  success: boolean;
  data?: Collection[];
  pagination?: Pagination;
  message?: string;
}

export interface CollectionResponse {
  success: boolean;
  data?: Collection;
  message?: string;
}

function getStoreId(): string {
  const storeData = getStoreData();
  const storeId = storeData?.storeId || storeData?.store?.id;
  if (!storeId) {
    throw new Error("Store ID not found. Please validate your API key first.");
  }
  return storeId;
}

function getCollectionsEndpoint(storeId: string): string {
  return `${API_ENDPOINTS.USER_STORE}/${storeId}/collections`;
}

export const collectionsAPI = {
  async getAll(params?: CollectionParams): Promise<CollectionsResponse> {
    try {
      const storeId = getStoreId();
      const query = new URLSearchParams();
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.search) query.append("search", params.search);
      const queryStr = query.toString();

      const url = `${BASE_URL}${getCollectionsEndpoint(storeId)}${queryStr ? `?${queryStr}` : ""}`;

      const response = await fetch(url, {
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
  },

  async getById(id: string): Promise<CollectionResponse> {
    try {
      const storeId = getStoreId();
      const response = await fetch(
        `${BASE_URL}${getCollectionsEndpoint(storeId)}/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

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
  },

  async create(data: {
    title: string;
    description?: string;
  }): Promise<CollectionResponse> {
    try {
      const storeId = getStoreId();
      const response = await fetch(
        `${BASE_URL}${getCollectionsEndpoint(storeId)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

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
  },

  async update(
    id: string,
    data: { title?: string; description?: string }
  ): Promise<CollectionResponse> {
    try {
      const storeId = getStoreId();
      const response = await fetch(
        `${BASE_URL}${getCollectionsEndpoint(storeId)}/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

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
  },

  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const storeId = getStoreId();
      const response = await fetch(
        `${BASE_URL}${getCollectionsEndpoint(storeId)}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        return { success: false, message: `API Error: ${response.status}` };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error",
      };
    }
  },
};
