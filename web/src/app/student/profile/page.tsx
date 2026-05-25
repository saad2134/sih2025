/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Mail,
    Phone,
    Calendar,
    Award,
    BookOpen,
    Target,
    Clock,
    Star,
    Edit,
    CreditCard,
    Zap,
    TrendingUp,
    Upload,
    Camera,
    HelpCircle
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { apiService } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUpload, { extractUploadcareUUID } from "@/components/uploadcare/avatar-upload";

const SPECIAL_CASES: { [key: string]: string } = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node.js": "Node.js",
    "react": "React",
    "graphql": "GraphQL",
    "sql": "SQL",
    "aws": "AWS",
    "git": "Git"
};

const formatSkillName = (name: string) => {
    if (!name) return "";
    const lowerName = name.toLowerCase().trim();
    if (SPECIAL_CASES[lowerName]) {
        return SPECIAL_CASES[lowerName];
    }
    return name
        .split(/[_\-\s]+/)
        .map(word => {
            const lowerWord = word.toLowerCase();
            if (SPECIAL_CASES[lowerWord]) {
                return SPECIAL_CASES[lowerWord];
            }
            if (["ai", "ml", "cv", "api", "nsqf", "html", "css"].includes(lowerWord)) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

const parsePriorKnowledge = (text: string) => {
    const phoneMatch = text?.match(/\[Phone:\s*([^\]]+)\]/);
    const streakMatch = text?.match(/\[Streak:\s*(\d+)\]/);
    const levelMatch = text?.match(/\[Level:\s*(\d+)\]/);
    const pointsMatch = text?.match(/\[Points:\s*(\d+)\]/);
    const rankMatch = text?.match(/\[Rank:\s*(\d+)\]/);
    
    return {
        phone: phoneMatch ? phoneMatch[1] : "+91 98765 43210",
        streak: streakMatch ? parseInt(streakMatch[1]) : 12,
        level: levelMatch ? parseInt(levelMatch[1]) : 8,
        points: pointsMatch ? parseInt(pointsMatch[1]) : 2450,
        rank: rankMatch ? parseInt(rankMatch[1]) : 100,
    };
};

const buildPriorKnowledge = (
    rawPrior: string,
    currentProfile: any,
    updates: {
        skills?: string;
        phone?: string;
        streak?: number;
        level?: number;
        points?: number;
        rank?: number;
    }
) => {
    const tags: { [key: string]: string } = {};
    const tagRegex = /\[([^:]+):\s*([^\]]+)\]/g;
    let match;
    while ((match = tagRegex.exec(rawPrior || "")) !== null) {
        tags[match[1].trim()] = match[2].trim();
    }

    // Clean up Location tag if it exists in database
    delete tags["Location"];

    if (!tags["Phone"]) tags["Phone"] = currentProfile.phone || "+91 98765 43210";
    if (!tags["Streak"]) tags["Streak"] = String(currentProfile.streak || 12);
    if (!tags["Level"]) tags["Level"] = String(currentProfile.level || 8);
    if (!tags["Points"]) tags["Points"] = String(currentProfile.points || 2450);
    if (!tags["Rank"]) tags["Rank"] = String(currentProfile.rank || 100);

    if (updates.phone !== undefined) tags["Phone"] = updates.phone;
    if (updates.streak !== undefined) tags["Streak"] = String(updates.streak);
    if (updates.level !== undefined) tags["Level"] = String(updates.level);
    if (updates.points !== undefined) tags["Points"] = String(updates.points);
    if (updates.rank !== undefined) tags["Rank"] = String(updates.rank);

    let skillsText = "";
    if (updates.skills !== undefined) {
        skillsText = updates.skills;
    } else {
        const cleanBase = (rawPrior || "").replace(/\[[^\]]+\]/g, "").trim().replace(/\.+\s*$/, "");
        skillsText = cleanBase;
        if (!skillsText) {
            skillsText = `Possesses skills: ${currentProfile.skills.filter((s: any) => s.certified).map((s: any) => s.name).join(", ")}`;
        }
    }

    const tagsString = Object.entries(tags)
        .map(([key, val]) => `[${key}: ${val}]`)
        .join(" ");

    return skillsText ? `${skillsText}. ${tagsString}` : tagsString;
};

