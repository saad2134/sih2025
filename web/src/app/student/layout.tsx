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
  Sparkles,
  LogOut,
  Bell,
  Sun,
  Moon,
  BookOpen,
  Target,
  HelpCircle,
  FileUser,
  Settings,
  Bookmark,
  Send
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
import { apiService } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const studentNavItems = [
  {
    title: "Dashboard",
    url: "/student/dashboard",
    icon: LayoutDashboard,
    description: "Your personalized learning dashboard",
  },
  {
    title: "Learn & Upskill",
    url: "",
    icon: BookOpen,
    items: [
      {
        title: "Suggested Courses",
        url: "/student/suggested-courses",
        icon: Target,
        description: "AI-powered course suggestions for you",
      },
      {
        title: "Browse Courses",
        url: "/student/browse-courses",
        icon: BookOpen,
        description: "Explore NSQF-aligned courses",
      },
      {
        title: "Saved Courses",
        url: "/student/saved-courses",
        icon: Bookmark,
        description: "Your bookmarked courses",
      },
      {
        title: "Quick Quiz",
        url: "/student/quick-quiz",
        icon: HelpCircle,
        description: "Test your knowledge",
      },
    ],
  },
  {
    title: "Career & Growth",
    url: "",
    icon: Trophy,
    items: [
      {
        title: "My Career Map",
        url: "/student/career-map",
        icon: MapPin,
        description: "Visualize your career journey",
      },
      {
        title: "Market Insights",
        url: "/student/insights",
        icon: Sparkles,
        description: "Labor market trends and forecasts",
      },
      {
        title: "Achievements",
        url: "/student/achievements",
        icon: Trophy,
        description: "Your badges and milestones",
      },
    ],
  },
  {
    title: "Tools",
    url: "",
    icon: MessageSquare,
    items: [
      {
        title: "Resume/CV Builder",
        url: "/student/resume-cv-builder",
        icon: FileUser,
        description: "Create professional resumes",
      },
      {
        title: "AI Companion",
        url: "/student/ai-companion",
        icon: MessageSquare,
        description: "Your personal career assistant",
      },
    ],
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentSidebar>{children}</StudentSidebar>;
}

function StudentSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [feedbackTitle, setFeedbackTitle] = React.useState("");
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null);
  const [cooldown, setCooldown] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("feedbackCooldown");
      if (saved) {
        const remaining = Math.ceil((parseInt(saved) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    }
    return 0;
  });

  React.useEffect(() => {
    // Fetch profile
    apiService.getMe().then(res => {
      if (res.success && res.data) {
        setUser(res.data);
      }
    }).catch(err => console.error("Error fetching user profile", err));
  }, [pathname]);

  React.useEffect(() => {
    if (pathname.startsWith('/student/quick-quiz/') && pathname !== '/student/quick-quiz') {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [pathname]);

  React.useEffect(() => {
    if (cooldown > 0) {
      localStorage.setItem("feedbackCooldown", (Date.now() + cooldown * 1000).toString());
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem("feedbackCooldown");
    }
  }, [cooldown]);

  const handleSendFeedback = async () => {
    if (feedbackTitle.trim() && feedbackText.trim() && cooldown === 0 && !submittingFeedback) {
      try {
        setSubmittingFeedback(true);
        await apiService.submitFeedback(feedbackTitle, feedbackText, pathname);
        setFeedbackTitle("");
        setFeedbackText("");
        setFeedbackOpen(false);
        setCooldown(60);
      } catch (err) {
        console.error("Feedback submit failed:", err);
        setFeedbackTitle("");
        setFeedbackText("");
        setFeedbackOpen(false);
        setCooldown(60);
      } finally {
        setSubmittingFeedback(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (e) {
      console.error("Logout endpoint error:", e);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth";
    }
  };

  if (pathname === "/student/onboarding") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} className="h-screen">
      <Sidebar collapsible="offcanvas" className="border-r z-50">
        <SidebarHeader className="h-16 border-b">
          <div className="flex items-center justify-between px-2 h-full">
            <div className="flex items-center gap-3">
              <AppUI className="w-10 h-10 select-none" draggable={false} />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">ShikshaDisha</span>
                <span className="text-xs text-muted-foreground">
                  {siteConfig.version} ✦ <span className="text-violet-500 font-bold">Student</span>
                </span>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {studentNavItems.map((item) => {
                if (item.items) {
                  return (
                    <div key={item.title}>
                      <SidebarGroupLabel className="text-violet-500 font-semibold">{item.title}</SidebarGroupLabel>
                      {item.items.map((subItem) => {
                        const isActive = pathname === subItem.url;
                        return (
                          <SidebarMenuItem key={subItem.title} className="py-0.5">
                            <SidebarMenuButton asChild isActive={isActive} >
                              <Link href={subItem.url} className="flex items-center gap-3 ">
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
                  <SidebarMenuItem key={item.title} >
                    <SidebarMenuButton asChild isActive={isActive} >
                      <Link href={item.url} className="flex items-center gap-3 ">
                        <item.icon className={isActive ? "text-violet-500" : ""} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t">
          <div className="space-y-2">
            <div className="flex gap-2">
              {!user ? (
                <div className="flex-1 flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0 pr-1">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ) : (
                <Link
                  href="/student/profile"
                  className={`flex-1 flex items-center gap-2 p-2 rounded-lg transition-colors ${pathname === "/student/profile"
                      ? "bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800"
                      : "bg-muted/50 hover:bg-muted border"
                    }`}
                >
                  <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden border border-border">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || "Avatar"} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "ST"
                    )}
                  </div>
                    <div className="flex-1 min-w-0 pr-1">
                    <p className="text-sm font-medium truncate">{user.full_name || "Student"}</p>
                    <p className="text-xs text-muted-foreground capitalize leading-none">
                      {user.subscription_tier ? `${user.subscription_tier} tier` : "Free Tier"}
                    </p>
                    {user.pending_subscription_tier && (
                      <span className="text-[10px] text-amber-500 font-semibold block mt-1">
                        (Downgrade pending)
                      </span>
                    )}
                  </div>
                </Link>
              )}
              <Link
                href="/student/settings"
                className={`w-[60px] flex items-center justify-center p-2 rounded-lg transition-colors ${pathname === "/student/settings"
                    ? "bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800"
                    : "bg-muted/50 hover:bg-muted border"
                  }`}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground border hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm">Log Out</span>
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 h-full overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          {(!pathname.startsWith('/student/quick-quiz/') || pathname === '/student/quick-quiz') && <SidebarTrigger />}
          <div className="flex-1">
            {(() => {
              const directMatch = studentNavItems.find(item => item.url === pathname);
              const subItemMatch = studentNavItems.flatMap(item => item.items || []).find(subItem => subItem.url === pathname);
              const currentItem = directMatch || subItemMatch;
              
              if (pathname === "/student/profile") {
                return (
                  <div>
                    <h1 className="text-lg font-semibold">Profile</h1>
                    <p className="text-xs text-muted-foreground line-clamp-1">View and edit your profile</p>
                  </div>
                );
              }
              
              if (pathname === "/student/billing") {
                return (
                  <div>
                    <h1 className="text-lg font-semibold">Billing & Subscription</h1>
                    <p className="text-xs text-muted-foreground line-clamp-1">Choose the plan that works best for you</p>
                  </div>
                );
              }
              
              if (pathname === "/student/settings") {
                return (
                  <div>
                    <h1 className="text-lg font-semibold">Settings</h1>
                    <p className="text-xs text-muted-foreground line-clamp-1">Manage your application preferences</p>
                  </div>
                );
              }
              
              return (
                <div>
                  <h1 className="text-lg font-semibold">
                    {currentItem?.title || ""}
                  </h1>
                  {currentItem && 'description' in currentItem && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {currentItem.description}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            {(!pathname.startsWith('/student/quick-quiz/') || pathname === '/student/quick-quiz') && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="border rounded-lg">
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
                      <p className="text-xs text-muted-foreground">You earned the &quot;Fast Learner&quot; badge</p>
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
            )}
            <Sheet open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="border rounded-lg" disabled={cooldown > 0 || submittingFeedback}>
                  {cooldown > 0 ? (
                    <span className="text-xs font-medium">{cooldown}s</span>
                  ) : submittingFeedback ? (
                    <span className="text-xs font-medium">...</span>
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Send Feedback</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="feedback-title" className="text-xs font-semibold block text-muted-foreground">Title</label>
                    <input
                      id="feedback-title"
                      type="text"
                      placeholder="Summary of your feedback..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="feedback-message" className="text-xs font-semibold block text-muted-foreground">Message</label>
                    <textarea
                      id="feedback-message"
                      className="w-full h-32 p-3 border rounded-lg resize-none text-sm"
                      placeholder="Share your thoughts, suggestions, or report issues..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSendFeedback}
                    disabled={!feedbackTitle.trim() || !feedbackText.trim() || cooldown > 0 || submittingFeedback}
                  >
                    <Send size={16} className="mr-2" />
                    {cooldown > 0 ? `Wait ${cooldown}s` : submittingFeedback ? "Sending..." : "Send Feedback"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative border rounded-lg">
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
