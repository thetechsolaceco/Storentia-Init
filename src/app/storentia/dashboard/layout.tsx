"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { TopNav } from "@/components/admin/top-nav";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-3">
      <div className="flex min-h-[calc(100vh-24px)] gap-3">
        {/* Sidebar Container */}
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        {/* Content Container */}
        <div 
          className={cn(
            "flex-1 transition-all duration-300 relative",
            collapsed ? "ml-[68px]" : "ml-[232px]"
          )}
        >
          <div className="bg-[#E7F2EF] rounded-3xl min-h-[calc(100vh-24px)] relative overflow-hidden">
            <div className="absolute top-6 right-8 z-50">
              <TopNav />
            </div>
            <main className="p-8 pt-6">
              <div className="mt-4">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

