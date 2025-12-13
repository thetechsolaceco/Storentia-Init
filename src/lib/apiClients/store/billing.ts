interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Address {
  id?: string;
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
  createdAt?: string;
}

interface CreateAddressRequest {
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

interface UpdateAddressRequest {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

/**
 * Get store details from localStorage and extract storeId
 */
function getStoreId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // First try to get from the auth session (new format)
    const authStoreData = localStorage.getItem('storentia_store');
    if (authStoreData) {
      const storeData = JSON.parse(authStoreData);
      return storeData.storeId || storeData.store?.id;
    }
    
    // Fallback to old format
    const storeData = localStorage.getItem('store');
    if (storeData) {
      const store = JSON.parse(storeData);
      return store.id || store.storeId;
    }
  } catch (error) {
    console.error('Error parsing store data from localStorage:', error);
  }
  
  return null;
}

/**
 * Get all billing addresses
 */
export async function getAllAddresses(): Promise<ApiResponse<Address[]>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/billing`;
    console.log('Getting addresses from:', url);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();
    console.log('Get addresses response:', result);

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to get addresses`,
      };
    }

    // Handle the API response structure: {"success":true,"data":[{id, address, createdAt}]}
    if (result.success && Array.isArray(result.data)) {
      // Transform the nested structure to flat address objects
      const transformedAddresses = result.data.map((item: any) => ({
        id: item.id,
        ...item.address, // Spread the nested address fields
        createdAt: item.createdAt,
      }));
      
      return {
        success: true,
        data: transformedAddresses,
      };
    }

    // Fallback for other response structures
    return {
      success: true,
      data: result.addresses || result.data || result || [],
    };
  } catch (error) {
    console.error('Get addresses error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while getting addresses',
    };
  }
}

/**
 * Create a new billing address
 */
export async function createAddress(data: CreateAddressRequest): Promise<ApiResponse<Address>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/billing`;
    console.log('Creating address at:', url);
    console.log('Request data:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result = await response.json();
    console.log('Create address response:', result);

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to create address`,
      };
    }

    // Handle the API response structure: {"success": true, "data": {"id": "...", "address": {...}, "createdAt": "..."}}
    if (result.success && result.data && result.data.address) {
      const transformedAddress = {
        id: result.data.id,
        ...result.data.address,
        createdAt: result.data.createdAt,
      };
      
      return {
        success: true,
        data: transformedAddress,
      };
    }
    
    // Fallback for other response structures
    return {
      success: true,
      data: result.data?.address || result.address || result.data || result,
    };
  } catch (error) {
    console.error('Create address error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while creating address',
    };
  }
}

/**
 * Update an existing billing address
 */
export async function updateAddress(addressId: string, data: UpdateAddressRequest): Promise<ApiResponse<Address>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/billing/${addressId}`;
    console.log('Updating address at:', url);
    console.log('Request data:', data);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result = await response.json();
    console.log('Update address response:', result);

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to update address`,
      };
    }

    // Handle the API response structure: {"success": true, "data": {"id": "...", "address": {...}, "createdAt": "..."}}
    if (result.success && result.data && result.data.address) {
      const transformedAddress = {
        id: result.data.id,
        ...result.data.address,
        createdAt: result.data.createdAt,
      };
      
      return {
        success: true,
        data: transformedAddress,
      };
    }
    
    // Fallback for other response structures
    return {
      success: true,
      data: result.data?.address || result.address || result.data || result,
    };
  } catch (error) {
    console.error('Update address error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while updating address',
    };
  }
}

/**
 * Delete a billing address
 */
export async function deleteAddress(addressId: string): Promise<ApiResponse<void>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/billing/${addressId}`;
    console.log('Deleting address at:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to delete address`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete address error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while deleting address',
    };
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string): Promise<ApiResponse<void>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/billing/${addressId}/default`;
    console.log('Setting default address at:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to set default address`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Set default address error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while setting default address',
    };
  }
}

export type { Address, CreateAddressRequest, UpdateAddressRequest };