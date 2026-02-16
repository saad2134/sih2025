"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  MapPin,
  Trophy,
  MessageSquare,
  BarChart3,
  Sparkles,
  LogOut,
  Bell,
  Sun,
  Moon,
  BookOpen,
  Target,
  HelpCircle
} from "lucide-react";
import AppUI from "@/components/logos/app_icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";

const demoNavItems = [
  {
    title: "Dashboard",
    url: "/demo/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Learn",
    url: "",
    icon: BookOpen,
    items: [
      {
        title: "Recommendations",
        url: "/demo/recommendations",
        icon: Target,
      },
      {
        title: "Browse Courses",
        url: "/demo/browse_courses",
        icon: BookOpen,
      },
      {
        title: "Take a quick quiz",
        url: "/demo/quick-quiz",
        icon: HelpCircle,
      },
    ],
  },
  {
    title: "Growth",
    url: "",
    icon: Trophy,
    items: [
      {
        title: "Career Map",
        url: "/demo/career_map",
        icon: MapPin,
      },
      {
        title: "Achievements",
        url: "/demo/achievements",
        icon: Trophy,
      },
      {
        title: "Leaderboard",
        url: "/demo/leaderboard",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Assistant",
    url: "",
    icon: MessageSquare,
    items: [
      {
        title: "AI Companion",
        url: "/demo/ai-companion",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Insights",
    url: "",
    icon: Sparkles,
    items: [
      {
        title: "Market Insights",
        url: "/demo/insights",
        icon: Sparkles,
      },
    ],
  },
];

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoSidebar>{children}</DemoSidebar>;
}

function DemoSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  if (pathname === "/demo/onboarding") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true} className="h-screen">
      <Sidebar collapsible="offcanvas" className="border-r z-200">
        <SidebarHeader className="py-4 border-b">
          <div className="flex items-center gap-3 px-2">
            <AppUI className="w-10 h-10 select-none" draggable={false} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">ShikshaDisha</span>
              <span className="text-xs text-muted-foreground">{siteConfig.version} ✦ <span className="text-red-500 font-bold">Demo Mode</span></span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarGroupLabel>Navigation</SidebarGroupLabel> */}
            <SidebarMenu>
              {demoNavItems.map((item) => {
                if (item.items) {
                  return (
                    <div key={item.title}>
                      <SidebarGroupLabel className="text-violet-500 font-semibold">{item.title}</SidebarGroupLabel>
                      {item.items.map((subItem) => {
                        const isActive = pathname === subItem.url;
                        return (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                              <Link href={subItem.url} className="flex items-center gap-3 pl-4">
                                <subItem.icon className={isActive ? "text-violet-500" : ""} />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  );
                }
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={isActive ? "text-violet-500" : ""} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>Logout (Go to Home)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/auth" className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>Get Started (Sign Up)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t">
          <Link 
            href="/demo/profile" 
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              pathname === "/demo/profile" 
                ? "bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800" 
                : "bg-muted/50 hover:bg-muted"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center font-semibold text-sm">
              SM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Saad Mohammed</p>
              <p className="text-xs text-muted-foreground">Level 8 • 2,450 pts</p>
            </div>
          </Link>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset className="flex flex-col flex-1 h-full overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {demoNavItems.find(item => item.url === pathname)?.title || 
                demoNavItems.find(item => item.items?.some(subItem => subItem.url === pathname))?.title ||
                demoNavItems.flatMap(item => item.items || []).find(subItem => subItem.url === pathname)?.title || 
                "Demo"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Achievement Unlocked!</p>
                      <p className="text-xs text-muted-foreground">You earned the "Fast Learner" badge</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New message from AI Companion</p>
                      <p className="text-xs text-muted-foreground">Check out your career recommendations</p>
                      <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
