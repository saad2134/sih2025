"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";

import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

interface ProgrammingComputerSectionProps {
  className?: string;
}

export default function ProgrammingComputerSection({
  className,
}: ProgrammingComputerSectionProps) {
  return (
    <Section
      className={cn(
        "py-8 sm:py-10 md:py-12 lg:py-16 overflow-hidden",
        className
      )}
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Animations - Left Side */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              ease: [0.165, 0.84, 0.44, 1],
            }}
          >
            {/* First Card - Computer GIF */}
            <motion.div
              className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-background/60 via-background/40 to-background/60 border border-border/60 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-shadow duration-500"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 blur-[80px]"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60">
                <DotLottieReact
                  src="https://lottie.host/5240d9e2-886d-4604-989c-17c0bfbdc267/e4E8hLqZjj.lottie"
                  loop
                  autoplay
                />
              </div>
            </motion.div>

            {/* Second Card - New GIF */}
            <motion.div
              className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-background/60 via-background/40 to-background/60 border border-border/60 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-shadow duration-500"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 blur-[80px]"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60">
                <DotLottieReact
                  src="https://lottie.host/5650fd43-244c-4990-a4a5-aea89e916e3a/DZnZbUZxnv.lottie"
                  loop
                  autoplay
                  className="w-full h-full scale-75"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Text Content - Right Side */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.165, 0.84, 0.44, 1],
            }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient leading-[1.3]">
              Your personal curated course being generated...
            </h3>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
