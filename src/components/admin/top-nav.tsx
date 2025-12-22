"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Bell, LogOut, Sun, Moon, FileText } from "lucide-react";
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
    <div className="flex items-center gap-2 bg-card rounded-full border border-border p-1.5 shadow-sm">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground relative"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-destructive rounded-full border border-card" />
      </Button>

      {/* Policies */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Policies</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Storentia Policies</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://storentia.com/legal/domain-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              Domain Policy
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://storentia.com/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              Terms of Service
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://storentia.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              Privacy Policy
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-[1px] bg-border mx-1" />

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
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
