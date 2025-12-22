"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
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
  PanelLeftClose,
  PanelLeftOpen,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/storentia/dashboard",
    enabled: true,
  },
  {
    icon: Tags,
    label: "Categories",
    href: "/storentia/dashboard/categories",
    enabled: true,
  },
  {
    icon: Package,
    label: "Products",
    href: "/storentia/dashboard/products",
    enabled: true,
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/storentia/dashboard/orders",
    enabled: false,
  },
  {
    icon: Users,
    label: "Customers",
    href: "/storentia/dashboard/customers",
    enabled: false,
  },
  {
    icon: Percent,
    label: "Coupons",
    href: "/storentia/dashboard/coupons",
    enabled: false,
  },
  {
    icon: ImageIcon,
    label: "Banners",
    href: "/storentia/dashboard/banners",
    enabled: false,
  },
  {
    icon: MessageSquare,
    label: "Testimonials",
    href: "/storentia/dashboard/testimonials",
    enabled: false,
  },
  {
    icon: FileText,
    label: "Reports",
    href: "/storentia/dashboard/reports",
    enabled: false,
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/storentia/dashboard/settings",
    enabled: true,
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 transition-all duration-300 flex flex-col bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[232px]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-sidebar-border",
          collapsed ? "justify-center" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="h-8 w-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-playfair font-bold text-lg text-sidebar-foreground">
              Storentia
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "h-10 w-10"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {sidebarItems
          .filter((item) => item.enabled)
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent justify-start",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <span className="ml-3 text-sm font-medium">Logout</span>
          )}
        </Button>
      </div>
    </aside>
  );
}
