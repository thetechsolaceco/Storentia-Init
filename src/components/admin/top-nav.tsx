"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Bell, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function TopNav() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatar || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-full border border-gray-200 dark:border-zinc-700 p-1.5 shadow-sm">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-600" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-400" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 relative"
      >
        <Bell className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full border border-white dark:border-zinc-900" />
      </Button>

      <div className="h-4 w-[1px] bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-2">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-600 cursor-pointer text-xs"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
