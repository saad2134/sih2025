"use client";

import * as React from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Zap, Crown, Rocket } from "lucide-react";
import { siteConfig } from "@/config/site";

const plans = [
    {
        name: "Free",
        price: "Free",
        period: "",
        description: "Perfect for getting started",
        icon: Zap,
        features: [
            "Access to 50+ free courses",
            "Basic progress tracking",
            "Community forum access",
            "Email support",
            "1 certificate per month",
        ],
        notIncluded: [
            "AI-powered recommendations",
            "Advanced analytics",
            "Priority support",
            "Unlimited certificates",
            "Resume builder access",
        ],
        cta: "Current Plan",
        popular: false,
    },
    {
        name: "Pro",
        price: "₹499",
        period: "/month",
        description: "Best for serious learners",
        icon: Crown,
        features: [
            "Access to all courses",
            "Advanced progress tracking",
            "AI-powered recommendations",
            "Priority email support",
            "Unlimited certificates",
            "Resume builder access",
            "Career insights dashboard",
        ],
        notIncluded: [
            "1-on-1 mentoring",
            "Job placement assistance",
        ],
        cta: "Upgrade Now",
        popular: true,
    },
    {
        name: "Premium",
        price: "₹999",
        period: "/month",
        description: "For career transformation",
        icon: Rocket,
        features: [
            "Everything in Pro",
            "1-on-1 mentoring sessions",
            "Job placement assistance",
            "Personalized career roadmap",
            "Industry expert workshops",
            "Resume review by experts",
            "Interview preparation",
        ],
        notIncluded: [],
        cta: "Go Premium",
        popular: false,
    },
];

export default function Billing() {
    const router = useRouter();
    
    useEffect(() => {
        document.title = `Billing & Subscription ✦ ${siteConfig.name}`;
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 w-fit border"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, index) => {
                            const Icon = plan.icon;
                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className={`h-full flex flex-col ${plan.popular ? 'border-violet-500 border-2 relative' : ''}`}>
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <Badge className="bg-violet-500">Most Popular</Badge>
                                            </div>
                                        )}
                                        <CardHeader className="text-center pb-4">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                                                <Icon className="w-6 h-6 text-violet-500" />
                                            </div>
                                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                            <div className="mt-4">
                                                <span className="text-3xl font-bold">{plan.price}</span>
                                                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <ul className="space-y-3">
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
                                        </CardContent>
                                        <div className="p-4 pt-0">
                                            <Button 
                                                className={`w-full font-semibold transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/60 border-0 ring-2 ring-violet-500/50 animate-pulse' : ''}`} 
                                                variant={plan.popular ? "default" : "outline"}
                                            >
                                                {plan.popular && <Zap className="w-4 h-4 mr-1.5 fill-white" />}
                                                {plan.cta}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-12">
                        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
                                    <p className="text-sm text-muted-foreground">Yes, you can cancel your subscription at any time. You'll continue to have access until your billing period ends.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                                    <p className="text-sm text-muted-foreground">We accept all major credit cards, debit cards, UPI, and net banking.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-medium mb-2">Is there a refund policy?</h4>
                                    <p className="text-sm text-muted-foreground">We offer a 7-day money-back guarantee for all paid plans. Contact support for assistance.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-medium mb-2">Can I upgrade or downgrade?</h4>
                                    <p className="text-sm text-muted-foreground">Yes, you can change your plan at any time. The price difference will be adjusted in your next billing cycle.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}