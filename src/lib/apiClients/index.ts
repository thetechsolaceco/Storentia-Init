export {
  authAPI,
  setUserSession,
  getUserSession,
  clearUserSession,
  isAuthenticated,
  isAuthenticatedLocal,
  setApiKey,
  getApiKey,
  setStoreData,
  getStoreData,
  setAuthSession,
  getAuthSession,
  clearAuthSession,
  type User,
  type StoreData,
  type Store,
  type StoreOwner,
  type ValidationResponse,
  type AuthResponse,
  type UserResponse,
} from "./auth";

export { collectionsAPI, type Collection, type CollectionParams, type CollectionsResponse } from "./collections";
export { productsAPI, type Product, type ProductParams } from "./products";
export { billingsAPI, type Billing, type BillingParams } from "./billings";
export { discountsAPI, type Discount, type DiscountParams } from "./discounts";
export { usersAPI, type UserAccount, type UserParams } from "./users";

export { fetchWithCredentials, fetchWithApiKey, BASE_URL } from "./shared";
export { API_ENDPOINTS } from "./api";
