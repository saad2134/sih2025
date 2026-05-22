import { Menu } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import AppUI from "../../logos/app_icon";
import { Button, type ButtonProps } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import Navigation from "../../ui/navigation";
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
  name =  `${siteConfig.name}`,
  homeUrl = '/',
  mobileLinks = [/* 
    { text: "Try Demo", href: '/demo/onboarding' },*/
  ],
  actions = [
    { text: "Try Demo", href: '/demo/onboarding', isButton: false },
    {
      text: "Get Started",
      href: '/auth',
      isButton: true,
      variant: "default",
    },
  ],
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
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
          {/* NavbarRight buttons hidden on mobile */}
          <NavbarRight className="hidden md:flex items-center gap-4">
            {actions.map((action, index) =>
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
                  className="text-sm"
                >
                  {action.text}
                </a>
              ),
            )}
          </NavbarRight>
          {/* Mobile menu toggle always visible on mobile */}
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
                  {actions.map((action, index) =>
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
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </NavbarComponent>
      </div>
    </header>



  );
}
