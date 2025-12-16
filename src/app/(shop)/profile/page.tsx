'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { Plus, Edit, Trash2, MapPin, User, Loader2 } from "lucide-react";
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserProfile,
  updateUserProfile,
  type Address,
  type CreateAddressRequest,
  type UserProfile,
} from "@/lib/apiClients";

export default function ProfilePage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', avatar: '' });
  const [addressSaving, setAddressSaving] = useState(false);

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
    loadUser();
    loadAddresses();
  }, []);

  const loadUser = async () => {
    setUserLoading(true);
    try {
      const result = await getUserProfile();
      if (result.success && result.data) {
        // Handle both { user: ... } and direct user object response formats
        const userData = 'user' in result.data ? result.data.user : result.data;
        setUser(userData as UserProfile);
        setProfileForm({
          name: userData.name || '',
          avatar: userData.avatar || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileSaving(true);
    try {
      const result = await updateUserProfile({
        name: profileForm.name,
        avatar: profileForm.avatar || undefined,
      });
      
      if (result.success) {
        // Reload user data
        await loadUser();
        setIsEditProfileOpen(false);
        setError('');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await getAllAddresses();
      
      if (result.success && result.data) {
        const addressData = Array.isArray(result.data) ? result.data : [];
        setAddresses(addressData);
      } else {
        setAddresses([]);
        setError(result.error || 'Failed to load addresses');
      }
    } catch (error) {
      setAddresses([]);
      setError('An error occurred while loading addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async () => {
    setAddressSaving(true);
    try {
      const result = await createAddress(formData);
      
      if (result.success) {
        setIsAddDialogOpen(false);
        resetForm();
        setError('');
        loadAddresses();
      } else {
        setError(result.error || 'Failed to create address');
      }
    } catch (error) {
      setError('An error occurred while creating address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress?.id) return;
    
    try {
      const result = await updateAddress(editingAddress.id, formData);
      
      if (result.success) {
        setEditingAddress(null);
        resetForm();
        setError('');
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
      firstName: address.address.firstName,
      lastName: address.address.lastName,
      addressLine1: address.address.addressLine1,
      addressLine2: address.address.addressLine2 || '',
      city: address.address.city,
      state: address.address.state,
      postalCode: address.address.postalCode,
      country: address.address.country,
      phone: address.address.phone,
      isDefault: address.address.isDefault || false,
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
                Your personal details and account information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : user ? (
                <div className="space-y-6">
                  {/* Show prompt to set name if null */}
                  {!user.name && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                        Welcome! Please set your name to complete your profile.
                      </p>
                      <Button size="sm" onClick={() => setIsEditProfileOpen(true)}>
                        Set Your Name
                      </Button>
                    </div>
                  )}

                  <div className="flex items-start gap-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || 'User'}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-xl font-semibold">
                        {user.name || <span className="text-muted-foreground italic">Name not set</span>}
                      </h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {user.status && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            {user.status}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">
                        {user.name || <span className="text-muted-foreground italic">Not set</span>}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    {user.role && (
                      <div>
                        <Label className="text-muted-foreground">Account Role</Label>
                        <p className="font-medium">{user.role}</p>
                      </div>
                    )}
                    {user.lastLogin && (
                      <div>
                        <Label className="text-muted-foreground">Last Login</Label>
                        <p className="font-medium">
                          {new Date(user.lastLogin).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        {user.name ? 'Edit Profile' : 'Set Up Profile'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="profileName">Name</Label>
                          <Input
                            id="profileName"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profileAvatar">Avatar URL</Label>
                          <Input
                            id="profileAvatar"
                            value={profileForm.avatar}
                            onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter a URL to an image for your profile picture.
                          </p>
                        </div>
                        {profileForm.avatar && (
                          <div className="flex justify-center">
                            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted">
                              <Image
                                src={profileForm.avatar}
                                alt="Preview"
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateProfile} disabled={profileSaving}>
                          {profileSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Unable to load profile. Please try again later.</p>
                  <Button variant="outline" className="mt-4" onClick={loadUser}>
                    Retry
                  </Button>
                </div>
              )}
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
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(addresses) && addresses.length > 0 ? addresses.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-4 relative">
                      {addr.address.isDefault && (
                        <div className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Default
                        </div>
                      )}
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <h3 className="font-semibold">
                          {addr.address.firstName} {addr.address.lastName}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {addr.address.addressLine1}
                        {addr.address.addressLine2 && (
                          <>
                            <br />
                            {addr.address.addressLine2}
                          </>
                        )}
                        <br />
                        {addr.address.city}, {addr.address.state} {addr.address.postalCode}
                        <br />
                        {addr.address.country}
                        <br />
                        {addr.address.phone}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(addr)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {!addr.address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(addr.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteAddress(addr.id)}
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
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={addressSaving}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAddress} disabled={addressSaving}>
                          {addressSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
