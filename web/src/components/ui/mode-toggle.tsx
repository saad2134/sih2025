"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

import { useTheme } from "@/components/contexts/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            className="rounded-full w-8 h-8 bg-background mr-2"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunIcon
              className={`w-[1.2rem] h-[1.2rem] transition-transform duration-500 ease-in-out ${
                theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
              }`}
            />
            <MoonIcon
              className={`absolute w-[1.2rem] h-[1.2rem] transition-transform duration-500 ease-in-out ${
                theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
              }`}
            />
            <span className="sr-only">Switch Theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Switch Theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
