"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { authService } from "@/lib/auth";
import { apiService, Course, UserProfile } from "@/lib/api";
import { LearnerProfile } from "@/lib/api";

const [userData, setUserData] = useState<UserProfile | null>(null);
const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
const [recommendations, setRecommendations] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            const [meResponse, recsResponse] = await Promise.all([
                apiService.getMe(),
                apiService.getRecommendations(20, 0)
            ]);

            if (meResponse.success && meResponse.data) {
                setUserData(meResponse.data);
            }

            if (recsResponse.success && recsResponse.data?.items) {
                setRecommendations(recsResponse.data.items);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const milestones = userData ? [
        { id: 1, title: "Profile Setup", status: userData.progress && userData.progress >= 10 ? "completed" : "upcoming", description: "Basic information collected" },
        { id: 2, title: userData.interests?.[0] || "Foundation Course", status: userData.progress && userData.progress >= 30 ? "completed" : userData.progress && userData.progress >= 10 ? "current" : "upcoming", description: "Build foundational skills" },
        { id: 3, title: "Skill Certification", status: userData.progress && userData.progress >= 50 ? "completed" : userData.progress && userData.progress >= 30 ? "current" : "upcoming", description: "Earn industry-recognized certification" },
        { id: 4, title: "Practical Application", status: userData.progress && userData.progress >= 70 ? "completed" : userData.progress && userData.progress >= 50 ? "current" : "upcoming", description: "Apply skills in real projects" },
        { id: 5, title: "Career Ready", status: userData.progress && userData.progress >= 90 ? "completed" : userData.progress && userData.progress >= 70 ? "current" : "upcoming", description: "Start your career journey" }
    ] : [];

    const skillAreas = userData && userData.interests ? userData.interests.slice(0, 4).map((interest, idx) => ({
        name: interest,
        level: Math.min(20 + (userStats?.progress || 0) + (idx * 15), 100),
        target: 80 + Math.random() * 20
    })) : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your personalized dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 pb-12 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Unable to Load Dashboard</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/student/onboarding')}>
                            Complete Onboarding
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const displayName = userData?.name || userData?.email?.split('@')[0] || 'Learner';
    const displayCareerGoal = userData?.career_goal || userData?.interests?.[0] || 'Your Career Path';

    return (
        <div className="min-h-screen bg-background pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Career GPS</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">Your personalized learning journey</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="text-left sm:text-right">
                            <p className="font-medium text-foreground truncate">Welcome back, {displayName}!</p>
                            <p className="text-sm text-muted-foreground">{displayCareerGoal} Path</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="flex items-center justify-center gap-2 shrink-0">
                            <LogOut size={16} />
                            Logout
                        </Button>
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
                                        Journey Progress
                                    </CardTitle>
                                    <CardDescription>
                                        Your overall progress towards becoming job-ready in {displayCareerGoal}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Overall Completion</span>
                                            <span className="text-sm font-medium">{userStats?.progress || 0}%</span>
                                        </div>
                                        <Progress value={userStats?.progress || 0} className="h-3" />
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                                            <div className="text-center p-3 sm:p-4 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">{userStats?.courses_completed || 0}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Courses Completed</div>
                                            </div>
                                            <div className="text-center p-3 sm:p-4 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">{userStats?.skills_gained || userData?.skills?.length || 0}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Skills Gained</div>
                                            </div>
                                            <div className="text-center p-3 sm:p-4 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary">{userStats?.weeks_remaining || 12}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Weeks Remaining</div>
                                            </div>
                                            <div className="text-center p-3 sm:p-4 border rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-primary flex items-center justify-center gap-1">
                                                    <Flame size={16} className="text-orange-500" />
                                                    {userStats?.current_streak || 0}
                                                </div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Day Streak</div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <Button
                                                onClick={() => router.push('/student/career_map')}
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
                                        Recommended Next Steps (AI Powered)
                                    </CardTitle>
                                    <CardDescription>
                                        Courses matched using semantic search on your profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recommendations.length > 0 ? (
                                            recommendations.map((course, index) => (
                                                <motion.div
                                                    key={course.course_id}
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
                                                                        <Badge variant="secondary">
                                                                            NSQF L{course.nsqf_level}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mb-2">Provider: {course.provider}</p>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock size={14} />
                                                                            <span>{course.duration_months} months</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <TrendingUp size={14} />
                                                                            <span className="text-green-600 font-medium">{course.match_probability}% Match</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                                        {course.skills?.split(',').slice(0, 3).join(', ')}...
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
                                            ))
                                        ) : (
                                            <div className="text-center p-8 text-muted-foreground">
                                                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No recommendations yet.</p>
                                                <p className="text-sm">Complete your profile to get personalized course suggestions.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 min-w-0 lg:sticky lg:top-24 lg:self-start">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="text-primary" size={20} />
                                        Career Journey Map
                                    </CardTitle>
                                    <CardDescription>
                                        Your path from beginner to job-ready professional
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {milestones.map((milestone, index) => (
                                            <div key={milestone.id} className="flex items-start gap-3 min-w-0">
                                                <div className={`flex flex-col items-center ${milestone.status === "completed" ? "text-primary" :
                                                    milestone.status === "current" ? "text-green-500" : "text-muted-foreground"
                                                    }`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${milestone.status === "completed" ? "bg-primary border-primary text-primary-foreground" :
                                                        milestone.status === "current" ? "bg-green-500 border-green-500 text-white" :
                                                            "bg-muted border-muted text-muted-foreground"
                                                        }`}>
                                                        {milestone.status === "completed" ? "✓" : index + 1}
                                                    </div>
                                                    {index < milestones.length - 1 && (
                                                        <div className={`w-0.5 h-8 ${milestone.status === "completed" ? "bg-primary" : "bg-muted"
                                                            }`} />
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-4 min-w-0">
                                                    <h3 className={`font-medium truncate ${milestone.status === "current" ? "text-green-600 dark:text-green-400" : "text-foreground"
                                                        }`}>
                                                        {milestone.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{milestone.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {skillAreas.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="text-primary" size={20} />
                                            Skill Development
                                        </CardTitle>
                                        <CardDescription>
                                            Track your progress in key areas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {skillAreas.map((skill, index) => (
                                                <div key={skill.name} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{skill.name}</span>
                                                        <span className="text-muted-foreground">{Math.round(skill.level)}% / {Math.round(skill.target)}%</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Progress value={skill.level} className="h-2" />
                                                        <Progress value={skill.target} className="h-1 bg-muted" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Market Insights</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-green-800 dark:text-green-300">High Demand</p>
                                            <p className="text-sm text-green-600 dark:text-green-400 truncate">{userData?.target_roles || userData?.career_goal || userData?.interests?.[0] || 'Tech'} Roles</p>
                                        </div>
                                        <TrendingUp className="text-green-600 dark:text-green-400 shrink-0" size={20} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-blue-800 dark:text-blue-300">In-Demand Skills</p>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{userData?.skills?.slice(0, 3).join(', ') || userData?.interests?.[0] || 'Technical Skills'}</p>
                                        </div>
                                        <Users className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-medium text-orange-800 dark:text-orange-300">Your Goal</p>
                                            <p className="text-sm text-orange-600 dark:text-orange-400 truncate">{userData?.career_goal || userData?.learning_goals?.[0] || 'Career Growth'}</p>
                                        </div>
                                        <Briefcase className="text-orange-600 dark:text-orange-400 shrink-0" size={20} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
