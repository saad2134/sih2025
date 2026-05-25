"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Zap, Crown, Rocket, Loader2, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { apiService } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

function ResponsiveDialog({ open, onOpenChange, children, title, description, footer, className }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
    title: string;
    description: string;
    footer?: React.ReactNode;
    className?: string;
}) {
    const [isSmallScreen, setIsSmallScreen] = React.useState(false);

    React.useEffect(() => {
        const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (isSmallScreen) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                    {children && <div className="px-4 pb-4">{children}</div>}
                    <DrawerFooter>
                        {footer}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={className}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}

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
        cta: "Get Started",
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
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPlan, setConfirmPlan] = useState<string | null>(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");

    const showAlertDialog = (msg: string) => {
        setAlertMsg(msg);
        setAlertOpen(true);
    };

    const loadProfile = () => {
        apiService.getMe().then(res => {
            if (res.success && res.data) {
                setUser(res.data);
            }
        }).catch(err => console.error("Error loading user profile", err));
    };

    useEffect(() => {
        loadProfile();
        document.title = `Billing & Subscription ✦ ${siteConfig.name}`;

        // Detect redirects containing success flags
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("mock_success") === "true" || params.get("success") === "true") {
                setStatusMessage("Processing your checkout session...");
                const planParam = params.get("plan") || "pro";
                apiService.mockConfirmPayment(planParam)
                    .then(res => {
                        if (res.success) {
                            setStatusMessage(`Congratulations! Your account was successfully upgraded to ${planParam.charAt(0).toUpperCase() + planParam.slice(1).toLowerCase()}.`);
                            loadProfile();
                            // Clean the URL query params
                            window.history.replaceState({}, document.title, window.location.pathname);
                        } else {
                            setStatusMessage("Checkout confirmation failed. Please contact support.");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        setStatusMessage("Connection error while processing payment confirmation.");
                    });
            }
        }
    }, []);

    const handleConfirmSwitch = async () => {
        if (!confirmPlan) return;
        setConfirmOpen(false);
        const planName = confirmPlan;
        const isLower = isLowerPlan(planName);

        setLoading(true);
        if (isLower || planName === "Free") {
            try {
                const targetTier = planName === "Free" ? "free" : planName.toLowerCase();
                const res = await apiService.mockConfirmPayment(targetTier);
                if (res.success) {
                    setStatusMessage(`Plan switched to ${planName} successfully!`);
                    loadProfile();
                } else {
                    showAlertDialog("Failed to switch subscription plan.");
                }
            } catch (err: any) {
                console.error(err);
                showAlertDialog("An error occurred: " + (err.message || err));
            } finally {
                setLoading(false);
            }
        } else {
            // Upgrade flow
            try {
                const res = await apiService.checkout(planName);
                if (res.success && res.data?.checkout_url) {
                    window.location.href = res.data.checkout_url;
                } else {
                    showAlertDialog("Failed to initiate checkout session.");
                }
            } catch (err: any) {
                console.error(err);
                showAlertDialog("Checkout failed: " + (err.message || err));
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePlanChange = (planName: string) => {
        if (!user || loading) return;

        const isCurrent = isCurrentPlan(planName);
        if (isCurrent) return;

        setConfirmPlan(planName);
        setConfirmOpen(true);
    };

    const PLAN_ORDER: Record<string, number> = { "Free": 0, "Pro": 1, "Premium": 2 };
    const TIER_TO_PLAN: Record<string, string> = { "free": "Free", "default": "Free", "pro": "Pro", "premium": "Premium" };

    const getCurrentPlanName = () => {
        if (!user) return "Free";
        const tier = user.subscription_tier || "free";
        return TIER_TO_PLAN[tier] || "Free";
    };

    const isCurrentPlan = (planName: string) => {
        return getCurrentPlanName() === planName;
    };

    const isLowerPlan = (planName: string) => {
        const currentPlan = getCurrentPlanName();
        return (PLAN_ORDER[planName] ?? 0) < (PLAN_ORDER[currentPlan] ?? 0);
    };

    const getConfirmationMessage = () => {
        if (!confirmPlan) return "";
        const isLower = isLowerPlan(confirmPlan);
        if (isLower || confirmPlan === "Free") {
            return `Are you sure you want to switch to the ${confirmPlan} plan? You will keep your benefits till the end of the billing period.`;
        }
        return `Are you sure you want to switch to the ${confirmPlan} plan? Your access levels will be upgraded immediately.`;
    };

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

                    {statusMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-850 text-violet-850 dark:text-violet-200 text-sm font-semibold flex items-center justify-between">
                            <span>{statusMessage}</span>
                            <Button variant="ghost" size="sm" onClick={() => setStatusMessage(null)}>Dismiss</Button>
                        </div>
                    )}

                    {user?.pending_subscription_tier && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                            ⚠️ Downgrade to <strong>{user.pending_subscription_tier === "free" ? "Free" : user.pending_subscription_tier.charAt(0).toUpperCase() + user.pending_subscription_tier.slice(1)}</strong> has been scheduled. 
                            You will keep your <strong>{getCurrentPlanName()}</strong> benefits until <strong>{user.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : 'the end of your billing cycle'}</strong>.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, index) => {
                            const Icon = plan.icon;
                            const isCurrent = isCurrentPlan(plan.name);
                            const isLower = isLowerPlan(plan.name);
                            const isPending = user?.pending_subscription_tier === plan.name.toLowerCase() || (plan.name === "Free" && user?.pending_subscription_tier === "free");
                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={isCurrent ? "scale-[1.02]" : ""}
                                >
                                    <Card className={`h-full flex flex-col transition-all duration-300 relative ${
                                        isCurrent 
                                            ? 'border-violet-600 dark:border-violet-400 border-2 shadow-xl shadow-violet-500/10 ring-2 ring-violet-500/20 bg-violet-50/20 dark:bg-violet-950/5'
                                            : isPending
                                                ? 'border-amber-500 border-2 border-dashed shadow-md bg-amber-50/5 dark:bg-amber-950/5'
                                                : plan.popular 
                                                    ? 'border-violet-500 border border-violet-500/40' 
                                                    : ''
                                    }`}>
                                        {isCurrent ? (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                <Badge className="bg-violet-600 hover:bg-violet-600 text-white font-bold px-3 py-0.5 shadow-md flex items-center gap-1">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Current Plan
                                                </Badge>
                                            </div>
                                        ) : isPending ? (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-semibold px-3 py-0.5 shadow-md flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Switch Scheduled
                                                </Badge>
                                            </div>
                                        ) : plan.popular ? (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                <Badge className="bg-violet-500">Most Popular</Badge>
                                            </div>
                                        ) : null}
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
                                                className={`w-full font-semibold transition-all duration-300 ${
                                                    isCurrent 
                                                        ? 'bg-muted hover:bg-muted text-muted-foreground border cursor-default'
                                                        : isPending
                                                            ? 'bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200 border cursor-default dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                                            : plan.popular 
                                                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/60 border-0 ring-2 ring-violet-500/50' 
                                                                : ''
                                                }`} 
                                                variant={isCurrent || isPending ? "ghost" : plan.popular ? "default" : "outline"}
                                                disabled={isCurrent || isPending || loading || !user}
                                                onClick={() => handlePlanChange(plan.name)}
                                            >
                                                {!user ? (
                                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                ) : loading && !isCurrent ? (
                                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                ) : (
                                                    plan.popular && !isCurrent && <Zap className="w-4 h-4 mr-1.5 fill-white" />
                                                )}
                                                {!user 
                                                    ? "Loading..." 
                                                    : isCurrent 
                                                        ? "Current Plan" 
                                                        : isPending
                                                            ? "Downgrade Scheduled"
                                                            : isLower 
                                                                ? (plan.name === "Free" ? "Downgrade to Free" : `Switch to ${plan.name}`) 
                                                                : plan.cta}
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

            {/* Confirmation Dialog */}
            <ResponsiveDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Confirm Plan Change"
                description={getConfirmationMessage()}
                footer={
                    <div className="flex gap-2 w-full sm:justify-end">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} className="w-full sm:w-auto border">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSwitch} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-750 text-white font-semibold shadow-md">
                            Confirm Switch
                        </Button>
                    </div>
                }
            />

            {/* Alert Dialog */}
            <ResponsiveDialog
                open={alertOpen}
                onOpenChange={setAlertOpen}
                title="Notification"
                description={alertMsg}
                footer={
                    <div className="flex w-full sm:justify-end">
                        <Button onClick={() => setAlertOpen(false)} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-750 text-white font-semibold shadow-md">
                            OK
                        </Button>
                    </div>
                }
            />
        </div>
    );
}