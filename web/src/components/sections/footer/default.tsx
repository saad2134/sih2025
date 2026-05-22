"use client";

import { ReactNode, useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Twitter, Github, Mail, Phone } from "lucide-react";

import AppUI from "../../logos/app_icon";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

export default function FooterSection({
  logo = <AppUI />,
  name = `${siteConfig.name}`,
  columns = [
    {
      title: "Application",
      links: [
        { text: "Home", href: "/" },
        { text: "About", href: "/about" },
        { text: "Our Team", href: "/team" },
        { text: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Terms of Service", href: "/terms" },
        { text: "Privacy Policy", href: "/privacy" },
        { text: "Cookie Policy", href: "/cookies" },
        { text: "Refunds Policy", href: "/refunds" },
      ],
    },
    {
      title: "Support",
      links: [
        { text: "Contact Us", href: "/contact" },
      ],
    },
  ],
  copyright = `© ${Number.isFinite(new Date().getFullYear()) ? new Date().getFullYear() : 2025} ${siteConfig.name} ${siteConfig.version}. All rights reserved.`,
  showModeToggle = true,
  className,
}: FooterProps) {
  const { setTheme } = useTheme();

  const [status, setStatus] = useState<"operational" | "issues" | "degraded" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        setStatus(json.status);
      } catch {
        setStatus("issues");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const socialLinks = [
    { icon: Twitter, href: siteConfig.links.twitter, label: "Twitter" },
    { icon: Github, href: siteConfig.links.github, label: "GitHub" },
    { icon: Mail, href: siteConfig.links.email, label: "Email" },
    { icon: Phone, href: siteConfig.links.phone, label: "Phone" },
  ].filter((link) => link.href);

  return (
    <footer className={cn("bg-background w-full border-t py-8", className)}>
      <div className="max-w-container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              {logo}
              <span className="text-xl font-bold">{name}</span>
              <a href="/status" className="inline-flex items-center rounded-md border border-foreground/30 px-2 py-0.5 text-xs font-semibold gap-2 bg-muted/50 text-foreground hover:bg-muted transition-colors cursor-pointer">
                <span className={cn("w-2 h-2 rounded-full", 
                  loading ? "bg-muted-foreground" : 
                  status === "operational" ? "bg-green-500" : 
                  status === "issues" ? "bg-yellow-500" : "bg-red-500"
                )} />
                <span>{loading ? "Checking..." : status ? status.charAt(0).toUpperCase() + status.slice(1) : ""}</span>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label={link.label}
                  >
                    <link.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3">{column.title}</h3>
              <div className="flex flex-col gap-2">
                {column.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t gap-4">
          <p className="text-xs text-muted-foreground">{copyright}</p>

          {showModeToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
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
          )}
        </div>
      </div>
    </footer>
  );
}
