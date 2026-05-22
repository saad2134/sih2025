'use client';

import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import Github from "../../logos/github";
import { BorderBeam } from "@/components/ui/border-beam" 
import { Button, type ButtonProps } from "../../ui/button";
import Glow from "../../ui/glow";
import { Mockup, MockupFrame } from "../../ui/mockup";
import Screenshot from "../../ui/screenshot";
import { Section } from "../../ui/section";
import { motion } from "framer-motion";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "Your personalized roadmap to future-ready skills!",
  description = "Discover your future-ready career journey with personalized training recommendations.",
  mockup = (
    <Screenshot
      srcLight="/dashboard-light.png"
      srcDark="/dashboard-dark.png"
      alt="App UI app screenshot"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  buttons = [
    {
      href: '/auth',
      text: "Get Started",
      variant: "default",
    },
    {
      href: '/demo/onboarding',
      text: "Try Demo",
      variant: "outline",
    },
    {
      href: siteConfig.links.github,
      text: "GitHub",
      variant: "glow",
      icon: <Github className="mr-2 size-4" />,
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 relative",
        className,
      )}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute top-10 left-10 w-[150px] h-[150px] rounded-full bg-brand-foreground/25  blur-[60px]"
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-10 right-10 w-[120px] h-[120px] rounded-full  bg-brand-foreground/25  blur-[50px]"
          animate={{
            x: [0, -15, 0],
            y: [0, 10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[80px] h-[80px] rounded-full  bg-brand-foreground/25  blur-[40px]"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
      <div className="max-w-container mx-auto flex flex-col gap-8 sm:gap-12 md:gap-16 lg:gap-24 pt-20 sm:pt-16 md:pt-16 px-4 sm:px-6">

        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">

          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-3xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl animate-appear text-muted-foreground relative z-10 max-w-[840px] font-medium text-balance opacity-0 delay-100 px-2">
            {description}
          </p>
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative z-10 flex flex-wrap justify-center gap-3 sm:gap-4 opacity-0 delay-300">
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
          {mockup !== false && (
            <div className="relative w-full pt-12 group">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup
                  type="responsive"
                  className="bg-background/90 w-full rounded-xl border-0"
                >
                  {mockup}
                </Mockup>
                <BorderBeam duration={6} size={200} borderWidth={5} colorFrom={'var(--primary)'} colorTo={'var(--secondary)'} />
              </MockupFrame>
              
              <Glow
                variant="top"
                className="absolute top-0 left-0 h-full w-full translate-y-4 opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-8px] group-hover:opacity-100"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
