'use client';

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type CreateAddressRequest,
} from "@/lib/apiClients";
import { getStoreUser } from "@/lib/apiClients/store/authentication";

export default function ProfilePage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Form state for new/edit address
  const [formData, setFormData] = useState<CreateAddressRequest>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    // Set hydrated flag to prevent hydration mismatch
    setIsHydrated(true);
    loadAddresses();
    loadUser();
  }, []);

  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const userData = getStoreUser();
      setUser(userData);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await getAllAddresses();
      
      if (result.success && result.data) {
        // Ensure data is an array
        const addressData = Array.isArray(result.data) ? result.data : [];
        setAddresses(addressData);
      } else {
        setAddresses([]); // Set empty array on error
        setError(result.error || 'Failed to load addresses');
      }
    } catch (error) {
      setAddresses([]); // Set empty array on exception
      setError('An error occurred while loading addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async () => {
    try {
      const result = await createAddress(formData);
      
      if (result.success) {
        setIsAddDialogOpen(false);
        resetForm();
        setError(''); // Clear any previous errors
        loadAddresses();
      } else {
        setError(result.error || 'Failed to create address');
      }
    } catch (error) {
      setError('An error occurred while creating address');
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress?.id) return;
    
    try {
      const result = await updateAddress(editingAddress.id, formData);
      
      if (result.success) {
        setEditingAddress(null);
        resetForm();
        setError(''); // Clear any previous errors
        loadAddresses();
      } else {
        setError(result.error || 'Failed to update address');
      }
    } catch (error) {
      setError('An error occurred while updating address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const result = await deleteAddress(addressId);
      
      if (result.success) {
        loadAddresses();
      } else {
        setError(result.error || 'Failed to delete address');
      }
    } catch (error) {
      setError('An error occurred while deleting address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await setDefaultAddress(addressId);
      
      if (result.success) {
        loadAddresses();
      } else {
        setError(result.error || 'Failed to set default address');
      }
    } catch (error) {
      setError('An error occurred while setting default address');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: '',
      isDefault: false,
    });
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault || false,
    });
  };
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">User Details</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHydrated ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={user?.firstName || user?.name?.split(' ')[0] || ''} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        defaultValue={user?.lastName || user?.name?.split(' ')[1] || ''} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((order) => (
                  <div key={order} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        Order #SK-{1000 + order}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Placed on Dec {order}, 2023
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Status:{" "}
                        <span className="text-green-600 font-medium">
                          Delivered
                        </span>
                      </span>
                      <span className="font-bold">$120.00</span>
                    </div>
                    <Separator className="my-2" />
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your shipping addresses.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(addresses) ? addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4 relative">
                      {address.isDefault && (
                        <div className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Default
                        </div>
                      )}
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <h3 className="font-semibold">
                          {address.firstName} {address.lastName}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {address.addressLine1}
                        {address.addressLine2 && (
                          <>
                            <br />
                            {address.addressLine2}
                          </>
                        )}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                        <br />
                        {address.country}
                        <br />
                        {address.phone}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(address)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(address.id!)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteAddress(address.id!)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No addresses found. Add your first address below.
                    </div>
                  )}
                  
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <div className="border border-dashed rounded-lg p-4 flex items-center justify-center min-h-[150px] cursor-pointer hover:bg-muted/50">
                        <Button variant="ghost">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                        <DialogDescription>
                          Add a new shipping address to your account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            value={formData.addressLine1}
                            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                          <Input
                            id="addressLine2"
                            value={formData.addressLine2}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              value={formData.postalCode}
                              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={formData.country}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAddress}>
                          Add Address
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Address Dialog */}
      <Dialog open={!!editingAddress} onOpenChange={() => setEditingAddress(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your shipping address details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddressLine1">Address Line 1</Label>
              <Input
                id="editAddressLine1"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="editAddressLine2"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCity">City</Label>
                <Input
                  id="editCity"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editState">State</Label>
                <Input
                  id="editState"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPostalCode">Postal Code</Label>
                <Input
                  id="editPostalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCountry">Country</Label>
                <Input
                  id="editCountry"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAddress(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAddress}>
              Update Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
