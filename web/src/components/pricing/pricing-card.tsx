"use client";
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Users, TrendingUp, Shield, Award, Rocket, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const freeFeatures = [
  'Access to 50+ free courses',
  'Basic progress tracking',
  'Community forum access',
  'Email support',
  '1 certificate per month',
];

const proFeatures = [
  'Access to all courses',
  'Advanced progress tracking',
  'AI-powered recommendations',
  'Priority email support',
  'Unlimited certificates',
  'Resume builder access',
  'Career insights dashboard',
];

const premiumFeatures = [
  'Everything in Pro',
  '1-on-1 mentoring sessions',
  'Job placement assistance',
  'Personalized career roadmap',
  'Industry expert workshops',
  'Resume review by experts',
  'Interview preparation',
];

interface PricingCardsProps {
  className?: string;
  compact?: boolean;
}

export const PricingCards: React.FC<PricingCardsProps> = ({ className = "", compact = false }) => {
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    setIsAuth(!!localStorage.getItem('auth_token'));
  }, []);

  const plans = [
    {
      name: "Free",
      price: "Free",
      period: "",
      description: "Perfect for getting started",
      icon: Zap,
      features: freeFeatures,
      notIncluded: [
        "AI-powered recommendations",
        "Advanced analytics",
        "Priority support",
        "Unlimited certificates",
        "Resume builder access",
      ],
      cta: "Get Started",
      href: isAuth ? "/student/dashboard" : "/auth",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹499",
      period: "/month",
      description: "Best for serious learners",
      icon: Crown,
      features: proFeatures,
      notIncluded: [
        "1-on-1 mentoring",
        "Job placement assistance",
      ],
      cta: "Choose Pro",
      href: isAuth ? "/student/billing" : "/auth",
      popular: true,
    },
    {
      name: "Premium",
      price: "₹999",
      period: "/month",
      description: "For career transformation",
      icon: Rocket,
      features: premiumFeatures,
      notIncluded: [],
      cta: "Choose Premium",
      href: isAuth ? "/student/billing" : "/auth",
      popular: false,
    },
  ];

  return (
    <div className={className}>
      <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-3'} gap-6`}>
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`flex flex-col ${plan.popular ? 'border-2 border-violet-500 rounded-2xl relative' : 'border rounded-xl'} overflow-visible hover:shadow-lg transition-all duration-300 ${plan.popular ? 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-violet-500 shadow-lg">Most Popular</Badge>
                </div>
              )}
              <div className={`flex flex-col flex-1 ${compact ? "p-4 pt-6" : "p-6 pt-8"}`}>
                <div className="text-center mb-4">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3 ${plan.popular ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-violet-500' : 'text-muted-foreground'}`} />
                  </div>
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-4 h-4 shrink-0 mt-0.5 text-center">×</span>
                      <span className="line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-auto w-full font-semibold py-2 rounded-lg transition-all duration-300 text-center flex items-center justify-center ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/60 border-0 ring-2 ring-violet-500/50' : 'bg-secondary hover:bg-secondary/80 border text-foreground'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PricingSectionProps {
  showHeader?: boolean;
  showBottom?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  showHeader = true, 
  showBottom = true 
}) => {
  return (
    <div className="w-full">
      {showHeader && (
        <div className="relative overflow-hidden py-12 lg:py-16">
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
          <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 lg:px-6 py-2 mb-4 lg:mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Transparent Pricing</span>
            </div>
            
            <h1 className="text-3xl lg:text-5xl md:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6">
              Pricing
            </h1>
            
            <p className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose the plan that fits your learning journey. Start free, upgrade when you&apos;re ready to accelerate your career.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-8 md:px-4 lg:px-6 pb-12 lg:pb-20">
        <PricingCards />

        {showBottom && (
          <div className="mt-12 lg:mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 lg:px-6 py-2 lg:py-3">
              <Shield className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
              <span className="text-xs lg:text-sm text-muted-foreground">
                All plans include 256-bit SSL encryption and GDPR compliance
              </span>
            </div>
            
            <p className="mt-6 lg:mt-8 text-muted-foreground max-w-xl mx-auto text-sm lg:text-base">
              Need an enterprise solution for your team? 
              <a href="/contact" className="text-primary hover:text-primary/80 ml-1 lg:ml-2 font-semibold underline underline-offset-4">
                Contact us for custom pricing
              </a>
            </p>
          </div>
        )}
      </div>

      {showBottom && (
        <div className="pb-8">
          <div className="max-w-6xl mx-auto px-8 md:px-4 lg:px-6 py-12 lg:py-16">
            <h3 className="text-xl lg:text-2xl font-bold text-center mb-8 lg:mb-12">
              Why Upgrade to Premium?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center p-5 lg:p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Advanced AI</h4>
                <p className="text-sm text-muted-foreground">
                  Our premium AI learns from your behavior and optimizes recommendations for your exact learning style
                </p>
              </div>
              
              <div className="text-center p-5 lg:p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Career Acceleration</h4>
                <p className="text-sm text-muted-foreground">
                  Career simulator and skill gap analysis show you exactly what to learn for your dream job
                </p>
              </div>
              
              <div className="text-center p-5 lg:p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-5 lg:w-6 h-5 lg:h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Expert Guidance</h4>
                <p className="text-sm text-muted-foreground">
                  Included 1-on-1 consultation helps you avoid costly mistakes and wasted time on wrong courses
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
