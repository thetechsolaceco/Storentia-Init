"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, Store, Shield, Calendar, Mail, Bell, Globe, Save, MoreHorizontal } from "lucide-react";
import { getStoreData, type StoreData } from "@/lib/apiClients";
import { useAuth } from "@/components/providers/auth-provider";
import { PageLoader } from "@/components/admin/page-loader";

export default function SettingsPage() {
  const { user, isLoading: userLoading } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const storeData = getStoreData();
    if (storeData) {
      setStore(storeData);
    }
    setLoading(false);
  }, []);

  if (loading || userLoading) {
    return <PageLoader />;
  }

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "account", label: "Account", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "others", label: "Others", icon: MoreHorizontal },
  ];

  return (
    <div className="space-y-4 font-sans h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-medium tracking-tight text-emerald-950">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm font-inter">Manage your store and account settings.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>


      {/* Content */}
      <div className="flex-1">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Store Info Card */}
            {store && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-gray-600" />
                      <h2 className="text-lg font-medium text-gray-900">Store Information</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Manage your store details and public profile.</p>
                  </div>
                  <Button size="sm" className="h-8 px-3 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium">
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                    <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Store className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900">{store.store.name}</p>
                      <p className="text-sm text-gray-500">{store.store.description || "No description"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {store.type}
                        </span>
                        {store.permissions.map((perm) => (
                          <span key={perm} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <Shield className="h-3 w-3" />
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="storeName" className="text-sm font-medium text-gray-700">Store Name</Label>
                      <Input
                        id="storeName"
                        defaultValue={store.store.name}
                        className="border-gray-200 focus:ring-0 focus:border-black rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        defaultValue={store.store.description || ""}
                        placeholder="Enter store description"
                        className="border-gray-200 focus:ring-0 focus:border-black rounded-lg resize-none min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Contact Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={store.store.owner.email || ""}
                        className="border-gray-200 focus:ring-0 focus:border-black rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}


        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {user && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <h2 className="text-lg font-medium text-gray-900">Account Details</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Your personal account information.</p>
                  </div>
                  <Button size="sm" className="h-8 px-3 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium">
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-5 pb-6 border-b border-gray-100">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-20 h-20 rounded-xl object-cover  border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Users className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-semibold text-xl text-gray-900">{user.name || "No name set"}</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.role && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {user.role}
                          </span>
                        )}
                        {user.status && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {user.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 grid gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-sm font-medium text-gray-700">Full Name</Label>
                      <Input
                        id="userName"
                        defaultValue={user.name || ""}
                        placeholder="Enter your name"
                        className="border-gray-200 focus:ring-0 focus:border-black rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="border-gray-200 bg-gray-50 rounded-lg"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {store && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-medium text-gray-900">Store Membership</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Store Created</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(store.store.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Your Role</p>
                      <p className="font-medium text-gray-900 mt-1">{store.type}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Manage what emails you receive.</p>
                </div>
                <Button size="sm" className="h-8 px-3 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium">
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Changes
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-gray-900">New Order Alerts</p>
                    <p className="text-sm text-gray-500 mt-0.5">Receive an email when a new order is placed.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500 mt-0.5">Get notified when products are running low.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-gray-900">Customer Reviews</p>
                    <p className="text-sm text-gray-500 mt-0.5">Get notified when customers leave reviews.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-gray-900">Weekly Reports</p>
                    <p className="text-sm text-gray-500 mt-0.5">Receive weekly sales and performance reports.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-gray-900">Marketing Updates</p>
                    <p className="text-sm text-gray-500 mt-0.5">Tips and updates to help grow your store.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Others Tab */}
        {activeTab === "others" && (
          <div className="space-y-6">
            {/* Currency & Region Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-medium text-gray-900">Currency & Region</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Configure your store&apos;s currency and regional settings.</p>
                </div>
                <Button size="sm" className="h-8 px-3 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium">
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Changes
                </Button>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
                  <Input
                    id="currency"
                    defaultValue="USD ($)"
                    className="border-gray-200 focus:ring-0 focus:border-black rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">Timezone</Label>
                  <Input
                    id="timezone"
                    defaultValue="UTC (Coordinated Universal Time)"
                    className="border-gray-200 focus:ring-0 focus:border-black rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700">Language</Label>
                  <Input
                    id="language"
                    defaultValue="English (US)"
                    className="border-gray-200 focus:ring-0 focus:border-black rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Disable the public store for maintenance.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
