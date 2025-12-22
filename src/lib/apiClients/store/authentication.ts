interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_STORENTIA_API_KEY;

interface SendOtpRequest {
  email: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    storeId: string;
  };
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
 * Send OTP to user email
 */
export async function sendOtp(data: SendOtpRequest): Promise<ApiResponse<any>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/auth/send-otp`;
    console.log('Sending OTP to:', url);
    console.log('Request data:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies for session management
    });

    const result = await response.json();
    console.log('OTP Response:', result);

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to send OTP`,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while sending OTP',
    };
  }
}

/**
 * Verify OTP and authenticate user
 */
export async function verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<AuthResponse>> {
  const storeId = getStoreId();
  
  if (!storeId) {
    return {
      success: false,
      error: 'Store ID not found in localStorage. Please ensure store data is saved.',
    };
  }

  try {
    const url = `${API_BASE_URL}/store/${storeId}/auth/verify-otp`;
    console.log('Verifying OTP at:', url);
    console.log('Request data:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Important: Include cookies for session management
    });

    const result = await response.json();
    console.log('Verify OTP Response:', result);

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}: Failed to verify OTP`,
      };
    }

    // Store user session data if provided
    if (result.user) {
      localStorage.setItem('storeUser', JSON.stringify(result.user));
    }

    // Store any auth token if provided (fallback)
    if (result.token) {
      localStorage.setItem('storeAuthToken', result.token);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while verifying OTP',
    };
  }
}

/**
 * Logout user by clearing stored data and session
 */
export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    // Clear local storage
    localStorage.removeItem('storeUser');
    localStorage.removeItem('storeAuthToken');
    
    // Optional: Call logout endpoint to clear server session
    try {
      const storeId = getStoreId();
      if (storeId) {
        await fetch(`${API_BASE_URL}/store/${storeId}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
}

/**
 * Check if user is authenticated (store customer)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const user = localStorage.getItem('storeUser');
  const token = localStorage.getItem('storeAuthToken');
  return !!(user || token);
}

/**
 * Get stored user data
 */
export function getStoreUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('storeUser');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('storeAuthToken');
}

/**
 * Check authentication status with server (optional)
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const storeId = getStoreId();
    if (!storeId) return false;

    const response = await fetch(`${API_BASE_URL}/store/${storeId}/auth/status`, {
      method: 'GET',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
}