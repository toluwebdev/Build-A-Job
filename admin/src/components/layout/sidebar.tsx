"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  AlertTriangle,
  Shield,
  CreditCard,
  Settings,
  BarChart3,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hammer,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Trades", href: "/trades", icon: Hammer, badge: 12 },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Disputes", href: "/disputes", icon: AlertTriangle, badge: 3 },
  { label: "Moderation", href: "/moderation", icon: Shield, badge: 8 },
  { label: "Finance", href: "/finance", icon: CreditCard },
  { label: "Config", href: "/config", icon: Settings },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Admin Users", href: "/admin-users", icon: UserCog },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-foreground">
              Build-A-Job Admin
            </span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isRoot = pathname === "/" || pathname === "";
          const isActive =
            pathname.startsWith(item.href) ||
            (item.href === "/overview" && isRoot);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-violet-500 bg-violet-500/10 text-violet-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-violet-400")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[8px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20">
            <span className="text-xs font-medium text-violet-400">SA</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                Super Admin
              </p>
              <p className="truncate text-xs text-muted-foreground">
                admin@buildajob.co.uk
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mt-2 w-full justify-start text-muted-foreground hover:text-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
