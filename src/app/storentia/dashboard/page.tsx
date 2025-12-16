"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Users,
  Activity,
} from "lucide-react";
import { kpiData, revenueData, recentOrders } from "@/data/admin-mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  authAPI,
  setStoreData,
  setApiKey,
  getStoreData,
} from "@/lib/apiClients";
import { useAuth } from "@/components/providers/auth-provider";
import { PageLoader } from "@/components/admin/page-loader";

const API_KEY = process.env.NEXT_PUBLIC_STORENTIA_API_KEY || "";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { setUserData } = useAuth();

  useEffect(() => {
    const initDashboard = async () => {
      try {
        console.log("[Dashboard] Fetching current user...");
        const userResponse = await authAPI.getCurrentUser();
        console.log("[Dashboard] User response:", userResponse);

        if (!userResponse.success || !userResponse.data?.user) {
          console.log("[Dashboard] No user, redirecting to login");
          router.replace("/storentia/login");
          return;
        }

        // Store user data in auth context
        setUserData(userResponse.data.user);

        const existingStore = getStoreData();
        if (!existingStore && API_KEY) {
          console.log("[Dashboard] Validating API key...");
          const keyResponse = await authAPI.validateKey(API_KEY);
          console.log("[Dashboard] Key validation response:", keyResponse);

          if (keyResponse.success && keyResponse.store_data) {
            setApiKey(API_KEY);
            setStoreData(keyResponse.store_data);
            console.log("[Dashboard] Store data saved:", keyResponse.store_data);
          }
        }
      } catch (error) {
        console.error("[Dashboard] Error:", error);
        router.replace("/storentia/login");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 font-sans">
      <div className=" flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-playfair font-medium tracking-tight text-emerald-950">Dashboard</h1>
            <p className="text-gray-500 mt-2 font-inter">Welcome back to your store overview.</p>
        </div> 
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
              {i === 0 ? (
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              ) : i === 1 ? (
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              ) : i === 2 ? (
                <Users className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Activity className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    kpi.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {Math.abs(kpi.change)}%
                </span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium flex flex-col items-end gap-1">
                    <span>+${order.total.toFixed(2)}</span>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] px-1 py-0 h-5"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/storentia/dashboard/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
