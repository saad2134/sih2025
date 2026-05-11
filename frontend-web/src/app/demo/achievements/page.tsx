"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  ChevronLeft,
  Trophy, 
  Star, 
  Flame, 
  Target,
  Award, 
  Zap,
  Crown,
  Medal,
  Shield,
  BookOpen,
  CheckCircle2,
  Lock
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  maxProgress: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  unlocked: boolean;
  unlockedDate?: string;
  reward: string;
  category: string;
}

export default function Achievements() {
  const userStats = {
    totalPoints: 2450,
    level: 8,
    streak: 12,
    rank: 156,
    totalUsers: 12450,
    nextLevelPoints: 3000,
    currentLevelProgress: 82
  };

  const achievements: Achievement[] = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      icon: BookOpen,
      progress: 1,
      maxProgress: 1,
      tier: "Bronze",
      unlocked: true,
      unlockedDate: "Jan 15, 2026",
      reward: "100 points",
      category: "Learning"
    },
    {
      id: 2,
      title: "Quick Learner",
      description: "Complete 5 lessons in one day",
      icon: Zap,
      progress: 5,
      maxProgress: 5,
      tier: "Silver",
      unlocked: true,
      unlockedDate: "Jan 18, 2026",
      reward: "250 points",
      category: "Learning"
    },
    {
      id: 3,
      title: "Knowledge Seeker",
      description: "Complete 10 courses",
      icon: Award,
      progress: 10,
      maxProgress: 10,
      tier: "Gold",
      unlocked: true,
      unlockedDate: "Feb 1, 2026",
      reward: "500 points + Badge",
      category: "Learning"
    },
    {
      id: 4,
      title: "Streak Master",
      description: "Maintain a 7-day learning streak",
      icon: Flame,
      progress: 7,
      maxProgress: 7,
      tier: "Silver",
      unlocked: true,
      unlockedDate: "Jan 22, 2026",
      reward: "300 points",
      category: "Consistency"
    },
    {
      id: 5,
      title: "On Fire!",
      description: "Maintain a 30-day learning streak",
      icon: Flame,
      progress: 12,
      maxProgress: 30,
      tier: "Platinum",
      unlocked: false,
      reward: "1000 points + Trophy",
      category: "Consistency"
    },
    {
      id: 6,
      title: "Goal Getter",
      description: "Complete all milestones in a career path",
      icon: Target,
      progress: 2,
      maxProgress: 6,
      tier: "Gold",
      unlocked: false,
      reward: "750 points",
      category: "Career"
    },
    {
      id: 7,
      title: "Perfect Score",
      description: "Score 100% on any assessment",
      icon: Star,
      progress: 3,
      maxProgress: 3,
      tier: "Bronze",
      unlocked: true,
      unlockedDate: "Jan 20, 2026",
      reward: "150 points",
      category: "Excellence"
    },
    {
      id: 8,
      title: "Scholar",
      description: "Earn 10 certificates",
      icon: Medal,
      progress: 2,
      maxProgress: 10,
      tier: "Silver",
      unlocked: false,
      reward: "400 points",
      category: "Achievement"
    },
    {
      id: 9,
      title: "Champion",
      description: "Rank #1 in weekly leaderboard",
      icon: Crown,
      progress: 0,
      maxProgress: 1,
      tier: "Platinum",
      unlocked: false,
      reward: "2000 points + Crown Badge",
      category: "Competition"
    },
    {
      id: 10,
      title: "Helper",
      description: "Help 5 other learners with questions",
      icon: Shield,
      progress: 3,
      maxProgress: 5,
      tier: "Silver",
      unlocked: false,
      reward: "350 points",
      category: "Community"
    },
    {
      id: 11,
      title: "Speed Demon",
      description: "Complete a course in under 3 days",
      icon: Zap,
      progress: 1,
      maxProgress: 1,
      tier: "Gold",
      unlocked: true,
      unlockedDate: "Jan 25, 2026",
      reward: "400 points",
      category: "Speed"
    },
    {
      id: 12,
      title: "Night Owl",
      description: "Study after 10 PM for 5 days",
      icon: Star,
      progress: 5,
      maxProgress: 5,
      tier: "Bronze",
      unlocked: true,
      unlockedDate: "Jan 28, 2026",
      reward: "100 points",
      category: "Special"
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "text-amber-700 dark:text-amber-400";
      case "Silver": return "text-slate-400";
      case "Gold": return "text-yellow-500";
      case "Platinum": return "text-violet-500";
      default: return "text-muted-foreground";
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier) {
      case "Bronze": return "bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
      case "Silver": return "bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700";
      case "Gold": return "bg-yellow-100 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
      case "Platinum": return "bg-violet-100 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800";
      default: return "bg-muted border-border";
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  useEffect(() => {
    document.title = `Achievements ✦ ${siteConfig.name}`;
  }, []);

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary to-violet-600 dark:to-indigo-500 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-white/20 rounded-full">
                    <Trophy size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl sm:text-3xl font-bold">Level {userStats.level}</span>
                      <Crown className="text-yellow-300" size={20} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <Flame className="text-orange-300" size={14} />
                        {userStats.streak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={14} />
                        {userStats.totalPoints.toLocaleString()} points
                      </span>
                    </div>
                  </div>
                </div>
                <div className="lg:text-right space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Progress to Level {userStats.level + 1}</span>
                    <span className="font-medium">{userStats.currentLevelProgress}%</span>
                  </div>
                  <Progress 
                    value={userStats.currentLevelProgress} 
                    className="h-3 bg-white/20" 
                    indicatorClassName="bg-white" 
                  />
                  <p className="text-xs text-white/60">{userStats.nextLevelPoints - userStats.totalPoints} points to next level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Achievements</span>
                  <span className="font-semibold">{unlockedCount} / {achievements.length}</span>
                </div>
                <Progress value={(unlockedCount / achievements.length) * 100} className="h-2" />
                
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-amber-500" size={16} />
                      <span className="text-sm">Bronze</span>
                    </div>
                    <Badge variant="outline">{achievements.filter(a => a.tier === "Bronze" && a.unlocked).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Medal className="text-slate-400" size={16} />
                      <span className="text-sm">Silver</span>
                    </div>
                    <Badge variant="outline">{achievements.filter(a => a.tier === "Silver" && a.unlocked).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="text-yellow-500" size={16} />
                      <span className="text-sm">Gold</span>
                    </div>
                    <Badge variant="outline">{achievements.filter(a => a.tier === "Gold" && a.unlocked).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="text-violet-500" size={16} />
                      <span className="text-sm">Platinum</span>
                    </div>
                    <Badge variant="outline">{achievements.filter(a => a.tier === "Platinum" && a.unlocked).length}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Global Rank</span>
                    <span className="font-bold text-primary">#{userStats.rank.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Out of {userStats.totalUsers.toLocaleString()} learners</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="text-primary" size={20} />
                    All Achievements
                  </CardTitle>
                  <CardDescription>
                    Complete challenges and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      const progress = (achievement.progress / achievement.maxProgress) * 100;
                      
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}
                        >
                          <Card className={`${getTierBg(achievement.tier)} ${achievement.unlocked ? '' : 'opacity-75'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${achievement.unlocked ? getTierBg(achievement.tier) : 'bg-muted'}`}>
                                  {achievement.unlocked ? (
                                    <Icon className={`${getTierColor(achievement.tier)}`} size={20} />
                                  ) : (
                                    <Lock className="text-muted-foreground" size={20} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className={`font-semibold text-sm ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                                      {achievement.title}
                                    </h3>
                                    <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs shrink-0">
                                      {achievement.tier}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                                  
                                  {!achievement.unlocked && (
                                    <div className="mt-3">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                                      </div>
                                      <Progress value={progress} className="h-1.5" />
                                    </div>
                                  )}
                                  
                                  {achievement.unlocked && achievement.unlockedDate && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                      <CheckCircle2 size={12} className="text-green-500" />
                                      <span>Unlocked {achievement.unlockedDate}</span>
                                    </div>
                                  )}
                                  
                                  <div className="mt-2 flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">{achievement.category}</Badge>
                                    <span className="text-xs font-medium text-primary">{achievement.reward}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
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
