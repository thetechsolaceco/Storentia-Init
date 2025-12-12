"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Store, Shield, Calendar, Mail } from "lucide-react";
import {
  authAPI,
  getStoreData,
  type User,
  type StoreData,
} from "@/lib/apiClients";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success && userResponse.data?.user) {
          setUser(userResponse.data.user);
        }
        const storeData = getStoreData();
        if (storeData) {
          setStore(storeData);
        }
      } catch (error) {
        console.error("[Settings] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {user && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full border-2 border-muted"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.role && (
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    )}
                    {user.status && (
                      <Badge
                        variant={user.status === "ACTIVE" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {user.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {store && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{store.store.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {store.store.description || "No description"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {store.type}
                  </Badge>
                  {store.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {perm}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                  <Calendar className="h-3 w-3" />
                  Created {new Date(store.store.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Manage your store details and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  defaultValue={store?.store.name || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={store?.store.description || ""}
                  placeholder="Enter store description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={store?.store.owner.email || ""}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency & Region</CardTitle>
              <CardDescription>
                Configure your store&apos;s currency and regional settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="USD ($)" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Disable the public store for maintenance.
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage what emails you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">New Order Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive an email when a new order is placed.
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Low Stock Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified when products are running low.
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
