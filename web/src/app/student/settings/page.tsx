"use client";

import * as React from "react";
import { useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Shield, Bell, Zap, Settings as SettingsIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000";

const settingsSections = [
    {
        id: "app",
        title: "App Settings",
        icon: SettingsIcon,
        settings: [
            { id: "language", label: "Language", description: "Select your preferred language", type: "select", options: ["English", "Hindi (हिन्दी)", "Marathi (मराठी)", "Telugu (తెలుగు)", "Tamil (தமிழ்)", "Kannada (ಕನ್ನಡ)"] },
            { id: "high-contrast", label: "High Contrast", description: "Increase contrast for better visibility", defaultValue: false },
            { id: "low-animations", label: "Low Animations", description: "Reduce motion effects", defaultValue: false },
        ],
    },
    {
        id: "privacy",
        title: "Privacy Options",
        icon: Shield,
        settings: [
            { id: "profile-visibility", label: "Profile Visibility", description: "Control who can view your profile", defaultValue: true },
            { id: "activity-status", label: "Activity Status", description: "Show when you're online on your profile", defaultValue: true },
            { id: "data-usage", label: "Allow Data Use for Platform Improvement", description: "Allow us to use your data to improve our platform", defaultValue: true },
        ],
    },
    {
        id: "notifications",
        title: "Notification Settings",
        icon: Bell,
        settings: [
            { id: "course-updates", label: "Course Updates", description: "Get notified about course content", defaultValue: true },
            { id: "achievement-alerts", label: "Achievement Alerts", description: "Notify when you earn badges", defaultValue: true },
            { id: "email-notifications", label: "Email Notifications", description: "Receive updates via email", defaultValue: true },
            { id: "reminder-notifications", label: "Reminder Notifications", description: "Daily learning reminders", defaultValue: true },
        ],
    },
    {
        id: "other",
        title: "Other Settings",
        icon: Zap,
        settings: [
            { id: "data-saver", label: "Data Saver Mode", description: "Reduce data usage", defaultValue: false },
            { id: "compact-view", label: "Compact View", description: "Show more content with less spacing", defaultValue: false },
        ],
    },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

async function fetchSettings(): Promise<Record<string, boolean | string> | null> {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return null;
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/settings`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) return null;
        const body = await res.json();
        return body?.data?.settings ?? null;
    } catch {
        return null;
    }
}

async function persistSettings(patch: Record<string, boolean | string>): Promise<boolean> {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return false;
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/settings`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ settings: patch }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export default function Settings() {
    const [settings, setSettings] = React.useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        settingsSections.forEach((section) => {
            section.settings.forEach((setting) => {
                if ("defaultValue" in setting) {
                    initial[setting.id] = setting.defaultValue as boolean;
                }
            });
        });
        return initial;
    });
    const [language, setLanguage] = React.useState("English");
    const [isMounted, setIsMounted] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        document.title = `Settings ✦ ${siteConfig.name}`;

        // Load from localStorage first (fast initial render), then sync from API
        const savedSettings = localStorage.getItem("app_settings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings((prev) => ({ ...prev, ...parsed }));
            } catch (_) {}
        }
        const savedLang = localStorage.getItem("app_language");
        if (savedLang) setLanguage(savedLang);
        setIsMounted(true);

        // Hydrate from backend
        fetchSettings().then((remote) => {
            if (remote) {
                const { language: remoteLang, ...booleans } = remote as Record<string, boolean | string>;
                if (remoteLang) {
                    setLanguage(remoteLang as string);
                    localStorage.setItem("app_language", remoteLang as string);
                }
                setSettings((prev) => {
                    const merged = { ...prev, ...(booleans as Record<string, boolean>) };
                    localStorage.setItem("app_settings", JSON.stringify(merged));
                    return merged;
                });
            }
        });
    }, []);

    // Debounced save — fires 600 ms after the last change
    const scheduleSave = useCallback((patch: Record<string, boolean | string>) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setSaveStatus("saving");
        saveTimerRef.current = setTimeout(async () => {
            const ok = await persistSettings(patch);
            setSaveStatus(ok ? "saved" : "error");
            if (ok) {
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        }, 600);
    }, []);

    const toggleSetting = (settingId: string) => {
        const nextValue = !settings[settingId];
        const nextSettings = { ...settings, [settingId]: nextValue };
        setSettings(nextSettings);
        // Keep localStorage as fallback / instant persistence
        localStorage.setItem("app_settings", JSON.stringify(nextSettings));
        scheduleSave({ ...nextSettings, language });
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        localStorage.setItem("app_language", newLang);
        scheduleSave({ ...settings, language: newLang });
    };

    const statusIndicator = (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity duration-200">
            {saveStatus === "saving" && (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving…</span>
                </>
            )}
            {saveStatus === "saved" && (
                <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500">Saved</span>
                </>
            )}
            {saveStatus === "error" && (
                <span className="text-red-400">Could not save — check your connection</span>
            )}
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header row with save status */}
                {isMounted && (
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-semibold">Settings</h1>
                        {statusIndicator}
                    </div>
                )}

                {!isMounted ? (
                    <div className="space-y-6">
                        {settingsSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <Card key={section.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Icon className="w-5 h-5 text-violet-500" />
                                            {section.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Configure your {section.title.toLowerCase()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {section.settings.map((setting) => (
                                            <div
                                                key={setting.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex-1 pr-4">
                                                    <p className="font-medium">{setting.label}</p>
                                                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {setting.id === "language" ? (
                                                        <Skeleton className="h-9 w-32" />
                                                    ) : (
                                                        <>
                                                            <Skeleton className="h-4 w-8" />
                                                            <Skeleton className="h-6 w-11 rounded-full" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="space-y-6">
                            {settingsSections.map((section, sectionIndex) => {
                                const Icon = section.icon;
                                return (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Icon className="w-5 h-5 text-violet-500" />
                                                    {section.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    Configure your {section.title.toLowerCase()}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {section.settings.map((setting) => {
                                                    const isSelect = "type" in setting && setting.type === "select";
                                                    return (
                                                        <div
                                                            key={setting.id}
                                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex-1 pr-4">
                                                                <p className="font-medium">{setting.label}</p>
                                                                <p className="text-sm text-muted-foreground">{setting.description}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {isSelect ? (
                                                                    <Select value={language} onValueChange={handleLanguageChange}>
                                                                        <SelectTrigger className="w-32">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(setting as { options: string[] }).options.map((opt) => (
                                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <>
                                                                        <span className={`text-xs font-medium ${settings[setting.id] ? "text-primary" : "text-muted-foreground"}`}>
                                                                            {settings[setting.id] ? "On" : "Off"}
                                                                        </span>
                                                                        <Switch
                                                                            checked={settings[setting.id]}
                                                                            onCheckedChange={() => toggleSetting(setting.id)}
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}