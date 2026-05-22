import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "../../ui/button";
import Glow from "../../ui/glow";

import { Section } from "../../ui/section";

interface CTAButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface CTAProps {
  title?: string;
  buttons?: CTAButtonProps[] | false;
  className?: string;
}

export default function CTA({
  title = "Smarter choices. Better skills. Brighter future.",
  buttons = [
    {
      href: siteConfig.getStartedUrl,
      text: "Get Started",
      variant: "default",
    },
    {
      href: "/demo/onboarding",
      text: "Try Demo",
      variant: "outline",
    },
  ],
  className,
}: CTAProps) {
  return (
    <Section className={cn("group relative overflow-hidden", className)}>
      <div className="max-w-container relative z-10 mx-auto flex flex-col items-center gap-6 text-center sm:gap-8 sm:pb-0 pb-8">
        <h2 className="max-w-[640px] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight font-semibold px-2">
          {title}
        </h2>
        {buttons !== false && buttons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || "default"}
                size="xl"
                asChild
              >
                <a href={button.href}>
                  {button.icon}
                  {button.text}
                  {button.iconRight}
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="absolute top-0 left-0 h-full w-full translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
        <Glow variant="bottom" />
      </div>
    </Section>
  );
}
