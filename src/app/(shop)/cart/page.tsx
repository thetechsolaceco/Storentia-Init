"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ArrowRight, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";
import {
  getCart,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
  updateCartItemQuantity as updateCartItemQuantityAPI,
  type CartItem as APICartItem,
} from "@/lib/apiClients";

interface DisplayCartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [apiCartItems, setApiCartItems] = useState<DisplayCartItem[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Local cart hook for guest users
  const {
    items: localCartItems,
    initialized: localInitialized,
    removeFromCart: removeFromLocalCart,
    updateItemQuantity: updateLocalItemQuantity,
    clearAllItems: clearLocalCart,
  } = useCart();

  // Check auth status and fetch API cart if authenticated
  useEffect(() => {
    const checkAuthAndFetchCart = async () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        setApiLoading(true);
        try {
          const result = await getCart();
          if (result.success && result.data?.cartItems) {
            const items: DisplayCartItem[] = result.data.cartItems.map((item: APICartItem) => ({
              id: item.id,
              productId: item.productId,
              title: item.product?.title || "Product",
              price: item.product?.price || 0,
              quantity: item.quantity,
              image: item.product?.images?.[0]?.url,
            }));
            setApiCartItems(items);
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        } finally {
          setApiLoading(false);
        }
      } else {
        setApiLoading(false);
      }
    };
    
    checkAuthAndFetchCart();
  }, []);

  // Use API cart if authenticated, otherwise use local cart
  const cartItems = isAuth ? apiCartItems : localCartItems;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 0 ? 10.0 : 0;
  const total = subtotal + shipping;
  const loading = isAuth ? apiLoading : !localInitialized;

  const handleUpdateQuantity = async (item: DisplayCartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }
    
    setUpdating(item.id);
    
    if (isAuth) {
      try {
        const result = await updateCartItemQuantityAPI(item.id, newQuantity);
        if (result.success) {
          setApiCartItems(items => 
            items.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i)
          );
          window.dispatchEvent(new Event('cart-update'));
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    } else {
      updateLocalItemQuantity(item.productId, newQuantity);
    }
    
    setUpdating(null);
  };

  const handleRemoveItem = async (item: DisplayCartItem) => {
    setUpdating(item.id);
    
    if (isAuth) {
      try {
        const result = await removeFromCartAPI(item.id);
        if (result.success) {
          setApiCartItems(items => items.filter(i => i.id !== item.id));
          window.dispatchEvent(new Event('cart-update'));
        }
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    } else {
      removeFromLocalCart(item.productId);
    }
    
    setUpdating(null);
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    if (isAuth) {
      try {
        const result = await clearCartAPI();
        if (result.success) {
          setApiCartItems([]);
          window.dispatchEvent(new Event('cart-update'));
        }
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    } else {
      clearLocalCart();
    }
  };

  const handleCheckout = () => {
    if (!isAuth) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative h-24 w-24 bg-muted rounded overflow-hidden shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold hover:underline">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {updating === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        disabled={updating === item.id}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleRemoveItem(item)}
                      disabled={updating === item.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 space-y-4 sticky top-24">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({count} items)
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleCheckout}>
                {isAuth ? 'Proceed to Checkout' : 'Login to Checkout'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
