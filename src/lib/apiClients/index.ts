export {
  authAPI,
  setUserSession,
  getUserSession,
  clearUserSession,
  isAuthenticated,
  isAuthenticatedLocal,
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

export { usersAPI, type UserAccount, type UserParams } from "./users";

export { fetchWithCredentials, fetchWithApiKey, BASE_URL } from "./shared";
export { API_ENDPOINTS } from "./api";

// Store Public APIs
export {
  storeAPI,
  type StoreInfo,
  type StoreInfoResponse,
  type StoreProduct,
  type StoreProductImage,
  type StoreProductsResponse,
  type StoreProductResponse,
  type PublicProductParams,
  type StoreCollection,
  type StoreCollectionsResponse,
  type PublicCollectionParams,
} from "./store";

// Address/Billing APIs
export {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type AddressData,
  type CreateAddressRequest,
  type AddressResponse,
  type SingleAddressResponse,
} from "./store/address";

// Profile APIs
export {
  getUserProfile,
  updateUserProfile,
  type UserProfile,
  type UpdateProfileRequest,
  type ProfileResponse,
  type UpdateProfileResponse,
} from "./store/profile";

// Cart APIs
export {
  getCart,
  getCartSummary,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
  type Cart,
  type CartItem,
  type CartResponse,
  type CartSummary,
  type CartSummaryResponse,
  type AddToCartRequest,
} from "./store/cart";

// Wishlist APIs
export {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  type Wishlist,
  type WishlistItem,
  type WishlistProduct,
  type WishlistResponse,
  type WishlistCountResponse,
} from "./store/wishlist";

// Order APIs
export {
  createOrder,
  getOrders,
  getOrderById,
  type OrderItem,
  type ShippingAddress,
  type ContactInfo,
  type PaymentInfo,
  type CreateOrderRequest,
  type Order,
  type OrdersResponse,
  type CreateOrderResponse,
} from "./store/order";

// Contact Form API
export {
  submitContactForm,
  type ContactFormRequest,
  type ContactFormResponse,
} from "./store/contact";
