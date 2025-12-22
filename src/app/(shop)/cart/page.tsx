"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ArrowRight, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getCart,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/apiClients";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCart();
      if (result.success && result.data) {
        setCartItems(result.data.cartItems || []);
      } else {
        setError(result.error || "Failed to load cart");
      }
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(itemId);
    try {
      const result = await updateCartItemQuantity(itemId, newQuantity);
      if (result.success) {
        setCartItems(items =>
          items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        window.dispatchEvent(new Event('cart-update'));
      } else {
        setError(result.error || "Failed to update quantity");
      }
    } catch (err) {
      setError("Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItem(itemId);
    try {
      const result = await removeFromCart(itemId);
      if (result.success) {
        setCartItems(items => items.filter(item => item.id !== itemId));
        window.dispatchEvent(new Event('cart-update'));
      } else {
        setError(result.error || "Failed to remove item");
      }
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    setLoading(true);
    try {
      const result = await clearCart();
      if (result.success) {
        setCartItems([]);
        window.dispatchEvent(new Event('cart-update'));
      } else {
        setError(result.error || "Failed to clear cart");
      }
    } catch (err) {
      setError("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10.0 : 0;
  const total = subtotal + shipping;

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

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

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
                <div className="relative h-24 w-24 bg-muted rounded overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0]?.url ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.title}
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
                          {item.product?.title || "Product"}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        ${item.product?.price?.toFixed(2) || "0.00"} each
                      </p>
                    </div>
                    <div className="font-bold">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItem === item.id || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {updatingItem === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItem === item.id}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingItem === item.id}
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
                    Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
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
              <Link href="/checkout" className="block">
                <Button className="w-full mt-4" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
