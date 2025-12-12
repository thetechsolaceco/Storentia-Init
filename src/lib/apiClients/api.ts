export const API_ENDPOINTS = {
  AUTH_VALIDATE_KEY: "/auth/key/validate",
  AUTH_GOOGLE: "/auth/google",
  AUTH_GOOGLE_CALLBACK: "/auth/google/callback",
  AUTH_LOGOUT: "/auth/logout",

  USER_ME: "/user/@me",
  USER_STORE_COLLECTIONS: "/user/store", // + /:storeId/collections

  STORE_GET: "/store",
  STORE_UPDATE: "/store",

  COLLECTIONS_GET_ALL: "/collections",
  COLLECTIONS_GET_BY_ID: "/collections",
  COLLECTIONS_CREATE: "/collections",
  COLLECTIONS_UPDATE: "/collections",
  COLLECTIONS_DELETE: "/collections",

  PRODUCTS_GET_ALL: "/products",
  PRODUCTS_GET_BY_ID: "/products",
  PRODUCTS_CREATE: "/products",
  PRODUCTS_UPDATE: "/products",
  PRODUCTS_DELETE: "/products",

  BILLINGS_GET_ALL: "/billings",
  BILLINGS_GET_BY_ID: "/billings",
  BILLINGS_CREATE: "/billings",
  BILLINGS_UPDATE: "/billings",

  DISCOUNTS_GET_ALL: "/discounts",
  DISCOUNTS_GET_BY_ID: "/discounts",
  DISCOUNTS_CREATE: "/discounts",
  DISCOUNTS_UPDATE: "/discounts",
  DISCOUNTS_DELETE: "/discounts",

  USERS_GET_ALL: "/users",
  USERS_GET_BY_ID: "/users",
  USERS_CREATE: "/users",
  USERS_UPDATE: "/users",
  USERS_DELETE: "/users",

  ORDERS_GET_ALL: "/orders",
  ORDERS_GET_BY_ID: "/orders",
  ORDERS_UPDATE_STATUS: "/orders/status",

  CUSTOMERS_GET_ALL: "/customers",
  CUSTOMERS_GET_BY_ID: "/customers",

  CATEGORIES_GET_ALL: "/categories",
  CATEGORIES_CREATE: "/categories",
  CATEGORIES_UPDATE: "/categories",
  CATEGORIES_DELETE: "/categories",
} as const;
