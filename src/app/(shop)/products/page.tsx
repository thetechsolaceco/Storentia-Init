"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShoppingCart, Heart, Minus, Plus, Check } from "lucide-react";
import {
  storeAPI,
  addToCart as addToCartAPI,
  addToWishlist,
  type StoreProduct,
  type StoreCollection,
} from "@/lib/apiClients";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";
import { useAppDispatch } from "@/lib/store/hooks";
import { addItem, updateQuantity, removeItem } from "@/lib/store/cartSlice";
import { useCart } from "@/hooks/useCart";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isInCart, getItemQuantity, isAuth } = useCart();
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [collections, setCollections] = useState<StoreCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [loadingCart, setLoadingCart] = useState<string | null>(null);
  const [loadingWishlist, setLoadingWishlist] = useState<string | null>(null);

  // Helper to get cart item info - uses auth-aware hook

  const fetchCollections = async () => {
    try {
      const response = await storeAPI.getPublicCollections({ limit: 50 });
      if (response.success && response.data?.collections) {
        setCollections(response.data.collections);
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await storeAPI.getPublicProducts({
        page,
        limit: 50, // Fetch more to allow client-side filtering
        search: searchTerm || undefined,
      });
      if (response.success && response.data) {
        let filteredProducts = response.data || [];
        
        // Client-side collection filtering if API doesn't support it
        if (selectedCollection) {
          filteredProducts = filteredProducts.filter((product) =>
            product.collections?.some((col: any) => 
              col.collectionId === selectedCollection || 
              col.collection?.id === selectedCollection
            )
          );
        }
        
        setProducts(filteredProducts);
        setTotalPages(Math.ceil(filteredProducts.length / 12) || 1);
      } else {
        setError(response.message || "Failed to load products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCollection]);

  // Sync state with URL search params
  useEffect(() => {
    const query = searchParams.get("search") || "";
    if (query !== searchTerm) {
      setSearchTerm(query);
      // We need to fetch products when URL changes.
      // Ideally we should depend on searchTerm in fetchProducts or add it to dependency array of the main fetch effect.
      // But fetchProducts reads the *current* state of searchTerm.
      // If we just set state here, it might not be updated in the closure of an immediate fetch call unless we add it to deps.
    }
  }, [searchParams]);

  // Trigger fetch when searchTerm changes (e.g. from URL)
  // We combine this with the existing effect or add a new one.
  // Let's modify the existing main effect to include searchTerm.
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Adding searchTerm to dependency

  const handleSearch = () => {
    setPage(1);
    // Push to URL instead of just fetching
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollection(
      selectedCollection === collectionId ? null : collectionId
    );
    setPage(1);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: StoreProduct) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingCart(product.id);
    try {
      if (isAuth) {
        // Use API for authenticated users
        const result = await addToCartAPI({ productId: product.id, quantity: 1 });
        if (result.success) {
          window.dispatchEvent(new Event('cart-update'));
        } else {
          console.error("Failed to add to cart:", result.error);
        }
      } else {
        // Use local cart for guest users
        dispatch(addItem({
          id: `local_${product.id}_${Date.now()}`,
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          image: product.images?.[0]?.url,
        }));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoadingCart(null);
    }
  };

  const handleUpdateQuantity = async (e: React.MouseEvent, product: StoreProduct, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (newQuantity < 1) {
      dispatch(removeItem(product.id));
      return;
    }
    dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
  };

  const handleAddToWishlist = async (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingWishlist(productId);
    try {
      const result = await addToWishlist(productId);
      if (!result.success) {
        console.error("Failed to add to wishlist:", result.error);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setLoadingWishlist(null);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <Label>Search</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button variant="outline" size="sm" onClick={handleSearch}>
                    Go
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-3 block">Categories</Label>
                <div className="space-y-2">
                  {collections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No categories
                    </p>
                  ) : (
                    collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={collection.id}
                          checked={selectedCollection === collection.id}
                          onCheckedChange={() =>
                            handleCollectionChange(collection.id)
                          }
                        />
                        <label
                          htmlFor={collection.id}
                          className="text-sm cursor-pointer"
                        >
                          {collection.title}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {selectedCollection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => setSelectedCollection(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
              <Separator />
              <div>
                <Label>Price Range</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input type="number" placeholder="Min" className="w-20" />
                  <span>-</span>
                  <Input type="number" placeholder="Max" className="w-20" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedCollection
                  ? collections.find((c) => c.id === selectedCollection)
                      ?.title || "Products"
                  : "All Products"}
              </h1>
              {selectedCollection && (
                <p className="text-sm text-muted-foreground mt-1">
                  Filtered by category
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchProducts}>
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found</p>
              {selectedCollection && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedCollection(null)}
                >
                  View all products
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square bg-muted">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        {product.status === "ACTIVE" && (
                          <Badge className="absolute top-2 left-2">
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {product.description}
                          </p>
                        )}
                        <p className="text-lg font-bold mt-2">
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="flex gap-2 mt-3">
                          {(() => {
                            const inCart = isInCart(product.id);
                            const quantity = getItemQuantity(product.id);
                            if (inCart) {
                              return (
                                <div className="flex items-center gap-2 flex-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => handleUpdateQuantity(e, product, quantity - 1)}
                                    disabled={isAuth}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => handleUpdateQuantity(e, product, quantity + 1)}
                                    disabled={isAuth}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <span className="flex items-center text-xs text-green-600 ml-1">
                                    <Check className="h-3 w-3 mr-1" /> In Cart
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={loadingCart === product.id}
                              >
                                {loadingCart === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
                            );
                          })()}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleAddToWishlist(e, product.id)}
                            disabled={loadingWishlist === product.id}
                          >
                            {loadingWishlist === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
