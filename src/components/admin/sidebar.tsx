"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Tags,
  Percent,
  Image as ImageIcon,
  MessageSquare,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearUserSession } from "@/lib/apiClients";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/storentia/dashboard" },
  { icon: Package, label: "Products", href: "/storentia/dashboard/products" },
  { icon: ShoppingCart, label: "Orders", href: "/storentia/dashboard/orders" },
  { icon: Users, label: "Customers", href: "/storentia/dashboard/customers" },
  { icon: Tags, label: "Categories", href: "/storentia/dashboard/categories" },
  { icon: Percent, label: "Coupons", href: "/storentia/dashboard/coupons" },
  { icon: ImageIcon, label: "Banners", href: "/storentia/dashboard/banners" },
  { icon: MessageSquare, label: "Testimonials", href: "/storentia/dashboard/testimonials" },
  { icon: FileText, label: "Reports", href: "/storentia/dashboard/reports" },
  { icon: Settings, label: "Settings", href: "/storentia/dashboard/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    clearUserSession();
    window.location.href = "/storentia/login";
  };

  return (
    <aside className="w-64 bg-[#1C1C24] text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="font-bold text-primary-foreground">S</span>
        </div>
        <span className="text-xl font-bold tracking-tight">Storentia</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-[#D1F366] text-black font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-black"
                      : "text-gray-400 group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
