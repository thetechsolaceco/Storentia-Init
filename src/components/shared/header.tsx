'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Menu, LogOut, Home, Package, UserCircle, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { isAuthenticated, getStoreUser, logout } from "@/lib/apiClients/store/authentication";

export function Header() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set hydrated flag first to prevent hydration mismatch
    setIsHydrated(true);
    
    // Check authentication status on component mount
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authenticated = isAuthenticated();
        const userData = getStoreUser();
        setIsUserAuthenticated(authenticated);
        setUser(userData);
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for custom auth-change event (when user logs in on same tab)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserAuthenticated(false);
    setUser(null);
    // Redirect to home page after logout
    window.location.href = '/';
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
                    <span className="text-xl font-bold tracking-tight">StoreKit</span>
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
                          <Link href="/wishlist" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Wishlist</span>
                          </Link>
                        </SheetClose>
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
                        <p className="font-medium truncate">{user?.email || user?.name || 'User'}</p>
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
            <span className="text-xl font-bold tracking-tight">StoreKit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">

            <Link
              href="/products"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Products
            </Link>
            {isHydrated && isUserAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Profile
                </Link>
              </>
            )}
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-full max-w-sm items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-64 pl-8 rounded-full bg-muted"
            />
          </div>
          <ModeToggle />
          {isHydrated && isUserAuthenticated && (
            <>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    3
                  </span>
                  <span className="sr-only">Cart</span>
                </Button>
              </Link>
            </>
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
              {isHydrated && isUserAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    {user?.email || user?.name || 'My Account'}
                  </DropdownMenuLabel>
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
