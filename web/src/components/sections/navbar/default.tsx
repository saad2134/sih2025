"use client";

import { Menu, Sun, Moon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import AppUI from "../../logos/app_icon";
import { Button, type ButtonProps } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../ui/sheet";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <AppUI />,
  name = `${siteConfig.name}`,
  homeUrl = '/',
  mobileLinks = [],
  actions = [
    {
      text: "Try Demo",
      href: '/demo/onboarding',
      isButton: true,
      variant: "secondary",
    },
    {
      text: "Dashboard",
      href: '/student/dashboard',
      isButton: true,
      variant: "default",
    },
  ],
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  const { setTheme } = useTheme();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('auth_token'));
  }, []);

  const dynamicActions = actions.map(action => {
    if (action.text === "Dashboard" && !isAuth) {
      return {
        ...action,
        text: "Get Started",
        href: "/auth"
      };
    }
    return action;
  });

  return (
    <header className={cn("fixed top-0 left-0 w-full z-50", className)}>
      <div className="max-w-container mx-auto flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
        <NavbarComponent className="bg-violet-500/10 backdrop-blur-sm w-full flex items-center justify-between px-4 sm:px-6 md:px-8 rounded-xl">

          <NavbarLeft>
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-lg sm:text-xl font-bold"
            >
              {logo}
              {name}
            </a>
          </NavbarLeft>

          {/* NavbarRight with DropdownMenu theme switcher, desktop buttons, and mobile menu */}
          <NavbarRight className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer h-9 w-9 p-0 flex items-center justify-center shrink-0">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center gap-4">
              {dynamicActions.map((action, index) =>
                action.isButton ? (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                  >
                    <a href={action.href}>
                      {action.icon}
                      {action.text}
                      {action.iconRight}
                    </a>
                  </Button>
                ) : (
                  <a
                    key={index}
                    href={action.href}
                    className="text-sm transition-colors hover:text-primary"
                  >
                    {action.text}
                  </a>
                ),
              )}
            </div>

            {/* Mobile menu toggle nested inside NavbarRight */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[320px] sm:max-w-[360px]">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <nav className="grid gap-4 sm:gap-6 text-base sm:text-lg font-medium">
                  <a
                    href={homeUrl}
                    className="flex items-center gap-2 text-xl font-bold pb-4"
                  >
                    <span>{name}</span>
                  </a>
                  {mobileLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.text}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3">
                    {dynamicActions.map((action, index) =>
                      action.isButton ? (
                        <Button
                          key={index}
                          variant={action.variant || "default"}
                          className="w-full justify-center"
                          asChild
                        >
                          <a href={action.href}>
                            {action.icon}
                            {action.text}
                            {action.iconRight}
                          </a>
                        </Button>
                      ) : (
                        <a
                          key={index}
                          href={action.href}
                          className="lg:text-muted-foreground hover:text-foreground transition-colors text-white py-2"
                        >
                          {action.text}
                        </a>
                      )
                    )}

                    {/* Responsive Mobile Drawer Theme Selector */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
                      <span className="text-sm font-medium text-muted-foreground">Theme</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="relative rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer h-9 w-9 p-0 flex items-center justify-center shrink-0">
                            <Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                            Light
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                            Dark
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                            System
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>

        </NavbarComponent>
      </div>
    </header>
  );
}
