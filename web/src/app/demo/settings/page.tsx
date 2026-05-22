"use client";

import * as React from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Shield, Bell, Zap, CheckCircle, XCircle, Settings as SettingsIcon, Globe, Eye, Zap as ZapIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { siteConfig } from "@/config/site";

const settingsSections = [
    {
        id: "app",
        title: "App Settings",
        icon: SettingsIcon,
        settings: [
            { id: "language", label: "Language", description: "Select your preferred language", type: "select", options: ["English"] },
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

export default function Settings() {
    const [settings, setSettings] = React.useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        settingsSections.forEach((section) => {
            section.settings.forEach((setting) => {
                if ('defaultValue' in setting) {
                    initial[setting.id] = setting.defaultValue as boolean;
                }
            });
        });
        return initial;
    });
    const [language, setLanguage] = React.useState("English");

    useEffect(() => {
        document.title = `Settings ✦ ${siteConfig.name}`;
    }, []);

    const toggleSetting = (settingId: string) => {
        setSettings((prev) => ({ ...prev, [settingId]: !prev[settingId] }));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
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
                                                const isSelect = 'type' in setting && setting.type === 'select';
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
                                                            <Select value={language} onValueChange={setLanguage}>
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
                                                                <span className={`text-xs font-medium ${settings[setting.id] ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                    {settings[setting.id] ? 'On' : 'Off'}
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
            </div>
        </div>
    );
}