function ResponsiveDialog({ open, onOpenChange, trigger, children, title, description, footer, className }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
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
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">{children}</div>
                    <DrawerFooter>
                        {footer}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={className}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
                <DialogFooter>
                    {footer}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const DEFAULT_PROFILE = {
    name: "Saad Mohammed",
    email: "saad.mohammed@example.com",
    phone: "+91 98765 43210",
    joinedDate: "January 2025",
    avatar: "SM",
    level: 8,
    points: 2450,
    rank: 100,
    streak: 12,

    education: {
        qualification: "Bachelor's Degree",
        field: "Computer Science",
        institution: "Mumbai University"
    },

    careerGoal: "Software Development",
    targetRoles: "Full Stack Developer, Backend Engineer",

    skills: [
        { name: "JavaScript", level: 75, certified: true },
        { name: "React", level: 65, certified: true },
        { name: "Python", level: 60, certified: false },
        { name: "Node.js", level: 55, certified: false },
        { name: "SQL", level: 50, certified: false },
        { name: "TypeScript", level: 45, certified: false },
        { name: "Docker", level: 40, certified: false },
        { name: "Git", level: 35, certified: false },
        { name: "AWS", level: 30, certified: false },
        { name: "GraphQL", level: 25, certified: false }
    ],

    interests: ["Web Development", "Data Science", "AI/ML", "Cloud Computing"],

    learningPreferences: {
        type: "Hands-on projects",
        style: "Self-paced",
        timeCommitment: "1-2 hours/day",
    },

    completedCourses: 5,
    inProgressCourses: 3,
    totalHoursLearned: 48,
    certificatesEarned: 4,

    activityLog: [
        { id: 1, action: "Completed module", target: "React Fundamentals", date: "Today, 2:30 PM", type: "course" },
        { id: 2, action: "Earned badge", target: "Fast Learner", date: "Yesterday", type: "achievement" },
        { id: 3, action: "Started course", target: "Python for Data Science", date: "Feb 10, 2025", type: "course" },
        { id: 4, action: "Completed quiz", target: "JavaScript Basics", date: "Feb 8, 2025", type: "quiz" },
    ],
    rawPriorKnowledge: "",
    subscription: "free",
    pending_subscription_tier: undefined as string | undefined,
    subscription_expires_at: undefined as string | undefined
};

export default function Profile() {
    const router = useRouter();
    const [isSmallScreen, setIsSmallScreen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [isPaidUser, setIsPaidUser] = React.useState(false);
    const [activityFilter, setActivityFilter] = React.useState("all");
    const [activitySort, setActivitySort] = React.useState("newest");
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
    
    const [userProfile, setUserProfile] = React.useState(DEFAULT_PROFILE);
    const [loading, setLoading] = React.useState(true);

    const [editForm, setEditForm] = React.useState({
        name: DEFAULT_PROFILE.name,
        email: DEFAULT_PROFILE.email,
        phone: DEFAULT_PROFILE.phone,
    });
    // Avatar state
    const [pendingAvatarUrl, setPendingAvatarUrl] = React.useState<string | null>(null);
    const [pendingAvatarUuid, setPendingAvatarUuid] = React.useState<string | null>(null);
    const [currentAvatarUrl, setCurrentAvatarUrl] = React.useState<string | null>(null);
    const [learningPrefsOpen, setLearningPrefsOpen] = React.useState(false);
    const [learningForm, setLearningForm] = React.useState({
        type: DEFAULT_PROFILE.learningPreferences.type,
        style: DEFAULT_PROFILE.learningPreferences.style,
        timeCommitment: DEFAULT_PROFILE.learningPreferences.timeCommitment,
    });
    const [careerGoalOpen, setCareerGoalOpen] = React.useState(false);
    const [careerError, setCareerError] = React.useState<string | null>(null);
    const [careerForm, setCareerForm] = React.useState({
        careerGoal: DEFAULT_PROFILE.careerGoal,
        targetRoles: DEFAULT_PROFILE.targetRoles,
    });
    const [interestsForm, setInterestsForm] = React.useState([...DEFAULT_PROFILE.interests]);
    const [skillsOpen, setSkillsOpen] = React.useState(false);
    const [skillsForm, setSkillsForm] = React.useState([...DEFAULT_PROFILE.skills]);
    const [skillsPage, setSkillsPage] = React.useState(1);
    const skillsPerPage = 10;

    const loadProfileData = async () => {
        try {
            const [meRes, learnerRes, skillGapRes, enrolledRes, statsRes] = await Promise.all([
                apiService.getMe().catch(() => ({ success: false, data: null })),
                apiService.getLearnerProfile().catch(() => ({ success: false, data: null })),
                apiService.getSkillGap().catch(() => ({ success: false, data: null })),
                apiService.getEnrolledCourses().catch(() => ({ success: false, data: null })),
                apiService.getUserStats().catch(() => ({ success: false, data: null }))
            ]);

            let name = "Student";
            let email = "student@example.com";
            let joinedDate = "January 2025";
            let createdAtRaw = "";
            let streak = 1;
            let level = 1;
            let points = 0;
            let rank = 1;
            let subscription = "free";

            if (meRes.success && meRes.data) {
                name = meRes.data.full_name || "Student";
                email = meRes.data.email || "";
                subscription = meRes.data.subscription_tier || "free";
                setIsPaidUser(subscription !== "free");
                setCurrentAvatarUrl(meRes.data.avatar_url ?? null);
                if (meRes.data.created_at) {
                    const date = new Date(meRes.data.created_at);
                    joinedDate = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                    createdAtRaw = meRes.data.created_at;
                }
            }

            // Use real stats from the backend
            if (statsRes.success && statsRes.data) {
                streak = statsRes.data.streak;
                rank = statsRes.data.rank;
                points = statsRes.data.points;
                level = statsRes.data.level;
            }

            let careerGoal = "Software Development";
            let targetRoles = "Full Stack Developer, Backend Engineer";
            let interests = ["Web Development", "Data Science", "AI/ML", "Cloud Computing"];
            let learningPreferences = {
                type: "Hands-on projects",
                style: "Self-paced",
                timeCommitment: "1-2 hours/day",
            };
            let phone = "+91 98765 43210";
            let priorKnowledgeText = "";

            if (learnerRes.success && learnerRes.data) {
                careerGoal = learnerRes.data.career_target || learnerRes.data.topic || "Software Development";
                targetRoles = learnerRes.data.goal || "Full Stack Developer, Backend Engineer";
                if (learnerRes.data.topic) {
                    interests = learnerRes.data.topic.split(",").map((s: string) => s.trim()).filter(Boolean);
                } else {
                    interests = ["Web Development"];
                }
                priorKnowledgeText = learnerRes.data.prior_knowledge || "";
                
                const parsed = parsePriorKnowledge(priorKnowledgeText);
                phone = parsed.phone;

                const stylePrefs = learnerRes.data.style_preferences || [];
                const typeVal = stylePrefs.includes("videos") ? "Videos" :
                                stylePrefs.includes("projects") ? "Hands-on projects" :
                                stylePrefs.includes("reading") ? "Articles" :
                                stylePrefs.includes("quizzes") ? "Quizzes" :
                                "Hands-on projects";
                const styleVal = stylePrefs.includes("guided") ? "Guided paths with deadlines" : "Self-paced";
                const hours = learnerRes.data.hours_per_week || 10;
                const commitment = hours <= 5 ? "Less than 1 hour/day" : hours <= 10 ? "1-2 hours/day" : hours <= 20 ? "2-5 hours/day" : "5+ hours/day";

                learningPreferences = {
                    type: typeVal,
                    style: styleVal,
                    timeCommitment: commitment,
                };
            }

            let skillsList = DEFAULT_PROFILE.skills.map(s => ({ ...s, name: formatSkillName(s.name) }));
            if (skillGapRes.success && skillGapRes.data) {
                const owned = skillGapRes.data.skills_owned || [];
                const required = skillGapRes.data.skills_required || [];
                
                skillsList = required.map(skill => {
                    const isOwned = owned.includes(skill);
                    return {
                        name: formatSkillName(skill),
                        level: isOwned ? 80 : 30,
                        certified: isOwned
                    };
                });

                if (priorKnowledgeText) {
                    const priorSkillsMatch = priorKnowledgeText.match(/Possesses skills:\s*([^.\[]+)/i);
                    if (priorSkillsMatch) {
                        const priorSkills = priorSkillsMatch[1].split(",").map(s => s.trim()).filter(Boolean);
                        priorSkills.forEach(skillName => {
                            const skillLower = skillName.toLowerCase();
                            const exists = skillsList.some(s => s.name.toLowerCase() === skillLower);
                            if (!exists) {
                                skillsList.push({
                                    name: formatSkillName(skillName),
                                    level: 80,
                                    certified: true
                                });
                            }
                        });
                    }
                }
            }

            let completedCourses = 0;
            let inProgressCourses = 0;
            let totalHoursLearned = 0;
            let certificatesEarned = 0;

            if (enrolledRes.success && enrolledRes.data) {
                const list = enrolledRes.data;
                completedCourses = list.filter(e => e.progress_pct >= 100).length;
                inProgressCourses = list.filter(e => e.progress_pct < 100).length;
                totalHoursLearned = list.reduce((sum, e) => sum + Math.round((e.progress_pct / 100) * (e.total_hours || 20)), 0);
                certificatesEarned = completedCourses;
            }

            const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "ST";

            const activityLog = [];
            let actId = 1;
            if (enrolledRes.success && enrolledRes.data) {
                for (const e of enrolledRes.data) {
                    if (e.progress_pct >= 100) {
                        const dateStr = e.completed_at 
                            ? new Date(e.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "Yesterday";
                        activityLog.push({
                            id: actId++,
                            action: "Completed course",
                            target: e.title,
                            date: dateStr,
                            type: "course"
                        });
                    } else {
                        const dateStr = e.enrolled_at 
                            ? new Date(e.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "Feb 10, 2025";
                        activityLog.push({
                            id: actId++,
                            action: "Started course",
                            target: e.title,
                            date: dateStr,
                            type: "course"
                        });
                    }
                }
            }

            // Add "Registered" activity entry using user's created_at
            if (createdAtRaw) {
                const registeredDate = new Date(createdAtRaw);
                activityLog.push({
                    id: actId++,
                    action: "Registered on ShikshaDisha",
                    target: "Account created",
                    date: registeredDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    type: "achievement"
                });
            }

            const updatedProfile = {
                name,
                email,
                phone,
                joinedDate,
                avatar: initials,
                level,
                points,
                rank,
                streak,
                education: {
                    qualification: "Bachelor's Degree",
                    field: "Computer Science",
                    institution: "Mumbai University"
                },
                careerGoal,
                targetRoles,
                skills: skillsList,
                interests,
                learningPreferences,
                completedCourses,
                inProgressCourses,
                totalHoursLearned,
                certificatesEarned,
                activityLog,
                rawPriorKnowledge: priorKnowledgeText,
                subscription,
                pending_subscription_tier: meRes.success && meRes.data ? meRes.data.pending_subscription_tier : undefined,
                subscription_expires_at: meRes.success && meRes.data ? meRes.data.subscription_expires_at : undefined
            };

            setUserProfile(updatedProfile);
            setEditForm({
                name,
                email,
                phone,
            });
            setLearningForm({
                type: learningPreferences.type,
                style: learningPreferences.style,
                timeCommitment: learningPreferences.timeCommitment
            });
            setCareerForm({
                careerGoal,
                targetRoles
            });
            setInterestsForm([...interests]);
            setSkillsForm([...skillsList]);

        } catch (err) {
            console.error("Failed to load profile details", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = `Profile ✦ ${siteConfig.name}`;
        loadProfileData();
    }, []);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Synchronize edit form states when dialogs open to prevent using dirty/stale inputs
    useEffect(() => {
        if (learningPrefsOpen && userProfile.learningPreferences) {
            setLearningForm({
                type: userProfile.learningPreferences.type,
                style: userProfile.learningPreferences.style,
                timeCommitment: userProfile.learningPreferences.timeCommitment
            });
        }
    }, [learningPrefsOpen, userProfile]);

    useEffect(() => {
        if (editDialogOpen) {
            setEditForm({
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone,
            });
        }
    }, [editDialogOpen, userProfile]);

    useEffect(() => {
        if (careerGoalOpen) {
            setCareerForm({
                careerGoal: userProfile.careerGoal,
                targetRoles: userProfile.targetRoles,
            });
            setInterestsForm([...userProfile.interests]);
            setCareerError(null);
        }
    }, [careerGoalOpen, userProfile]);

    useEffect(() => {
        if (skillsOpen) {
            setSkillsForm([...userProfile.skills]);
        }
    }, [skillsOpen, userProfile]);


    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const priorKnowledge = buildPriorKnowledge(
                userProfile.rawPriorKnowledge,
                userProfile,
                {
                    phone: editForm.phone,
                }
            );
            
            await apiService.updateLearnerProfile({
                full_name: editForm.name,
                prior_knowledge: priorKnowledge
            });

            // Persist avatar if a new one was uploaded
            if (pendingAvatarUrl && pendingAvatarUuid) {
                const oldUuid = currentAvatarUrl ? extractUploadcareUUID(currentAvatarUrl) : undefined;
                await apiService.updateAvatar(pendingAvatarUrl, oldUuid ?? undefined);
                setCurrentAvatarUrl(pendingAvatarUrl);
                setPendingAvatarUrl(null);
                setPendingAvatarUuid(null);
            }

            await loadProfileData();
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setEditDialogOpen(false);
            setLoading(false);
        }
    };

    const handleSaveLearningPrefs = async () => {
        setLoading(true);
        try {
            const stylePrefs = [];
            if (learningForm.type === "Videos") stylePrefs.push("videos");
            else if (learningForm.type === "Hands-on projects") stylePrefs.push("projects");
            else if (learningForm.type === "Articles") stylePrefs.push("reading");
            else if (learningForm.type === "Quizzes") stylePrefs.push("quizzes");

            if (learningForm.style === "Guided paths with deadlines") stylePrefs.push("guided");
            else stylePrefs.push("selfPaced");

            let hours = 10;
            if (learningForm.timeCommitment.includes("<1") || learningForm.timeCommitment.includes("Less than")) hours = 5;
            else if (learningForm.timeCommitment.includes("1-2")) hours = 10;
            else if (learningForm.timeCommitment.includes("2-5")) hours = 20;
            else if (learningForm.timeCommitment.includes("5+")) hours = 35;

            await apiService.updateLearnerProfile({
                style_preferences: stylePrefs,
                hours_per_week: hours
            });
            await loadProfileData();
        } catch (err) {
            console.error("Failed to save learning preferences", err);
        } finally {
            setLearningPrefsOpen(false);
            setLoading(false);
        }
    };

    const handleSaveCareerGoal = async () => {
        setLoading(true);
        setCareerError(null);
        try {
            await apiService.updateLearnerProfile({
                career_target: careerForm.careerGoal,
                goal: careerForm.targetRoles,
                topic: interestsForm.join(", ")
            });
            await loadProfileData();
            setCareerGoalOpen(false);
        } catch (err: any) {
            console.error("Failed to save career goals", err);
            setCareerError(err.message || "Failed to save career goals");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSkills = async () => {
        setLoading(true);
        try {
            const skillsText = skillsForm.map(s => s.name).filter(Boolean).join(", ");
            const priorKnowledge = buildPriorKnowledge(
                userProfile.rawPriorKnowledge,
                userProfile,
                {
                    skills: `Possesses skills: ${skillsText}`
                }
            );

            await apiService.updateLearnerProfile({
                prior_knowledge: priorKnowledge
            });
            await loadProfileData();
        } catch (err) {
            console.error("Failed to save skills", err);
        } finally {
            setSkillsOpen(false);
            setLoading(false);
        }
    };

    const handleRemoveAvatar = () => {
        setPendingAvatarUrl(null);
        setPendingAvatarUuid(null);
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "course": return BookOpen;
            case "achievement": return Award;
            case "quiz": return Star;
            default: return Clock;
        }
    };

    const filteredActivities = React.useMemo(() => {
        let filtered = [...userProfile.activityLog];
        if (activityFilter !== "all") {
            filtered = filtered.filter(a => a.type === activityFilter);
        }
        if (activitySort === "newest") {
            filtered.reverse();
        }
        return filtered;
    }, [activityFilter, activitySort, userProfile.activityLog]);

    const paginatedActivities = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredActivities.slice(start, start + itemsPerPage);
    }, [filteredActivities, currentPage]);

    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader className="space-y-2">
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 space-y-3">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="h-full">
                                    <CardHeader className="pb-2 relative">
                                        <ResponsiveDialog
                                            open={editDialogOpen}
                                            onOpenChange={setEditDialogOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Profile"
                                            description="Update your personal information and career goals."
                                            className="sm:max-w-[500px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveProfile}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4">
                                                <div className="flex flex-col items-center gap-3">
                                                    <AvatarUpload
                                                        currentUrl={pendingAvatarUrl ?? currentAvatarUrl}
                                                        initials={userProfile.avatar}
                                                        onUploadComplete={(url, uuid) => {
                                                            setPendingAvatarUrl(url);
                                                            setPendingAvatarUuid(uuid);
                                                        }}
                                                        onRemove={handleRemoveAvatar}
                                                        size={96}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    />
                                                </div>

                                            </div>
                                        </ResponsiveDialog>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl font-bold text-violet-600 shrink-0 overflow-hidden border-2 border-border">
                                                {currentAvatarUrl ? (
                                                    <img src={currentAvatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    userProfile.avatar
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span>Level {userProfile.level} • {userProfile.points.toLocaleString()} pts</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30">
                                                #{userProfile.rank} Rank
                                            </Badge>
                                            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30">
                                                🔥 {userProfile.streak} day streak
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 pt-3 border-t text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="truncate">{userProfile.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>{userProfile.phone}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Joined {userProfile.joinedDate}</span>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                            >
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            Billing & Subscription
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 text-xs">
                                                    Current Plan: {userProfile.subscription && userProfile.subscription !== "free" ? userProfile.subscription.charAt(0).toUpperCase() + userProfile.subscription.slice(1) : "Free"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {isPaidUser
                                                    ? `You're on the ${userProfile.subscription && userProfile.subscription !== "free" ? userProfile.subscription.charAt(0).toUpperCase() + userProfile.subscription.slice(1) : "Pro"} plan. Thank you for your support!`
                                                    : "You're on the free plan. Upgrade to unlock all features!"}
                                            </p>
                                            {userProfile.pending_subscription_tier && (
                                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold border-t pt-2 border-amber-500/20">
                                                    ⚠️ Downgrade to {userProfile.pending_subscription_tier.charAt(0).toUpperCase() + userProfile.pending_subscription_tier.slice(1)} scheduled for {userProfile.subscription_expires_at ? new Date(userProfile.subscription_expires_at).toLocaleDateString() : 'period end'}.
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            className={`w-full font-semibold transition-all duration-300 ${!isPaidUser ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 animate-shine' : ''}`}
                                            variant={isPaidUser ? "outline" : "default"}
                                            onClick={() => router.push("/student/billing")}
                                        >
                                            <Zap className={`w-4 h-4 mr-1.5 ${!isPaidUser ? 'fill-white' : ''}`} />
                                            {isPaidUser ? "Manage Billing" : "Upgrade Now"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card>
                                    <CardHeader className="pb-3 relative">
                                        <ResponsiveDialog
                                            open={learningPrefsOpen}
                                            onOpenChange={setLearningPrefsOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Learning Preferences"
                                            description="Update your learning preferences."
                                            className="sm:max-w-[400px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setLearningPrefsOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveLearningPrefs}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Learning Type</Label>
                                                    <Select
                                                        value={learningForm.type}
                                                        onValueChange={(value) => setLearningForm({ ...learningForm, type: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Videos">Videos</SelectItem>
                                                            <SelectItem value="Hands-on projects">Hands-on projects</SelectItem>
                                                            <SelectItem value="Articles">Articles</SelectItem>
                                                            <SelectItem value="Quizzes">Quizzes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Learning Style</Label>
                                                    <Select
                                                        value={learningForm.style}
                                                        onValueChange={(value) => setLearningForm({ ...learningForm, style: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Guided paths with deadlines">Guided paths with deadlines</SelectItem>
                                                            <SelectItem value="Self-paced">Self-paced learning</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Time Commitment</Label>
                                                    <Select
                                                        value={learningForm.timeCommitment}
                                                        onValueChange={(value) => setLearningForm({ ...learningForm, timeCommitment: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Less than 1 hour/day">&lt;1 hour/day</SelectItem>
                                                            <SelectItem value="1-2 hours/day">1-2 hours/day</SelectItem>
                                                            <SelectItem value="2-5 hours/day">2-5 hours/day</SelectItem>
                                                            <SelectItem value="5+ hours/day">5+ hours/day</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </ResponsiveDialog>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <BookOpen className="w-5 h-5 text-violet-500" />
                                            Learning Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Type</span>
                                            <span className="text-right">{userProfile.learningPreferences.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Style</span>
                                            <span className="text-right">{userProfile.learningPreferences.style}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Time</span>
                                            <span className="text-right">{userProfile.learningPreferences.timeCommitment}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                            >
                                <Card className="h-full">
                                    <CardHeader className="pb-3 relative">
                                        <ResponsiveDialog
                                            open={skillsOpen}
                                            onOpenChange={setSkillsOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Skills"
                                            description="Add or remove skills and their proficiency levels."
                                            className="sm:max-w-[500px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setSkillsOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveSkills}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
                                                {skillsForm.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input
                                                            value={skill.name}
                                                            onChange={(e) => {
                                                                const newSkills = [...skillsForm];
                                                                newSkills[index] = { ...skill, name: e.target.value };
                                                                setSkillsForm(newSkills);
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={skill.level}
                                                            onChange={(e) => {
                                                                const newSkills = [...skillsForm];
                                                                newSkills[index] = { ...skill, level: parseInt(e.target.value) || 0 };
                                                                setSkillsForm(newSkills);
                                                            }}
                                                            className="w-16"
                                                            min={0}
                                                            max={100}
                                                        />
                                                        <Checkbox
                                                            checked={skill.certified}
                                                            onCheckedChange={(checked) => {
                                                                const newSkills = [...skillsForm];
                                                                newSkills[index] = { ...skill, certified: checked as boolean };
                                                                setSkillsForm(newSkills);
                                                            }}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSkillsForm(skillsForm.filter((_, i) => i !== index))}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSkillsForm([...skillsForm, { name: "", level: 0, certified: false }])}
                                                >
                                                    + Add Skill
                                                </Button>
                                            </div>
                                        </ResponsiveDialog>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <BookOpen className="w-5 h-5 text-blue-500" />
                                            Skills
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="min-h-[220px] flex flex-col justify-between">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                            {userProfile.skills
                                                .slice((skillsPage - 1) * skillsPerPage, skillsPage * skillsPerPage)
                                                .map((skill) => (
                                                <div key={skill.name} className="flex items-center gap-1">
                                                    <span className="text-sm w-20 truncate">{skill.name}</span>
                                                    <Progress value={skill.level} className="flex-1 h-2" />
                                                    <span className="text-xs text-muted-foreground w-7">{skill.level}%</span>
                                                    {skill.certified ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Award className="w-4 h-4 text-amber-500 cursor-help shrink-0" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Certified / Course completed</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help shrink-0" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Self-proclaimed skill</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {userProfile.skills.length > skillsPerPage && (
                                            <div className="flex items-center justify-between pt-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSkillsPage(p => Math.max(1, p - 1))}
                                                    disabled={skillsPage === 1}
                                                >
                                                    Prev
                                                </Button>
                                                <span className="text-xs text-muted-foreground">
                                                    {skillsPage} / {Math.ceil(userProfile.skills.length / skillsPerPage)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSkillsPage(p => Math.min(Math.ceil(userProfile.skills.length / skillsPerPage), p + 1))}
                                                    disabled={skillsPage >= Math.ceil(userProfile.skills.length / skillsPerPage)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card className="h-full">
                                    <div className="relative">
                                        <ResponsiveDialog
                                            open={careerGoalOpen}
                                            onOpenChange={setCareerGoalOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border z-10">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Career Goals & Interests"
                                            description="Update your career goals and interests."
                                            className="sm:max-w-[450px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setCareerGoalOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveCareerGoal}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4">
                                                {careerError && (
                                                    <div className="p-3 text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                                                        ⚠️ {careerError}
                                                    </div>
                                                )}
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium">Career Goal</Label>
                                                    <div className="grid gap-2">
                                                        <Label className="text-xs text-muted-foreground">Domain</Label>
                                                        <Input
                                                            value={careerForm.careerGoal}
                                                            onChange={(e) => setCareerForm({ ...careerForm, careerGoal: e.target.value })}
                                                            placeholder="e.g., Software Development"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label className="text-xs text-muted-foreground">Targets</Label>
                                                        <Input
                                                            value={careerForm.targetRoles}
                                                            onChange={(e) => setCareerForm({ ...careerForm, targetRoles: e.target.value })}
                                                            placeholder="e.g., Full Stack Developer, Backend Engineer"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 pt-2">
                                                    <Label className="text-sm font-medium">Interests</Label>
                                                    {interestsForm.map((interest, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <Input
                                                                value={interest}
                                                                onChange={(e) => {
                                                                    const newInterests = [...interestsForm];
                                                                    newInterests[index] = e.target.value;
                                                                    setInterestsForm(newInterests);
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setInterestsForm(interestsForm.filter((_, i) => i !== index))}
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setInterestsForm([...interestsForm, ""])}
                                                    >
                                                        + Add Interest
                                                    </Button>
                                                </div>
                                            </div>
                                        </ResponsiveDialog>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Target className="w-5 h-5 text-violet-500" />
                                                Career Goal
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Domain</span>
                                                <span className="text-right">{userProfile.careerGoal}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Targets</span>
                                                <span className="text-right">{userProfile.targetRoles}</span>
                                            </div>
                                        </CardContent>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Star className="w-5 h-5 text-pink-500" />
                                                Interests
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {userProfile.interests.map((interest) => (
                                                    <Badge key={interest} variant="secondary">
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="text-primary" size={20} />
                                            Learning Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-primary">{userProfile.completedCourses}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-blue-500">{userProfile.inProgressCourses}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">In Progress</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-green-500">{userProfile.totalHoursLearned}h</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Hours Learned</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-amber-500">{userProfile.certificatesEarned}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Certificates</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-violet-500" />
                                            Recent Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2 mb-4">
                                            <select
                                                value={activityFilter}
                                                onChange={(e) => { setActivityFilter(e.target.value); setCurrentPage(1); }}
                                                className="text-xs border rounded-md px-2 py-1 bg-background"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="course">Courses</option>
                                                <option value="achievement">Achievements</option>
                                                <option value="quiz">Quizzes</option>
                                            </select>
                                            <select
                                                value={activitySort}
                                                onChange={(e) => { setActivitySort(e.target.value); setCurrentPage(1); }}
                                                className="text-xs border rounded-md px-2 py-1 bg-background"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            {paginatedActivities.map((activity, index) => {
                                                const Icon = getActivityIcon(activity.type);
                                                return (
                                                    <motion.div
                                                        key={activity.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                                            <Icon className="w-4 h-4 text-violet-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{activity.action}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{activity.target}</p>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground shrink-0">{activity.date}</span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-xs text-muted-foreground">
                                                    Page {currentPage} of {totalPages}
                                                </p>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="h-7 px-2"
                                                    >
                                                        Prev
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="h-7 px-2"
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
