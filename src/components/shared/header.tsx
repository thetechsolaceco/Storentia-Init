"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Package,
  UserCircle,
  Info,
  Mail,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModeToggle } from "@/components/mode-toggle";
import {
  isAuthenticated,
  getStoreUser,
  logout,
} from "@/lib/apiClients/store/authentication";
import { getOrders, storeAPI, type Order, type StoreProduct } from "@/lib/apiClients";
import { useAppSelector } from "@/lib/store/hooks";
import { selectStoreInfo } from "@/lib/store/storeSlice";
import { useCart } from "@/hooks/useCart";

const ORDER_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

function OrderProgress({ status }: { status: string }) {
  const currentStep = ORDER_STEPS.indexOf(status);
  const progress = status === "CANCELLED" ? 0 : ((currentStep + 1) / ORDER_STEPS.length) * 100;

  return (
    <div className="w-full">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${status === "CANCELLED" ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{status}</p>
    </div>
  );
}

export function Header() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StoreProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const storeInfo = useAppSelector(selectStoreInfo);
  const storeName = storeInfo?.name || "StoreKit";
  
  // Cart hook for count badge
  const { count: cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSearchResults(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearchLoading(true);
    setShowSearchResults(true);
    const result = await storeAPI.getPublicProducts({ search: searchQuery, limit: 6 });
    if (result.success && result.data) {
      setSearchResults(result.data);
    } else {
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const result = await getOrders();
    if (result.success && result.data) {
      setOrders(result.data.slice(0, 5));
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    setIsHydrated(true);
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const authenticated = isAuthenticated();
        const userData = getStoreUser();
        setIsUserAuthenticated(authenticated);
        setUser(userData);
      }
    };
    checkAuth();

    const handleStorageChange = () => checkAuth();
    const handleAuthChange = () => checkAuth();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (ordersOpen && isUserAuthenticated) {
      fetchOrders();
    }
  }, [ordersOpen, isUserAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setIsUserAuthenticated(false);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {isHydrated ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links</SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <Link href="/" className="flex items-center gap-2">
                      <span className="text-xl font-bold tracking-tight">{storeName}</span>
                    </Link>
                  </div>
                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link href="/products" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Products</span>
                        </Link>
                      </SheetClose>
                      {isUserAuthenticated && (
                        <SheetClose asChild>
                          <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors">
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Profile</span>
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Link href="/about" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors">
                          <Info className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">About</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/contact" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Contact</span>
                        </Link>
                      </SheetClose>
                    </div>
                    {isUserAuthenticated && (
                      <>
                        <div className="my-4 border-t" />
                        <div className="space-y-1">
                          <SheetClose asChild>
                            <Link href="/cart" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors">
                              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">Cart</span>
                            </Link>
                          </SheetClose>
                        </div>
                      </>
                    )}
                  </nav>
                  <div className="p-4 border-t">
                    {isUserAuthenticated ? (
                      <div className="space-y-3">
                        <div className="px-3 py-2">
                          <p className="text-sm text-muted-foreground">Signed in as</p>
                          <p className="font-medium truncate">{user?.email || user?.name || "User"}</p>
                        </div>
                        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <Link href="/login">
                            <Button className="w-full">Login</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/signup">
                            <Button variant="outline" className="w-full">Sign up</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="md:hidden w-10 h-10"></div>
          )}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">{storeName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Products
            </Link>
            {isHydrated && isUserAuthenticated && (
              <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Profile
              </Link>
            )}
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              About
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-full max-w-sm items-center" ref={searchRef}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
            <form onSubmit={handleSearch} className="w-full">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-8 pr-8 rounded-full bg-muted"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSearchResults(true)}
              />
            </form>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No products found
                  </div>
                ) : (
                  <div className="divide-y max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => {
                          setShowSearchResults(false);
                          setQuery("");
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      onClick={() => {
                        setShowSearchResults(false);
                        setQuery("");
                      }}
                      className="block p-3 text-center text-sm text-primary hover:bg-muted transition-colors"
                    >
                      View all results for &quot;{query}&quot;
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          <ModeToggle />
          {isHydrated && isUserAuthenticated && (
            <>
              <Popover open={ordersOpen} onOpenChange={setOrdersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Package className="h-5 w-5" />
                    <span className="sr-only">Orders</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Recent Orders</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No orders yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {orders.map((order) => (
                          <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            onClick={() => setOrdersOpen(false)}
                            className="block p-4 hover:bg-muted transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">#{order.orderNumber?.slice(-8) || order.id.slice(-8)}</span>
                              <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {order.items.length} item{order.items.length > 1 ? "s" : ""} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <OrderProgress status={order.status} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t">
                    <Link href="/profile" onClick={() => setOrdersOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
          
          {/* Cart Icon - Always visible */}
          {isHydrated && (
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
              </Link>
          )}
          {isHydrated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isUserAuthenticated ? (
                  <>
                    <DropdownMenuLabel>{user?.email || user?.name || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">Sign up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-10 h-10"></div>
          )}
        </div>
      </div>
    </header>
  );
}
