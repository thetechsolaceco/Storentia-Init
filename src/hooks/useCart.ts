"use client";

import { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  initializeCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  selectIsLoading,
  selectCartInitialized,
  type CartItem,
} from "@/lib/store/cartSlice";
import { StoreProduct } from "@/lib/apiClients/store";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";
import { 
  getCart, 
  type CartItem as APICartItem 
} from "@/lib/apiClients/store/cart";

interface APICartState {
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
  }>;
  count: number;
  loading: boolean;
}

export function useCart() {
  const dispatch = useAppDispatch();
  const localItems = useAppSelector(selectCartItems);
  const localTotal = useAppSelector(selectCartTotal);
  const localCount = useAppSelector(selectCartCount);
  const localIsLoading = useAppSelector(selectIsLoading);
  const localInitialized = useAppSelector(selectCartInitialized);

  // Auth-aware state
  const [isAuth, setIsAuth] = useState(false);
  const [apiCart, setApiCart] = useState<APICartState>({
    items: [],
    count: 0,
    loading: false,
  });

  // Check auth status and fetch API cart if authenticated
  useEffect(() => {
    const checkAuthAndFetchCart = async () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);

      if (authenticated) {
        setApiCart(prev => ({ ...prev, loading: true }));
        try {
          const result = await getCart();
          if (result.success && result.data?.cartItems) {
            const items = result.data.cartItems.map((item: APICartItem) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
            }));
            const count = items.reduce((sum, item) => sum + item.quantity, 0);
            setApiCart({ items, count, loading: false });
          } else {
            setApiCart({ items: [], count: 0, loading: false });
          }
        } catch (error) {
          console.error("Failed to fetch API cart:", error);
          setApiCart({ items: [], count: 0, loading: false });
        }
      }
    };

    checkAuthAndFetchCart();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthAndFetchCart();
    };

    // Listen for cart updates (when items are added via API)
    const handleCartUpdate = () => {
      if (isAuthenticated()) {
        checkAuthAndFetchCart();
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("cart-update", handleCartUpdate);
    
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("cart-update", handleCartUpdate);
    };
  }, []);

  // Initialize local cart from localStorage on mount (for guests)
  useEffect(() => {
    if (!localInitialized && !isAuth) {
      dispatch(initializeCart());
    }
  }, [dispatch, localInitialized, isAuth]);

  // Refresh API cart - can be called after adding items
  const refreshApiCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setApiCart(prev => ({ ...prev, loading: true }));
    try {
      const result = await getCart();
      if (result.success && result.data?.cartItems) {
        const items = result.data.cartItems.map((item: APICartItem) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        }));
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        setApiCart({ items, count, loading: false });
      }
    } catch (error) {
      console.error("Failed to refresh API cart:", error);
      setApiCart(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const addToCart = useCallback(
    (product: StoreProduct, quantity: number = 1) => {
      // This is only for guest users - local cart
      const cartItem: CartItem = {
        id: `local_${product.id}_${Date.now()}`,
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.images?.[0]?.url,
      };
      dispatch(addItem(cartItem));
    },
    [dispatch]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      dispatch(removeItem(productId));
    },
    [dispatch]
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        dispatch(removeItem(productId));
      } else {
        dispatch(updateQuantity({ productId, quantity }));
      }
    },
    [dispatch]
  );

  const clearAllItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  // Auth-aware: check API cart when authenticated, local cart when guest
  const getItemQuantity = useCallback(
    (productId: string): number => {
      if (isAuth) {
        const item = apiCart.items.find((i) => i.productId === productId);
        return item?.quantity || 0;
      }
      const item = localItems.find((i) => i.productId === productId);
      return item?.quantity || 0;
    },
    [isAuth, apiCart.items, localItems]
  );

  // Auth-aware: check API cart when authenticated, local cart when guest
  const isInCart = useCallback(
    (productId: string): boolean => {
      if (isAuth) {
        return apiCart.items.some((i) => i.productId === productId);
      }
      return localItems.some((i) => i.productId === productId);
    },
    [isAuth, apiCart.items, localItems]
  );

  // Return appropriate values based on auth state
  const items = isAuth ? [] : localItems; // API cart items are fetched separately in cart page
  const total = isAuth ? 0 : localTotal;
  const count = isAuth ? apiCart.count : localCount;
  const isLoading = isAuth ? apiCart.loading : localIsLoading;
  const initialized = isAuth ? !apiCart.loading : localInitialized;

  return {
    items,
    total,
    count,
    isLoading,
    initialized,
    isAuth,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearAllItems,
    getItemQuantity,
    isInCart,
    refreshApiCart,
  };
}
