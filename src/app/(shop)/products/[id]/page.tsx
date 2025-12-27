"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, Loader2, ArrowLeft, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storeAPI, addToCart as addToCartAPI, addToWishlist, getWishlist, removeFromWishlist, type StoreProduct } from "@/lib/apiClients";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  // Use the cart hook for guest cart functionality
  const { addToCart, getItemQuantity, updateItemQuantity, isInCart, isAuth } = useCart();

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const cartQuantity = getItemQuantity(productId);
  const productInCart = isInCart(productId);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await storeAPI.getPublicProductById(productId);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError(response.message || "Product not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    const checkWishlist = async () => {
      if (!isAuthenticated()) return;
      try {
        const result = await getWishlist();
        if (result.success && result.data?.wishlistItems) {
          const item = result.data.wishlistItems.find(i => i.productId === productId);
          if (item) {
            setInWishlist(true);
            setWishlistItemId(item.id);
          }
        }
      } catch (err) {
        console.error('Failed to check wishlist:', err);
      }
    };

    if (productId) {
      fetchProduct();
      checkWishlist();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-red-500 mb-4">{error || "Product not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImage]?.url || "/placeholder.svg";

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    setError(null);
    
    try {
      if (isAuth) {
        // Use API for authenticated users
        const result = await addToCartAPI({ productId: product.id, quantity });
        if (result.success) {
          window.dispatchEvent(new Event('cart-update'));
        } else {
          setError(result.error || 'Failed to add to cart');
        }
      } else {
        // Use local cart for guest users
        addToCart(product, quantity);
      }
    } catch (err) {
      setError('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleUpdateCartQuantity = (newQuantity: number) => {
    updateItemQuantity(productId, newQuantity);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!product?.id) return;

    setTogglingWishlist(true);
    try {
      if (inWishlist && wishlistItemId) {
        const result = await removeFromWishlist(wishlistItemId);
        if (result.success) {
          setInWishlist(false);
          setWishlistItemId(null);
          window.dispatchEvent(new Event('wishlist-update'));
        }
      } else {
        const result = await addToWishlist(product.id);
        if (result.success && result.data?.wishlistItems) {
          const item = result.data.wishlistItems.find(i => i.productId === product.id);
          if (item) {
            setInWishlist(true);
            setWishlistItemId(item.id);
          }
          window.dispatchEvent(new Event('wishlist-update'));
        }
      }
    } catch (err) {
      setError('Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            {product.status === "ACTIVE" && (
              <Badge className="absolute left-4 top-4 text-base px-3 py-1">
                Available
              </Badge>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(0 reviews)</span>
            </div>
          </div>

          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {productInCart ? (
              <div className="flex-1 flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" /> In Cart
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                    disabled={isAuth}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center font-medium">{cartQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}
                    disabled={isAuth}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={addingToCart || product.status !== "ACTIVE"}
              >
                {addingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                Add to Cart
              </Button>
            )}
            <Button
              size="lg"
              variant={inWishlist ? "default" : "outline"}
              className="gap-2"
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
            >
              {togglingWishlist ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
              )}
              {inWishlist ? "In Wishlist" : "Wishlist"}
            </Button>
          </div>

          <div className="pt-6 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                {product.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product ID:</span>
              <span className="font-mono text-xs">{product.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Added:</span>
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
