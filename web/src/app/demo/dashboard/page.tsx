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

export default function Dashboard() {
    const router = useRouter();
    const [userData, setUserData] = React.useState({
        name: "Saad Mohammed",
        education: "Bachelor's Degree",
        careerGoal: "Software Development",
        skillLevel: "Beginner",
        progress: 25,
        learningPace: "1-2 hours/day"
    });

    useEffect(() => {
        document.title = `Dashboard ✦ ${siteConfig.name}`;
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

    const milestones = [
        { id: 1, title: "Profile Setup", status: "completed", description: "Basic information collected" },
        { id: 2, title: "Web Dev Fundamentals", status: "current", description: "Next recommended step" },
        { id: 3, title: "Python Certification", status: "upcoming", description: "Build programming skills" },
        { id: 4, title: "Internship", status: "upcoming", description: "Gain practical experience" },
        { id: 5, title: "Job Ready", status: "upcoming", description: "Start applying for roles" }
    ];

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
                            <h2 className="text-2xl font-extrabold tracking-tighter">{userData.name}</h2>
                            <p className="text-primary-foreground/80 text-sm mt-1">Continue your {userData.careerGoal} journey</p>
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
                                        Your progress towards becoming job-ready in {userData.careerGoal}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Overall Completion</span>
                                            <span className="text-sm font-medium">{userData.progress}%</span>
                                        </div>
                                        <Progress value={userData.progress} className="h-3" />
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                            <div className="text-center p-3 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">2</div>
                                                <div className="text-xs text-muted-foreground">Courses</div>
                                            </div>
                                            <div className="text-center p-3 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">5</div>
                                                <div className="text-xs text-muted-foreground">Skills</div>
                                            </div>
                                            <div className="text-center p-3 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">12</div>
                                                <div className="text-xs text-muted-foreground">Weeks Left</div>
                                            </div>
                                            <div className="text-center p-3 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">85%</div>
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
                                                onClick={() => router.push('/demo/career-map')}
                                                className="w-full flex items-center gap-2"
                                            >
                                                <MapPin size={16} />
                                                View Full Career Path
                                            </Button>
                                        </div>
                                    </div>
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
                                    <div className="space-y-4">
                                        {recommendedCourses.map((course, index) => (
                                            <motion.div
                                                key={course.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                            >
                                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                                                                    <Badge variant={course.type === "internship" ? "default" : "secondary"}>
                                                                        {course.type}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2">{course.provider}</p>
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock size={14} />
                                                                        <span>{course.duration}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Award size={14} />
                                                                        <span>{course.level}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <TrendingUp size={14} />
                                                                        <span>{course.match}% Match</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" className="flex items-center gap-1">
                                                                Enroll
                                                                <ChevronRight size={16} />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
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
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/demo/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Target size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Web Dev Quiz</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">10 Questions • 5 min</p>
                                        </div>
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/demo/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Python Basics</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">8 Questions • 4 min</p>
                                        </div>
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/demo/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Problem Solving</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">12 Questions • 6 min</p>
                                        </div>
                                        <div className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors" onClick={() => router.push('/demo/quick-quiz')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain size={14} className="text-violet-500" />
                                                <span className="font-medium text-sm">Data Science</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">15 Questions • 8 min</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/demo/quick-quiz')}>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <div className="p-3 border rounded-lg overflow-hidden">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target size={14} className="text-violet-500 shrink-0" />
                                                <span className="font-medium text-xs">Career Goal</span>
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-muted-foreground shrink-0">Domain</span>
                                                    <span className="text-right break-words">Software Dev</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-muted-foreground shrink-0">Target</span>
                                                    <span className="text-right break-words">Full Stack</span>
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
                                                    <span className="text-right break-words">Hands-on</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-muted-foreground shrink-0">Style</span>
                                                    <span className="text-right break-words">Self-paced</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-muted-foreground shrink-0">Time</span>
                                                    <span className="text-right break-words">1-2 hrs/d</span>
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
                                            <Badge variant="secondary" className="text-[10px]">Web Dev</Badge>
                                            <Badge variant="secondary" className="text-[10px]">Data Science</Badge>
                                            <Badge variant="secondary" className="text-[10px]">AI/ML</Badge>
                                            <Badge variant="secondary" className="text-[10px]">Cloud</Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                                        <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                            <div className="text-base sm:text-lg font-bold text-primary">5</div>
                                            <div className="text-[10px] sm:text-xs text-muted-foreground break-words">Completed</div>
                                        </div>
                                        <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                            <div className="text-base sm:text-lg font-bold text-primary">3</div>
                                            <div className="text-[10px] sm:text-xs text-muted-foreground break-words">In Progress</div>
                                        </div>
                                        <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                            <div className="text-base sm:text-lg font-bold text-primary">48h</div>
                                            <div className="text-[10px] sm:text-xs text-muted-foreground break-words">Hours</div>
                                        </div>
                                        <div className="text-center p-1.5 sm:p-2 border rounded-lg min-w-0">
                                            <div className="text-base sm:text-lg font-bold text-primary">4</div>
                                            <div className="text-[10px] sm:text-xs text-muted-foreground break-words">Certificates</div>
                                        </div>
                                    </div>

                                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/demo/profile')}>
                                        View & Edit Full Profile
                                        <ChevronRight size={14} className="ml-1" />
                                    </Button>
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
                                        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                                            <p className="text-xl font-bold text-green-700 dark:text-green-300">92%</p>
                                            <p className="text-xs text-muted-foreground">Web Dev Demand</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center">
                                            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">+25%</p>
                                            <p className="text-xs text-muted-foreground">AI/ML Growth</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-green-800 dark:text-green-300">High Demand</p>
                                            <p className="text-sm text-green-600 dark:text-green-400 truncate">Web Developers</p>
                                        </div>
                                        <TrendingUp className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-blue-800 dark:text-blue-300">Top Role</p>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 truncate">Full Stack Developer</p>
                                        </div>
                                        <Users className="text-blue-600 dark:text-blue-400 shrink-0" size={18} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-violet-800 dark:text-violet-300">Avg Salary</p>
                                            <p className="text-sm text-violet-600 dark:text-violet-400 truncate">₹8-12 LPA</p>
                                        </div>
                                        <Briefcase className="text-violet-600 dark:text-violet-400 shrink-0" size={18} />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => router.push('/demo/insights')}>
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
