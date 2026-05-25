/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    MapPin,
    TrendingUp,
    Star,
    ChevronRight,
    Users,
    Award,
    Briefcase,
    MessageSquare,
    Trophy,
    BarChart3,
    Sparkles,
    Clock,
    Moon,
    Sunrise,
    Sun,
    Sunset,
    Target,
    BookOpen,
    Flame,
    Brain,
    Zap
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/api";

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

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [courses, setCourses] = React.useState<any[]>([]);
    const [enrolledCourses, setEnrolledCourses] = React.useState<any[]>([]);
    const [skillGap, setSkillGap] = React.useState<any>(null);
    const [careerScore, setCareerScore] = React.useState<any>(null);
    const [userData, setUserData] = React.useState({
        name: "Student",
        education: "Bachelor's Degree",
        careerGoal: "Software Development",
        targetRoles: "Full Stack Developer",
        skillLevel: "Beginner",
        progress: 25,
        learningPace: "1-2 hours/day",
        prefType: "Hands-on",
        prefStyle: "Self-paced",
        interests: ["Web Development"]
    });

    useEffect(() => {
        document.title = `Dashboard ✦ ${siteConfig.name}`;
        
        const checkOnboarding = async () => {
            setLoading(true);
            try {
                const meRes = await apiService.getMe();
                if (!meRes.success || !meRes.data || !meRes.data.onboarding_done) {
                    router.push("/student/onboarding");
                    return;
                }
                loadDashboard(meRes.data.full_name || "Student");
                return;
            } catch {
                router.push("/student/onboarding");
                return;
            }
        };
        
        const loadDashboard = async (userName: string) => {
            try {
                const [profileRes, recsRes, skillGapRes, careerScoreRes, enrolledRes] = await Promise.all([
                    apiService.getLearnerProfile().catch(() => ({ success: false, data: null })),
                    apiService.getRecommendations(3, 0).catch(() => ({ success: false, data: null })),
                    apiService.getSkillGap().catch(() => ({ success: false, data: null })),
                    apiService.getCareerScore().catch(() => ({ success: false, data: null })),
                    apiService.getEnrolledCourses().catch(() => ({ success: false, data: null }))
                ]);

                let name = userName;
                let careerGoal = "Software Development";
                let targetRoles = "Full Stack Developer";
                let hours = "1-2 hours/day";
                let mathLevel = "Beginner";
                let prefType = "Hands-on";
                let prefStyle = "Self-paced";
                let interestsList: string[] = ["Web Development"];
                
                if (profileRes.success && profileRes.data) {
                    careerGoal = profileRes.data.career_target || profileRes.data.topic || "Software Development";
                    targetRoles = profileRes.data.goal || "Full Stack Developer";
                    hours = `${profileRes.data.hours_per_week} hours/week`;
                    
                    const stylePrefs = profileRes.data.style_preferences || [];
                    prefType = stylePrefs.includes("videos") ? "Videos" : 
                               stylePrefs.includes("projects") ? "Hands-on" : 
                               stylePrefs.includes("reading") ? "Articles" : 
                               stylePrefs.includes("quizzes") ? "Quizzes" : 
                               "Hands-on";
                    
                    prefStyle = stylePrefs.includes("guided") ? "Guided" : "Self-paced";

                    if (profileRes.data.topic) {
                        interestsList = profileRes.data.topic.split(",").map((s: string) => s.trim()).filter(Boolean);
                    }

                    if (profileRes.data.math_comfort >= 4) {
                        mathLevel = "Advanced";
                    } else if (profileRes.data.math_comfort >= 3) {
                        mathLevel = "Intermediate";
                    } else {
                        mathLevel = "Beginner";
                    }
                }

                let progress = 25;
                if (skillGapRes.success && skillGapRes.data) {
                    progress = skillGapRes.data.gap_percentage;
                    setSkillGap(skillGapRes.data);
                }
                
                if (careerScoreRes.success && careerScoreRes.data) {
                    setCareerScore(careerScoreRes.data);
                }
                
                if (enrolledRes.success && enrolledRes.data) {
                    setEnrolledCourses(enrolledRes.data);
                }
                
                setUserData({
                    name,
                    education: "Bachelor's Degree",
                    careerGoal,
                    targetRoles,
                    skillLevel: mathLevel,
                    progress,
                    learningPace: hours,
                    prefType,
                    prefStyle,
                    interests: interestsList
                });

                if (recsRes.success && recsRes.data && recsRes.data.items) {
                    setCourses(recsRes.data.items);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        checkOnboarding();
    }, []);

    const recommendedCourses = [
        {
            id: 1,
            title: "Web Development Fundamentals",
            provider: "NSQF Level 4",
            duration: "6 weeks",
            level: "Beginner",
            match: 95,
            type: "course"
        },
        {
            id: 2,
            title: "Python Programming Basics",
            provider: "Skill India",
            duration: "4 weeks",
            level: "Beginner",
            match: 88,
            type: "course"
        }
    ];

    const getDynamicMilestones = () => {
        const list = [];
        // Step 1: Onboarding
        list.push({
            id: 1,
            title: "Profile Setup",
            status: "completed",
            description: "Basic preferences & goals collected"
        });

        // Step 2: Course Enrollment
        const enrolledCount = enrolledCourses.length;
        if (enrolledCount > 0) {
            list.push({
                id: 2,
                title: "First Enrollment",
                status: "completed",
                description: `Enrolled in "${enrolledCourses[0].title}"`
            });
        } else {
            list.push({
                id: 2,
                title: "Course Enrollment",
                status: "current",
                description: "Enroll in a recommended course to start"
            });
        }

        // Step 3: Skill Development
        const ownedCount = skillGap?.skills_owned?.length || 0;
        const reqCount = skillGap?.skills_required?.length || 5;
        const skillStatus = enrolledCount === 0 ? "upcoming" : (ownedCount >= reqCount ? "completed" : "current");
        list.push({
            id: 3,
            title: "Core Skill Mastery",
            status: skillStatus,
            description: ownedCount > 0 ? `Mastered ${ownedCount} of ${reqCount} key skills` : "Develop foundational domain skills"
        });

        // Step 4: Practical Projects / Internship
        const progressVal = skillGap?.gap_percentage || 0;
        const projectStatus = progressVal >= 80 ? "completed" : (progressVal >= 40 ? "current" : "upcoming");
        list.push({
            id: 4,
            title: "Internship & Projects",
            status: projectStatus,
            description: "Gain hands-on practical project experience"
        });

        // Step 5: Placement Ready
        const jobStatus = progressVal >= 100 ? "completed" : "upcoming";
        list.push({
            id: 5,
            title: "Job Readiness",
            status: jobStatus,
            description: progressVal >= 100 ? "Ready to apply for jobs!" : "Final assessment & portfolio review"
        });

        return list;
    };
    const milestones = getDynamicMilestones();

    const getWeeksLeft = () => {
        if (enrolledCourses.length > 0) {
            const activeCourses = enrolledCourses.filter(e => e.progress_pct < 100);
            if (activeCourses.length > 0) {
                return activeCourses.reduce((sum, e) => {
                    const total = e.total_hours ? Math.round(e.total_hours / 10) : 6;
                    const remaining = Math.max(1, Math.round(total * (1 - e.progress_pct / 100)));
                    return sum + remaining;
                }, 0);
            }
        }
        if (skillGap && skillGap.gap?.length > 0) {
            return skillGap.gap.length * 2;
        }
        return 12;
    };
    const weeksLeft = getWeeksLeft();

    const getParsedInterests = () => {
        const list: string[] = [];
        if (userData.careerGoal && userData.careerGoal !== "Software Development" && userData.careerGoal !== "Student") {
            list.push(userData.careerGoal);
        }
        if (skillGap?.career_target && !list.includes(skillGap.career_target)) {
            list.push(skillGap.career_target);
        }
        if (skillGap?.skills_required?.length) {
            list.push(...skillGap.skills_required.slice(0, 2));
        }
        if (list.length === 0) {
            return ["Web Dev", "Software Dev", "Problem Solving"];
        }
        return Array.from(new Set(list)).slice(0, 4);
    };
    const dynamicInterests = getParsedInterests();

    const getMarketInsights = () => {
        const goal = (userData.careerGoal || "Software Developer").toLowerCase();
        if (goal.includes("electrician")) {
            return {
                demandName: "Electrician Demand",
                demandPct: "85%",
                growth: "+15% Growth",
                roleStatus: "High Demand",
                roleName: "Industrial Electrician",
                topRoleName: "Maintenance Tech",
                salaryRange: "₹3-5 LPA",
                bg1: "bg-green-50 dark:bg-green-950/30",
                bg2: "bg-purple-50 dark:bg-purple-950/30",
                bg3: "bg-green-50 dark:bg-green-950/30",
                bg4: "bg-blue-50 dark:bg-blue-950/30",
                bg5: "bg-violet-50 dark:bg-violet-950/30",
                color1: "text-green-700 dark:text-green-300",
                color2: "text-purple-700 dark:text-purple-300",
                textColorGreen: "text-green-800 dark:text-green-300",
                textColorSubGreen: "text-green-600 dark:text-green-400",
                textColorBlue: "text-blue-800 dark:text-blue-300",
                textColorSubBlue: "text-blue-600 dark:text-blue-400",
                textColorViolet: "text-violet-800 dark:text-violet-300",
                textColorSubViolet: "text-violet-600 dark:text-violet-400"
            };
        }
        if (goal.includes("plumb")) {
            return {
                demandName: "Plumbing Demand",
                demandPct: "82%",
                growth: "+10% Growth",
                roleStatus: "Stable Demand",
                roleName: "Commercial Plumber",
                topRoleName: "Sanitation Engineer",
                salaryRange: "₹2.5-4.5 LPA",
                bg1: "bg-green-50 dark:bg-green-950/30",
                bg2: "bg-purple-50 dark:bg-purple-950/30",
                bg3: "bg-green-50 dark:bg-green-950/30",
                bg4: "bg-blue-50 dark:bg-blue-950/30",
                bg5: "bg-violet-50 dark:bg-violet-950/30",
                color1: "text-green-700 dark:text-green-300",
                color2: "text-purple-700 dark:text-purple-300",
                textColorGreen: "text-green-800 dark:text-green-300",
                textColorSubGreen: "text-green-600 dark:text-green-400",
                textColorBlue: "text-blue-800 dark:text-blue-300",
                textColorSubBlue: "text-blue-600 dark:text-blue-400",
                textColorViolet: "text-violet-800 dark:text-violet-300",
                textColorSubViolet: "text-violet-600 dark:text-violet-400"
            };
        }
        if (goal.includes("marketing")) {
            return {
                demandName: "Digital Marketing Demand",
                demandPct: "89%",
                growth: "+18% Growth",
                roleStatus: "High Demand",
                roleName: "SEO Specialist",
                topRoleName: "Performance Marketer",
                salaryRange: "₹4-8 LPA",
                bg1: "bg-green-50 dark:bg-green-950/30",
                bg2: "bg-purple-50 dark:bg-purple-950/30",
                bg3: "bg-green-50 dark:bg-green-950/30",
                bg4: "bg-blue-50 dark:bg-blue-950/30",
                bg5: "bg-violet-50 dark:bg-violet-950/30",
                color1: "text-green-700 dark:text-green-300",
                color2: "text-purple-700 dark:text-purple-300",
                textColorGreen: "text-green-800 dark:text-green-300",
                textColorSubGreen: "text-green-600 dark:text-green-400",
                textColorBlue: "text-blue-800 dark:text-blue-300",
                textColorSubBlue: "text-blue-600 dark:text-blue-400",
                textColorViolet: "text-violet-800 dark:text-violet-300",
                textColorSubViolet: "text-violet-600 dark:text-violet-400"
            };
        }
        return {
            demandName: "Software Dev Demand",
            demandPct: "92%",
            growth: "+25% Growth",
            roleStatus: "High Demand",
            roleName: "Web Developers",
            topRoleName: "Full Stack Developer",
            salaryRange: "₹8-12 LPA",
            bg1: "bg-green-50 dark:bg-green-950/30",
            bg2: "bg-purple-50 dark:bg-purple-950/30",
            bg3: "bg-green-50 dark:bg-green-950/30",
            bg4: "bg-blue-50 dark:bg-blue-950/30",
            bg5: "bg-violet-50 dark:bg-violet-950/30",
            color1: "text-green-700 dark:text-green-300",
            color2: "text-purple-700 dark:text-purple-300",
            textColorGreen: "text-green-800 dark:text-green-300",
            textColorSubGreen: "text-green-600 dark:text-green-400",
            textColorBlue: "text-blue-800 dark:text-blue-300",
            textColorSubBlue: "text-blue-600 dark:text-blue-400",
            textColorViolet: "text-violet-800 dark:text-violet-300",
            textColorSubViolet: "text-violet-600 dark:text-violet-400"
        };
    };
    const marketInsights = getMarketInsights();

    const skillAreas = [
        { name: "Programming", level: 30, target: 80 },
        { name: "Web Development", level: 20, target: 85 },
        { name: "Problem Solving", level: 60, target: 90 },
        { name: "Communication", level: 70, target: 85 }
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const getGreetingConfig = () => {
        const hour = new Date().getHours();
        if (hour < 6) return { 
            bg: "from-violet-900 to-indigo-900", 
            icon: <Moon className="h-48 w-48 text-violet-300/50 animate-pulse" />,
            accent: "text-violet-300"
        };
        if (hour < 12) return { 
            bg: "from-violet-600 to-indigo-600", 
            icon: <Sunrise className="h-48 w-48 text-violet-200/50 animate-bounce" />,
            accent: "text-violet-200"
        };
        if (hour < 17) return { 
            bg: "from-primary to-indigo-600", 
            icon: <Sun className="h-48 w-48 text-white/30 animate-spin-slow" />,
            accent: "text-violet-100"
        };
        if (hour < 20) return { 
            bg: "from-indigo-600 to-violet-700", 
            icon: <Sunset className="h-48 w-48 text-violet-300/50 animate-pulse" />,
            accent: "text-violet-300"
        };
        return { 
            bg: "from-violet-900 to-indigo-900", 
            icon: <Moon className="h-48 w-48 text-violet-300/50 animate-pulse" />,
            accent: "text-violet-300"
        };
    };

    const greetingConfig = getGreetingConfig();

    const getDateTime = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const displayCourses = courses.length > 0 ? courses : recommendedCourses;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className=" mx-auto">
                <div className={`bg-gradient-to-r ${greetingConfig.bg} p-6 sm:p-8 rounded-2xl text-primary-foreground shadow-xl flex flex-col justify-between relative overflow-hidden mb-8 w-full`}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">{getGreeting()}</p>
                                <span className="text-[10px] text-primary-foreground/60">•</span>
                                <p className="text-[10px] text-primary-foreground/80">{getDateTime()}</p>
                            </div>
                            {loading ? (
                                <div className="space-y-2 mt-2">
                                    <Skeleton className="h-8 w-48 bg-white/20" />
                                    <Skeleton className="h-4 w-64 bg-white/20" />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-extrabold tracking-tighter">{userData.name}</h2>
                                    <p className="text-primary-foreground/80 text-sm mt-1">Continue your {userData.careerGoal} journey</p>
                                </>
                            )}
                        </div>
                        
                        <div className="absolute -right-4 -bottom-4 opacity-30 pointer-events-none">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                {greetingConfig.icon}
                            </motion.div>
                        </div>
                    </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="text-primary" size={20} />
                                        Career Journey
                                    </CardTitle>
                                    <CardDescription>
                                        Your progress towards becoming job-ready in {loading ? <Skeleton as="span" className="h-4 w-32 inline-block align-middle" /> : userData.careerGoal}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-4 w-12" />
                                                </div>
                                                <Skeleton className="h-3 w-full" />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[1, 2, 3, 4].map(i => (
                                                    <Skeleton key={i} className="h-16 w-full" />
                                                ))}
                                            </div>
                                            <div className="space-y-3 pt-4 border-t">
                                                <Skeleton className="h-4 w-24" />
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex gap-3">
                                                        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                                                        <Skeleton className="h-5 w-48" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Overall Completion</span>
                                                <span className="text-sm font-medium">{userData.progress}%</span>
                                            </div>
                                            <Progress value={userData.progress} className="h-3" />
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-primary">{enrolledCourses.length}</div>
                                                    <div className="text-xs text-muted-foreground">Courses</div>
                                                </div>
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-primary">
                                                        {skillGap ? `${skillGap.skills_owned?.length || 0}/${skillGap.skills_required?.length || 5}` : "0/5"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Skills</div>
                                                </div>
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-primary">{weeksLeft}</div>
                                                    <div className="text-xs text-muted-foreground">Weeks Left</div>
                                                </div>
                                                <div className="text-center p-3 border rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-primary">
                                                        {careerScore ? `${Math.round(careerScore.skill_match_pct)}%` : "85%"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Match</div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-4 mt-4">
                                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                    <MapPin size={14} className="text-primary" />
                                                    Milestones
                                                </h4>
                                                <div className="space-y-3">
                                                    {milestones.map((milestone, index) => (
                                                        <div key={milestone.id} className="flex items-start gap-3 min-w-0">
                                                            <div className={`flex flex-col items-center ${milestone.status === "completed" ? "text-primary" :
                                                                milestone.status === "current" ? "text-green-500" : "text-muted-foreground"
                                                                }`}>
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs ${milestone.status === "completed" ? "bg-primary border-primary text-primary-foreground" :
                                                                    milestone.status === "current" ? "bg-green-500 border-green-500 text-white" :
                                                                        "bg-muted border-muted text-muted-foreground"
                                                                    }`}>
                                                                    {milestone.status === "completed" ? "✓" : index + 1}
                                                                </div>
                                                                {index < milestones.length - 1 && (
                                                                    <div className={`w-0.5 h-6 ${milestone.status === "completed" ? "bg-primary" : "bg-muted"
                                                                        }`} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 pb-3 min-w-0">
                                                                <h3 className={`font-medium text-sm truncate ${milestone.status === "current" ? "text-green-600 dark:text-green-400" : "text-foreground"
                                                                    }`}>
                                                                    {milestone.title}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <Button
                                                    onClick={() => router.push('/student/career-map')}
                                                    className="w-full flex items-center gap-2"
                                                >
                                                    <MapPin size={16} />
                                                    View Full Career Path
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="text-primary" size={20} />
                                        Recommended Next Steps
                                    </CardTitle>
                                    <CardDescription>
                                        AI-suggested learning opportunities based on your profile and goals
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2].map(i => (
                                                <Card key={i}>
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-2 flex-1">
                                                                <Skeleton className="h-5 w-64" />
                                                                <Skeleton className="h-4 w-40" />
                                                                <div className="flex gap-4">
                                                                    <Skeleton className="h-4 w-16" />
                                                                    <Skeleton className="h-4 w-20" />
                                                                </div>
                                                            </div>
                                                            <Skeleton className="h-8 w-20" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {displayCourses.map((course: any, index: number) => {
                                                const isRealCourse = !!course.match_report;
                                                const courseId = course.id;
                                                const title = course.title;
                                                const provider = course.provider;
                                                const duration = isRealCourse 
                                                    ? (course.total_hours ? `${Math.round(course.total_hours)} hours` : (course.duration_months ? `${course.duration_months * 4} weeks` : (course.hours_per_week ? `${Math.round(course.hours_per_week)} hrs/week` : "Self-paced")))
                                                    : course.duration;
                                                const level = isRealCourse 
                                                    ? (course.nsqf_level ? `NSQF Level ${course.nsqf_level}` : (course.difficulty || "Beginner"))
                                                    : course.level;
                                                const match = isRealCourse 
                                                    ? Math.round(course.match_report.overall_match_pct) 
                                                    : course.match;
                                                const type = isRealCourse ? "course" : course.type;
                                                const url = course.url;

                                                return (
                                                    <motion.div
                                                        key={courseId}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.1 * index }}
                                                    >
                                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <h3 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[400px]">{title}</h3>
                                                                            <Badge variant={type === "internship" ? "default" : "secondary"}>
                                                                                {type}
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mb-2">{provider}</p>
                                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                            <div className="flex items-center gap-1">
                                                                                <Clock size={14} />
                                                                                <span>{duration}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Award size={14} />
                                                                                <span>{level}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <TrendingUp size={14} />
                                                                                <span>{match}% Match</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button 
                                                                        size="sm" 
                                                                        className="flex items-center gap-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (url) {
                                                                                window.open(url, '_blank');
                                                                            } else {
                                                                                router.push('/student/browse_courses');
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isRealCourse ? "View Course" : "Enroll"}
                                                                        <ChevronRight size={16} />
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        >
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="text-violet-500" size={18} />
                                        Quick Quiz
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/student/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Target size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Web Dev Quiz</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">10 Questions • 5 min</p>
                                        </div>
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/student/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Python Basics</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">8 Questions • 4 min</p>
                                        </div>
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/student/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Problem Solving</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">12 Questions • 6 min</p>
                                        </div>
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/student/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Data Science</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">15 Questions • 8 min</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/student/quick-quiz')}>
                                        View All Quizzes
                                        <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 min-w-0 lg:sticky lg:top-24 lg:self-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="text-primary" size={18} />
                                        Profile Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    {loading ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Skeleton className="h-16 w-full" />
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                            <Skeleton className="h-12 w-full" />
                                            <div className="grid grid-cols-4 gap-2">
                                                {[1, 2, 3, 4].map(i => (
                                                    <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                <div className="p-3 border rounded-lg overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target size={14} className="text-violet-500 shrink-0" />
                                                        <span className="font-medium text-xs">Career Goal</span>
                                                    </div>
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-muted-foreground shrink-0">Domain</span>
                                                            <span className="text-right break-words">{userData.careerGoal}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-muted-foreground shrink-0">Target</span>
                                                            <span className="text-right break-words">{userData.targetRoles}</span>
                                                        </div>
                                                    </div>
                                                </div>
 
                                                <div className="p-3 border rounded-lg overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen size={14} className="text-violet-500 shrink-0" />
                                                        <span className="font-medium text-xs">Learning Prefs</span>
                                                    </div>
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-muted-foreground shrink-0">Type</span>
                                                            <span className="text-right break-words">{userData.prefType}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-muted-foreground shrink-0">Style</span>
                                                            <span className="text-right break-words">{userData.prefStyle}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-muted-foreground shrink-0">Time</span>
                                                            <span className="text-right break-words">{userData.learningPace}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
 
                                            <div className="p-3 border rounded-lg overflow-hidden">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star size={14} className="text-pink-500 shrink-0" />
                                                    <span className="font-medium text-xs">Interests</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {userData.interests.map((interest: string) => (
                                                        <Badge key={interest} variant="secondary" className="text-[10px] capitalize">
                                                            {interest}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-3 border rounded-lg overflow-hidden">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Award size={14} className="text-blue-500 shrink-0" />
                                                    <span className="font-medium text-xs">Skills</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {skillGap?.skills_owned && skillGap.skills_owned.length > 0 ? (
                                                        skillGap.skills_owned.map((skill: string) => (
                                                            <Badge key={skill} variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/30">
                                                                {formatSkillName(skill)}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground italic">No skills recorded yet. Complete courses to earn skills!</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-1 sm:gap-2">
                                                <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                                    <div className="text-base sm:text-lg font-bold text-primary">
                                                        {enrolledCourses.filter(e => e.progress_pct >= 100).length}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">Completed</div>
                                                </div>
                                                <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                                    <div className="text-base sm:text-lg font-bold text-primary">
                                                        {enrolledCourses.filter(e => e.progress_pct < 100).length}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">In Progress</div>
                                                </div>
                                                <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                                    <div className="text-base sm:text-lg font-bold text-primary">
                                                        {enrolledCourses.reduce((sum, e) => sum + Math.round((e.progress_pct / 100) * (e.total_hours || 20)), 0)}h
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">Hours</div>
                                                </div>
                                                <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                                    <div className="text-base sm:text-lg font-bold text-primary">
                                                        {enrolledCourses.filter(e => e.progress_pct >= 100).length}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-muted-foreground break-words">Certificates</div>
                                                </div>
                                            </div>

                                            <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/student/profile')}>
                                                View & Edit Full Profile
                                                <ChevronRight size={14} className="ml-1" />
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="text-green-500" size={18} />
                                        Market Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`p-3 ${marketInsights.bg1} rounded-lg text-center`}>
                                            <p className={`text-xl font-bold ${marketInsights.color1}`}>{marketInsights.demandPct}</p>
                                            <p className="text-xs text-muted-foreground">{marketInsights.demandName}</p>
                                        </div>
                                        <div className={`p-3 ${marketInsights.bg2} rounded-lg text-center`}>
                                            <p className={`text-xl font-bold ${marketInsights.color2}`}>{marketInsights.growth}</p>
                                            <p className="text-xs text-muted-foreground">Market Growth</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center justify-between gap-3 p-3 ${marketInsights.bg3} rounded-lg min-w-0`}>
                                        <div className="min-w-0">
                                            <p className={`font-medium ${marketInsights.textColorGreen}`}>{marketInsights.roleStatus}</p>
                                            <p className={`text-sm ${marketInsights.textColorSubGreen} truncate`}>{marketInsights.roleName}</p>
                                        </div>
                                        <TrendingUp className={`${marketInsights.textColorSubGreen} shrink-0`} size={18} />
                                    </div>
                                    <div className={`flex items-center justify-between gap-3 p-3 ${marketInsights.bg4} rounded-lg min-w-0`}>
                                        <div className="min-w-0">
                                            <p className={`font-medium ${marketInsights.textColorBlue}`}>Top Role</p>
                                            <p className={`text-sm ${marketInsights.textColorSubBlue} truncate`}>{marketInsights.topRoleName}</p>
                                        </div>
                                        <Users className={`${marketInsights.textColorSubBlue} shrink-0`} size={18} />
                                    </div>
                                    <div className={`flex items-center justify-between gap-3 p-3 ${marketInsights.bg5} rounded-lg min-w-0`}>
                                        <div className="min-w-0">
                                            <p className={`font-medium ${marketInsights.textColorViolet}`}>Avg Salary</p>
                                            <p className={`text-sm ${marketInsights.textColorSubViolet} truncate`}>{marketInsights.salaryRange}</p>
                                        </div>
                                        <Briefcase className={`${marketInsights.textColorSubViolet} shrink-0`} size={18} />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => router.push('/student/insights')}>
                                        View Full Insights
                                        <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
