"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { apiService } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verifying your transaction with Polar.sh...");
    const verifiedRef = useRef(false);

    useEffect(() => {
        if (verifiedRef.current) return;
        verifiedRef.current = true;

        const checkoutId = searchParams.get("checkout_id");
        const customerSessionToken = searchParams.get("customer_session_token") || undefined;

        if (!checkoutId) {
            setStatus("error");
            setMessage("Missing checkout_id from the redirect parameters.");
            return;
        }

        apiService.confirmCheckout(checkoutId, customerSessionToken)
            .then((res) => {
                if (res.success) {
                    setStatus("success");
                    setMessage(res.data?.message || "Your subscription has been updated successfully.");
                    // Redirect to billing page after 3 seconds
                    setTimeout(() => {
                        router.push("/student/billing");
                    }, 3000);
                } else {
                    setStatus("error");
                    setMessage(res.error?.message || "Failed to confirm payment details.");
                }
            })
            .catch((err) => {
                console.error("Error confirming checkout:", err);
                setStatus("error");
                setMessage("Connection error while confirming payment.");
            });
    }, [searchParams, router]);

    return (
        <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh] bg-background">
            <Card className="w-full max-w-md border border-border shadow-2xl relative overflow-hidden bg-card/60 backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-purple-600 animate-pulse" />
                <CardContent className="pt-8 pb-10 text-center flex flex-col items-center gap-6">
                    {status === "verifying" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center animate-spin">
                                <Loader2 className="w-8 h-8 text-violet-500" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Verifying Payment</h2>
                            <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
                        </>
                    )}

                    {status === "success" && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">Payment Successful!</h2>
                            <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
                            <span className="text-xs text-muted-foreground animate-pulse">Redirecting you to billing page...</span>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">Verification Failed</h2>
                            <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
                            <Button
                                className="w-full mt-2"
                                onClick={() => router.push("/student/billing")}
                            >
                                Return to Billing
                            </Button>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
