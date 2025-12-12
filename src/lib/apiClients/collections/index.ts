import { fetchWithCredentials, BASE_URL } from "../shared";
import { getStoreData } from "../auth";
import { API_ENDPOINTS } from "../api";

export interface Collection {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CollectionsResponse {
  success: boolean;
  data?: {
    collections: Collection[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

function getStoreId(): string {
  const storeData = getStoreData();
  if (!storeData?.storeId) {
    throw new Error("Store ID not found. Please validate your API key first.");
  }
  return storeData.storeId;
}

export const collectionsAPI = {
  async getAll(params?: CollectionParams): Promise<CollectionsResponse> {
    const storeId = getStoreId();
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search !== undefined) query.append("search", params.search);
    const queryStr = query.toString();
    
    const response = await fetch(
      `${BASE_URL}${API_ENDPOINTS.USER_STORE_COLLECTIONS}/${storeId}/collections${queryStr ? `?${queryStr}` : ""}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    
    return response.json();
  },

  async getById(id: string): Promise<Collection> {
    const storeId = getStoreId();
    return fetchWithCredentials(`${API_ENDPOINTS.USER_STORE_COLLECTIONS}/${storeId}/collections/${id}`);
  },

  async create(data: Partial<Collection>): Promise<Collection> {
    const storeId = getStoreId();
    return fetchWithCredentials(`${API_ENDPOINTS.USER_STORE_COLLECTIONS}/${storeId}/collections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Collection>): Promise<Collection> {
    const storeId = getStoreId();
    return fetchWithCredentials(`${API_ENDPOINTS.USER_STORE_COLLECTIONS}/${storeId}/collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    const storeId = getStoreId();
    return fetchWithCredentials(`${API_ENDPOINTS.USER_STORE_COLLECTIONS}/${storeId}/collections/${id}`, {
      method: "DELETE",
    });
  },
};
