"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { faqConfig, FAQItem } from "@/config/faqConfig";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const FAQ_CONFIG = {
  description: "Find answers to common questions about our AI-powered learning path generator and how it can help you achieve your career goals.",
  items: faqConfig,
};

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function FAQ({
  title = "Frequently Asked Questions (FAQs)",
  items = faqConfig.map((item: FAQItem) => ({
    question: item.question,
    answer: (
      <div dangerouslySetInnerHTML={{ __html: item.answer }} />
    ),
    value: item.value,
  })),
  className,
}: FAQProps) {
  return (
    <section id='faqs' className={`py-12 sm:py-16 relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0">
        <motion.div
            className="absolute top-20 left-10 h-24 w-24 rounded-full bg-brand-foreground/25 blur-xl"
            animate={{
                x: [0, -25, 0],
                y: [0, 15, 0],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
        <motion.div
            className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-brand-foreground/25 blur-xl"
            animate={{
                x: [0, 25, 0],
                y: [0, -15, 0],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
            }}
        />
        <motion.div
            className="absolute top-1/2 left-1/4 h-20 w-20 rounded-full bg-brand-foreground/25 blur-lg"
            animate={{
                x: [0, -15, 15, 0],
                y: [0, -10, 10, 0],
            }}
            transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
            }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-primary transition-all duration-300 hover:scale-105 hover:bg-gradient-to-l animate-gradient leading-[1.2] sm:text-4xl md:text-6xl lg:text-7xl">
                {title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
                {FAQ_CONFIG.description}
            </p>
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 pt-4">
              <DotLottieReact
                src="https://lottie.host/b3fe4f6c-fedd-45fb-b0c6-cd1a0c8377da/lIUexQIsMW.lottie"
                loop
                autoplay
              />
            </div>
          </div>

          <div className="w-full">
            {items !== false && items.length > 0 && (
                <Accordion type="single" collapsible className="space-y-4">
                {items.map((item, index) => (
                    <AccordionItem
                    key={index}
                    value={item.value || `item-${index + 1}`}
                    className="border border-border rounded-lg px-6 bg-gradient-to-br from-card via-background to-card/50 relative w-full shrink-0 hover:shadow-lg transition-all duration-300 from-accent/10 via-background to-accent/10 hover:from-accent/25 hover:via-background hover:to-accent/25 backdrop-blur-sm"
                    >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-4 text-foreground">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {item.answer}
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
