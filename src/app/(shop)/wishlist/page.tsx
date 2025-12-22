"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  addToCart,
  type WishlistItem,
} from "@/lib/apiClients";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [router]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWishlist();
      if (result.success && result.data) {
        setWishlistItems(result.data.wishlistItems || []);
      } else {
        setError(result.error || "Failed to load wishlist");
      }
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    try {
      const result = await removeFromWishlist(itemId);
      if (result.success) {
        setWishlistItems(items => items.filter(item => item.id !== itemId));
        window.dispatchEvent(new Event('wishlist-update'));
      } else {
        setError(result.error || "Failed to remove item");
      }
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm("Are you sure you want to clear your wishlist?")) return;
    
    setLoading(true);
    try {
      const result = await clearWishlist();
      if (result.success) {
        setWishlistItems([]);
        window.dispatchEvent(new Event('wishlist-update'));
      } else {
        setError(result.error || "Failed to clear wishlist");
      }
    } catch (err) {
      setError("Failed to clear wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const result = await addToCart({ productId, quantity: 1 });
      if (result.success) {
        window.dispatchEvent(new Event('cart-update'));
      } else {
        setError(result.error || "Failed to add to cart");
      }
    } catch (err) {
      setError("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
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
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearWishlist}>
            Clear Wishlist
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md">
          {error}
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Save items you love to your wishlist.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden flex flex-col"
            >
              <Link href={`/products/${item.productId}`}>
                <div className="relative aspect-square bg-muted">
                  {item.product.images?.[0]?.url ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-semibold hover:underline">{item.product.title}</h3>
                  </Link>
                  {item.product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.product.description}
                    </p>
                  )}
                </div>
                <div className="font-bold mb-4">
                  ${item.product.price.toFixed(2)}
                </div>
                <div className="mt-auto flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleAddToCart(item.productId)}
                    disabled={addingToCart === item.productId || item.product.status !== "ACTIVE"}
                  >
                    {addingToCart === item.productId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingItem === item.id}
                  >
                    {removingItem === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
