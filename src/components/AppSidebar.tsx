
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Boxes, Building2, LineChart, Package, FileCheck, Users, Settings } from "lucide-react";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      icon: LineChart,
      href: "/dashboard",
      roles: ["admin", "warehouseManager", "staff"],
    },
    {
      title: "Products",
      icon: Package,
      href: "/products",
      roles: ["admin", "warehouseManager", "staff"],
    },
    {
      title: "Warehouses",
      icon: Building2,
      href: "/warehouses",
      roles: ["admin", "warehouseManager", "staff"],
    },
    {
      title: "Stock",
      icon: Boxes,
      href: "/stock",
      roles: ["admin", "warehouseManager", "staff"],
    },
    {
      title: "Orders",
      icon: FileCheck,
      href: "/orders",
      roles: ["admin", "warehouseManager"],
    },
    {
      title: "Users",
      icon: Users,
      href: "/users",
      roles: ["admin"],
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["admin"],
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground font-bold">
            IMS
          </div>
          <span className="font-semibold text-lg">Inventory Manager</span>
        </div>
        <SidebarTrigger className="absolute right-2 top-4 lg:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md",
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground font-medium">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs hover:underline text-sidebar-foreground/80"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
