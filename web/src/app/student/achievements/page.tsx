"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
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
  Lock,
  Calendar,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { apiService } from "@/lib/api";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  progress: number;
  maxProgress: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  unlocked: boolean;
  unlockedDate?: string;
  reward: string;
  category: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  courses: number;
  change: number;
  country: string;
  is_current?: boolean;
}

interface UserStats {
  totalPoints: number;
  level: number;
  streak: number;
  rank: number;
  totalUsers: number;
  nextLevelPoints: number;
  currentLevelProgress: number;
  courses: number;
  change: number;
  topPercent: number;
  completedCourses: number;
  enrolledCourses: number;
  skillsOwned: number;
  skillsRequired: number;
}



export default function Achievements() {
  const [timeframe, setTimeframe] = React.useState<"weekly" | "monthly" | "allTime">("weekly");
  const [loading, setLoading] = React.useState(true);
  const [userStats, setUserStats] = React.useState<UserStats>({
    totalPoints: 0,
    level: 1,
    streak: 1,
    rank: 1,
    totalUsers: 1,
    nextLevelPoints: 350,
    currentLevelProgress: 0,
    courses: 0,
    change: 0,
    topPercent: 0,
    completedCourses: 0,
    enrolledCourses: 0,
    skillsOwned: 0,
    skillsRequired: 0,
  });
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [weeklyLeaders, setWeeklyLeaders] = React.useState<LeaderboardUser[]>([]);
  const [monthlyLeaders, setMonthlyLeaders] = React.useState<LeaderboardUser[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = React.useState<LeaderboardUser[]>([]);

  useEffect(() => {
    document.title = `Achievements & Leaderboard ✦ ${siteConfig.name}`;
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, enrolledRes, skillGapRes, leaderboardRes] = await Promise.all([
        apiService.getUserStats().catch(() => ({ success: false, data: null })),
        apiService.getEnrolledCourses().catch(() => ({ success: false, data: null })),
        apiService.getSkillGap().catch(() => ({ success: false, data: null })),
        apiService.getLeaderboard().catch(() => ({ success: false, data: null })),
      ]);

      let streak = 1;
      let level = 1;
      let points = 0;
      let rank = 1;
      let totalUsers = 1;

      // Use real stats from the backend
      if (statsRes.success && statsRes.data) {
        streak = statsRes.data.streak;
        level = statsRes.data.level;
        points = statsRes.data.points;
        rank = statsRes.data.rank;
        totalUsers = statsRes.data.total_users;
      }

      if (leaderboardRes.success && leaderboardRes.data) {
        setWeeklyLeaders(leaderboardRes.data.weekly || []);
        setMonthlyLeaders(leaderboardRes.data.monthly || []);
        setAllTimeLeaders(leaderboardRes.data.all_time || []);
      }

      let completedCourses = 0;
      let enrolledCourses = 0;
      let totalHours = 0;

      if (enrolledRes.success && enrolledRes.data) {
        const list = enrolledRes.data;
        completedCourses = list.filter((e: any) => e.progress_pct >= 100).length;
        enrolledCourses = list.length;
        totalHours = list.reduce((sum: number, e: any) => sum + Math.round((e.progress_pct / 100) * (e.total_hours || 20)), 0);
      }

      let skillsOwned = 0;
      let skillsRequired = 0;

      if (skillGapRes.success && skillGapRes.data) {
        skillsOwned = (skillGapRes.data.skills_owned || []).length;
        skillsRequired = (skillGapRes.data.skills_required || []).length;
      }

      const nextLevelPoints = (level + 1) * 350;
      const currentLevelProgress = Math.min(100, Math.round((points / Math.max(nextLevelPoints, 1)) * 100));
      const topPercent = totalUsers > 1 ? Math.max(0.1, Math.min(99.9, 100 - (rank / totalUsers) * 100)) : 50;

      setUserStats({
        totalPoints: points,
        level,
        streak,
        rank,
        totalUsers: totalUsers,
        nextLevelPoints,
        currentLevelProgress,
        courses: enrolledCourses,
        change: Math.max(0, 100 - rank),
        topPercent: parseFloat(topPercent.toFixed(1)),
        completedCourses,
        enrolledCourses,
        skillsOwned,
        skillsRequired,
      });

      // Build dynamic achievements based on real data
      const dynamicAchievements: Achievement[] = [
        {
          id: 1,
          title: "First Steps",
          description: "Complete your first lesson",
          icon: BookOpen,
          progress: Math.min(completedCourses + enrolledCourses, 1),
          maxProgress: 1,
          tier: "Bronze",
          unlocked: (completedCourses + enrolledCourses) >= 1,
          unlockedDate: (completedCourses + enrolledCourses) >= 1 ? "Completed" : undefined,
          reward: "100 points",
          category: "Learning"
        },
        {
          id: 2,
          title: "Quick Learner",
          description: "Enroll in 3 courses",
          icon: Zap,
          progress: Math.min(enrolledCourses, 3),
          maxProgress: 3,
          tier: "Silver",
          unlocked: enrolledCourses >= 3,
          unlockedDate: enrolledCourses >= 3 ? "Completed" : undefined,
          reward: "250 points",
          category: "Learning"
        },
        {
          id: 3,
          title: "Knowledge Seeker",
          description: "Complete 5 courses",
          icon: Award,
          progress: Math.min(completedCourses, 5),
          maxProgress: 5,
          tier: "Gold",
          unlocked: completedCourses >= 5,
          unlockedDate: completedCourses >= 5 ? "Completed" : undefined,
          reward: "500 points + Badge",
          category: "Learning"
        },
        {
          id: 4,
          title: "Streak Master",
          description: "Maintain a 7-day learning streak",
          icon: Flame,
          progress: Math.min(streak, 7),
          maxProgress: 7,
          tier: "Silver",
          unlocked: streak >= 7,
          unlockedDate: streak >= 7 ? "Active" : undefined,
          reward: "300 points",
          category: "Consistency"
        },
        {
          id: 5,
          title: "On Fire!",
          description: "Maintain a 30-day learning streak",
          icon: Flame,
          progress: Math.min(streak, 30),
          maxProgress: 30,
          tier: "Platinum",
          unlocked: streak >= 30,
          unlockedDate: streak >= 30 ? "Active" : undefined,
          reward: "1000 points + Trophy",
          category: "Consistency"
        },
        {
          id: 6,
          title: "Goal Getter",
          description: "Master all required skills for your career path",
          icon: Target,
          progress: skillsOwned,
          maxProgress: Math.max(skillsRequired, 1),
          tier: "Gold",
          unlocked: skillsRequired > 0 && skillsOwned >= skillsRequired,
          unlockedDate: (skillsRequired > 0 && skillsOwned >= skillsRequired) ? "Completed" : undefined,
          reward: "750 points",
          category: "Career"
        },
        {
          id: 7,
          title: "Perfect Score",
          description: "Score 100% on any assessment",
          icon: Star,
          progress: completedCourses > 0 ? 1 : 0,
          maxProgress: 1,
          tier: "Bronze",
          unlocked: completedCourses > 0,
          unlockedDate: completedCourses > 0 ? "Completed" : undefined,
          reward: "150 points",
          category: "Excellence"
        },
        {
          id: 8,
          title: "Scholar",
          description: "Earn 10 certificates",
          icon: Medal,
          progress: Math.min(completedCourses, 10),
          maxProgress: 10,
          tier: "Silver",
          unlocked: completedCourses >= 10,
          unlockedDate: completedCourses >= 10 ? "Completed" : undefined,
          reward: "400 points",
          category: "Achievement"
        },
        {
          id: 9,
          title: "Champion",
          description: "Rank in the top 10",
          icon: Crown,
          progress: rank <= 10 ? 1 : 0,
          maxProgress: 1,
          tier: "Platinum",
          unlocked: rank <= 10,
          unlockedDate: rank <= 10 ? "Active" : undefined,
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
          progress: completedCourses > 0 ? 1 : 0,
          maxProgress: 1,
          tier: "Gold",
          unlocked: completedCourses > 0,
          unlockedDate: completedCourses > 0 ? "Completed" : undefined,
          reward: "400 points",
          category: "Speed"
        },
        {
          id: 12,
          title: "Dedicated Learner",
          description: "Study for 50+ hours total",
          icon: Star,
          progress: Math.min(totalHours, 50),
          maxProgress: 50,
          tier: "Bronze",
          unlocked: totalHours >= 50,
          unlockedDate: totalHours >= 50 ? "Completed" : undefined,
          reward: "100 points",
          category: "Special"
        }
      ];

      setAchievements(dynamicAchievements);
    } catch (err) {
      console.error("Failed to load achievements data", err);
    } finally {
      setLoading(false);
    }
  };

  const leaders = timeframe === "allTime" ? allTimeLeaders : (timeframe === "monthly" ? monthlyLeaders : weeklyLeaders);

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-slate-400" size={20} />;
      case 3: return <Medal className="text-amber-600" size={20} />;
      default: return null;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="text-green-500" size={14} />;
    if (change < 0) return <TrendingDown className="text-red-500" size={14} />;
    return <Minus className="text-muted-foreground" size={14} />;
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 pb-24">
        <div className="mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-primary to-violet-600 dark:to-indigo-500 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-48 bg-white/20" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-40 w-full rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
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
                <div className="lg:text-right space-y-2 flex-1 lg:max-w-md">
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

        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badges & Milestones
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                    <Progress value={achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0} className="h-2" />
                    
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
                              <Card className={`${getTierBg(achievement.tier)} ${achievement.unlocked ? '' : 'opacity-75'} h-full flex flex-col justify-between`}>
                                <CardContent className="p-4 flex flex-col h-full justify-between gap-3">
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
                                        <h3 className={`font-semibold text-sm ${achievement.unlocked ? '' : 'text-muted-foreground'} truncate`}>
                                          {achievement.title}
                                        </h3>
                                        <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs shrink-0">
                                          {achievement.tier}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                                    </div>
                                  </div>

                                  <div>
                                    {!achievement.unlocked && (
                                      <div className="mt-1">
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-muted-foreground">Progress</span>
                                          <span>{achievement.progress} / {achievement.maxProgress}</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5" />
                                      </div>
                                    )}
                                    
                                    {achievement.unlocked && achievement.unlockedDate && (
                                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <CheckCircle2 size={12} className="text-green-500" />
                                        <span>{achievement.unlockedDate}</span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-2 flex items-center justify-between border-t pt-2">
                                      <Badge variant="outline" className="text-[10px]">{achievement.category}</Badge>
                                      <span className="text-xs font-medium text-primary">{achievement.reward}</span>
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
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <div className="mb-6 flex gap-2 justify-center">
              <Button
                variant={timeframe === "weekly" ? "default" : "outline"}
                onClick={() => setTimeframe("weekly")}
                size="sm"
              >
                <Calendar size={14} className="mr-1" />
                This Week
              </Button>
              <Button
                variant={timeframe === "monthly" ? "default" : "outline"}
                onClick={() => setTimeframe("monthly")}
                size="sm"
              >
                This Month
              </Button>
              <Button
                variant={timeframe === "allTime" ? "default" : "outline"}
                onClick={() => setTimeframe("allTime")}
                size="sm"
              >
                <Trophy size={14} className="mr-1" />
                All Time
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {timeframe !== "allTime" && leaders.length >= 3 && (
                    <Card className="mb-6 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/5 dark:to-yellow-500/5 p-4 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="text-amber-500" size={20} />
                          Top 3 This {timeframe === "weekly" ? "Week" : "Month"}
                        </CardTitle>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-center items-end gap-6 pt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center flex-1 max-w-[120px]"
                          >
                            <div className="relative">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-lg font-bold mx-auto mb-2 ring-4 ring-slate-300 dark:ring-slate-500 shadow-lg">
                                {leaders[1].avatar}
                              </div>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</div>
                            </div>
                            <p className="font-semibold text-xs mt-2 truncate">{leaders[1].name}</p>
                            <p className="text-xs font-bold text-primary">{leaders[1].points.toLocaleString()} pts</p>
                            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Flame size={10} className="text-orange-500" />{leaders[1].streak}</span>
                              <span className="flex items-center gap-0.5"><BookOpen size={10} />{leaders[1].courses}</span>
                            </div>
                            <div className="mt-3 w-14 sm:w-16 h-16 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500 rounded-t-xl mx-auto flex items-end justify-center pb-2 shadow-md">
                              <Medal className="text-slate-400 -mt-5 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm" size={18} />
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center flex-1 max-w-[140px]"
                          >
                            <div className="relative">
                              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-2 ring-4 ring-yellow-400 shadow-lg shadow-yellow-500/20">
                                {leaders[0].avatar}
                              </div>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">1</div>
                            </div>
                            <p className="font-bold text-xs sm:text-sm mt-2 text-amber-600 dark:text-amber-400 truncate">{leaders[0].name}</p>
                            <p className="text-xs sm:text-sm font-bold text-primary">{leaders[0].points.toLocaleString()} pts</p>
                            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Flame size={10} className="text-orange-500" />{leaders[0].streak}</span>
                              <span className="flex items-center gap-0.5"><BookOpen size={10} />{leaders[0].courses}</span>
                            </div>
                            <div className="mt-3 w-18 sm:w-20 h-20 bg-gradient-to-t from-yellow-400 to-amber-300 rounded-t-xl mx-auto flex items-end justify-center pb-2 shadow-lg shadow-yellow-500/20">
                              <Crown className="text-white -mt-6 bg-yellow-500 rounded-full p-1 shadow-sm" size={20} />
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center flex-1 max-w-[120px]"
                          >
                            <div className="relative">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 dark:from-amber-600 dark:to-orange-600 flex items-center justify-center text-lg font-bold mx-auto mb-2 ring-4 ring-amber-300 dark:ring-amber-500 shadow-lg">
                                {leaders[2].avatar}
                              </div>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</div>
                            </div>
                            <p className="font-semibold text-xs mt-2 truncate">{leaders[2].name}</p>
                            <p className="text-xs font-bold text-primary">{leaders[2].points.toLocaleString()} pts</p>
                            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Flame size={10} className="text-orange-500" />{leaders[2].streak}</span>
                              <span className="flex items-center gap-0.5"><BookOpen size={10} />{leaders[2].courses}</span>
                            </div>
                            <div className="mt-3 w-14 sm:w-16 h-14 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-xl mx-auto flex items-end justify-center pb-2 shadow-md">
                              <Medal className="text-white -mt-5 bg-amber-600 rounded-full p-0.5 shadow-sm" size={16} />
                            </div>
                          </motion.div>
                        </div>
                        <div className="mx-auto mt-2 max-w-[320px]">
                          <div className="h-4 bg-gradient-to-r from-slate-300 via-yellow-300 to-amber-400 dark:from-slate-600 dark:via-yellow-600 dark:to-amber-600 rounded-b-xl shadow-md"></div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="text-amber-500" size={20} />
                      {timeframe === "allTime" ? "All-Time Leaders" : `Top Learners - This ${timeframe === "weekly" ? "Week" : "Month"}`}
                    </CardTitle>
                    <CardDescription>
                      {timeframe === "allTime" ? "Top performers of all time" : "Compete with the best learners this period"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {leaders.map((user, index) => (
                        <motion.div
                          key={`${user.rank}-${user.name}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            user.is_current ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800" : "hover:bg-muted/50"
                          } transition-colors`}
                        >
                          <div className="w-8 text-center font-bold text-muted-foreground">
                            {user.rank <= 3 ? (
                              <div className="flex justify-center">{getRankIcon(user.rank)}</div>
                            ) : (
                              `#${user.rank}`
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                            {user.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Flame size={12} className="text-orange-500" />
                                {user.streak}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} />
                                {user.courses} courses
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{user.points.toLocaleString()}</p>
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              {getChangeIcon(user.change)}
                              <span>{user.change > 0 ? `+${user.change}` : user.change}</span>
                            </div>
                          </div>
                          {user.is_current && (
                            <Badge variant="default" className="shrink-0">You</Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Standings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">All-Time Rank</p>
                        <p className="text-xl font-bold">#{userStats.rank}</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded-full">
                        <ArrowUp size={12} />
                        {userStats.change} positions
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Weekly Rank</p>
                        <p className="text-lg font-bold text-primary">#{Math.max(1, userStats.rank - 10)}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Top Percentile</p>
                        <p className="text-lg font-bold text-primary">{userStats.topPercent}%</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Weekly Activity Goal</span>
                        <span className="font-semibold">{userStats.currentLevelProgress}%</span>
                      </div>
                      <Progress value={userStats.currentLevelProgress} className="h-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">Earn {userStats.nextLevelPoints - userStats.totalPoints} more points to reach the next level</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
