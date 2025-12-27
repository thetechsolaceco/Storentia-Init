"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Plus, Minus, Trash2, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createOrder,
  getAllAddresses,
  createAddress,
  getCart,
  updateCartItemQuantity as updateCartItemQuantityAPI,
  removeFromCart as removeFromCartAPI,
  type Address,
  type CreateAddressRequest,
  type CartItem as APICartItem,
} from "@/lib/apiClients";
import { isAuthenticated } from "@/lib/apiClients/store/authentication";

interface CheckoutCartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    fetchAddresses();
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const result = await getCart();
      if (result.success && result.data?.cartItems) {
        const items: CheckoutCartItem[] = result.data.cartItems.map((item: APICartItem) => ({
          id: item.id,
          productId: item.productId,
          title: item.product?.title || "Product",
          price: item.product?.price || 0,
          quantity: item.quantity,
        }));
        setCartItems(items);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCartTotal(total);
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    const response = await getAllAddresses();
    if (response.success && response.data) {
      setAddresses(response.data);
      const defaultAddr = response.data.find((a) => a.address.isDefault) || response.data[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
      if (response.data.length === 0) setShowAddForm(true);
    }
    setLoading(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    setError(null);
    const response = await createAddress(newAddress);
    if (response.success && response.data) {
      setAddresses((prev) => [...prev, response.data!]);
      setSelectedAddress(response.data);
      setShowAddForm(false);
      setNewAddress({
        firstName: "",
        lastName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
      });
    } else {
      setError(response.error || "Failed to save address");
    }
    setSavingAddress(false);
  };

  const handleUpdateQuantity = async (item: CheckoutCartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item
      try {
        const result = await removeFromCartAPI(item.id);
        if (result.success) {
          setCartItems(items => items.filter(i => i.id !== item.id));
          setCartTotal(prev => prev - item.price * item.quantity);
          window.dispatchEvent(new Event('cart-update'));
        }
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    } else {
      // Update quantity
      try {
        const result = await updateCartItemQuantityAPI(item.id, newQuantity);
        if (result.success) {
          const diff = newQuantity - item.quantity;
          setCartItems(items => 
            items.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i)
          );
          setCartTotal(prev => prev + item.price * diff);
          window.dispatchEvent(new Event('cart-update'));
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || cartItems.length === 0) return;

    setIsPlacingOrder(true);
    setError(null);

    const response = await createOrder({
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        firstName: selectedAddress.address.firstName,
        lastName: selectedAddress.address.lastName,
        address: selectedAddress.address.addressLine1,
        city: selectedAddress.address.city,
        state: selectedAddress.address.state,
        zipCode: selectedAddress.address.postalCode,
      },
      contact: {
        email: "",
        phone: selectedAddress.address.phone,
      },
      payment: { method: "card" },
      total: cartTotal,
    });

    setIsPlacingOrder(false);

    if (response.success) {
      // Clear cart and refresh
      window.dispatchEvent(new Event('cart-update'));
      setCartItems([]);
      setCartTotal(0);
      setShowSuccess(true);
    } else {
      setError(response.message || "Failed to place order");
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Success Popup */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogTitle className="sr-only">Order Placed Successfully</DialogTitle>
          <div className="flex flex-col items-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-[scale-in_0.3s_ease-out]">
              <Check className="h-10 w-10 text-green-600 animate-[check-draw_0.4s_ease-out_0.2s_both]" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been successfully placed. Thank you for shopping with us!
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/profile">View Orders</Link>
              </Button>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Billing Address
              </CardTitle>
              {addresses.length > 0 && !showAddForm && (
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add New
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showAddForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input name="firstName" value={newAddress.firstName} onChange={handleAddressChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input name="lastName" value={newAddress.lastName} onChange={handleAddressChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address</Label>
                    <Input name="addressLine1" value={newAddress.addressLine1} onChange={handleAddressChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input name="city" value={newAddress.city} onChange={handleAddressChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input name="state" value={newAddress.state} onChange={handleAddressChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input name="postalCode" value={newAddress.postalCode} onChange={handleAddressChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input name="country" value={newAddress.country} onChange={handleAddressChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input name="phone" value={newAddress.phone} onChange={handleAddressChange} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveAddress} disabled={savingAddress}>
                      {savingAddress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Address
                    </Button>
                    {addresses.length > 0 && (
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-muted-foreground">No billing address found.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === addr.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
                      <p className="font-medium">
                        {addr.address.firstName} {addr.address.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.address.addressLine1}, {addr.address.city}, {addr.address.state}{" "}
                        {addr.address.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{addr.address.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <Button asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full mt-4"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !selectedAddress || cartItems.length === 0}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes check-draw {
          0% {
            stroke-dashoffset: 50;
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
