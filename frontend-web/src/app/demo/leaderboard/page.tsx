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
  Medal, 
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Star,
  Award,
  User,
  Target,
  Calendar,
  ArrowUp
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  courses: number;
  change: number;
  country: string;
}

const weeklyLeaders: LeaderboardUser[] = [
  { rank: 1, name: "Priya Sharma", avatar: "PS", points: 4850, streak: 45, courses: 28, change: 2, country: "IN" },
  { rank: 2, name: "Amit Kumar", avatar: "AK", points: 4620, streak: 38, courses: 25, change: -1, country: "IN" },
  { rank: 3, name: "Rahul Verma", avatar: "RV", points: 4390, streak: 32, courses: 24, change: 1, country: "IN" },
  { rank: 4, name: "Sneha Reddy", avatar: "SR", points: 4150, streak: 28, courses: 22, change: 3, country: "IN" },
  { rank: 5, name: "Vikram Singh", avatar: "VS", points: 3980, streak: 25, courses: 21, change: -2, country: "IN" },
];

const allTimeLeaders: LeaderboardUser[] = [
  { rank: 1, name: "Ananya Patel", avatar: "AP", points: 24500, streak: 120, courses: 85, change: 0, country: "IN" },
  { rank: 2, name: "Raj Malhotra", avatar: "RM", points: 22800, streak: 95, courses: 78, change: 0, country: "IN" },
  { rank: 3, name: "Priya Sharma", avatar: "PS", points: 21500, streak: 45, courses: 72, change: 1, country: "IN" },
  { rank: 4, name: "Karthik Nair", avatar: "KN", points: 19800, streak: 60, courses: 65, change: -1, country: "IN" },
  { rank: 5, name: "Meera Iyer", avatar: "MI", points: 18400, streak: 55, courses: 58, change: 2, country: "IN" },
];

const yourStats = {
  rank: 156,
  points: 2450,
  streak: 12,
  courses: 8,
  weeklyRank: 89,
  monthlyRank: 120,
  change: 12,
  topPercent: 98.7
};

export default function Leaderboard() {
  const [timeframe, setTimeframe] = React.useState<"weekly" | "monthly" | "allTime">("weekly");

  const leaders = timeframe === "allTime" ? allTimeLeaders : (timeframe === "monthly" ? allTimeLeaders.slice(0, 4) : weeklyLeaders);

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

  useEffect(() => {
    document.title = `Leaderboard ✦ ${siteConfig.name}`;
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 sm:p-4 bg-white/20 rounded-full">
                    <User size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Your Current Rank</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl sm:text-4xl font-bold">#{yourStats.rank}</span>
                      <div className="flex items-center gap-1 text-green-300 bg-white/10 px-2 py-1 rounded-full text-sm">
                        <ArrowUp size={14} />
                        {yourStats.change}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Flame className="mx-auto text-orange-300 mb-1" size={20} />
                    <p className="text-2xl font-bold">{yourStats.streak}</p>
                    <p className="text-xs text-white/70">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Star className="mx-auto text-yellow-300 mb-1" size={20} />
                    <p className="text-2xl font-bold">{yourStats.points.toLocaleString()}</p>
                    <p className="text-xs text-white/70">Points</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Award className="mx-auto text-blue-300 mb-1" size={20} />
                    <p className="text-2xl font-bold">{yourStats.courses}</p>
                    <p className="text-xs text-white/70">Courses</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Target className="mx-auto text-purple-300 mb-1" size={20} />
                    <p className="text-2xl font-bold">{yourStats.topPercent}%</p>
                    <p className="text-xs text-white/70">Top Percent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-6">
          <div className="flex gap-2 justify-center">
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {timeframe !== "allTime" && (
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/5 dark:to-yellow-500/5 p-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="text-amber-500" size={20} />
                  Top 3 This {timeframe === "weekly" ? "Week" : "Month"}
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-center items-end gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-xl font-bold mx-auto mb-2 ring-4 ring-slate-300 dark:ring-slate-500 shadow-lg">
                        {leaders[1].avatar}
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</div>
                    </div>
                    <p className="font-semibold text-sm mt-2">{leaders[1].name}</p>
                    <p className="text-sm font-bold text-primary">{leaders[1].points.toLocaleString()} pts</p>
                    <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" />{leaders[1].streak}</span>
                      <span className="flex items-center gap-1"><BookOpen size={12} />{leaders[1].courses}</span>
                    </div>
                    <div className="mt-3 w-16 h-20 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500 rounded-t-xl mx-auto flex items-end justify-center pb-2 shadow-md">
                      <Medal className="text-slate-400 -mt-5 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm" size={20} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-2xl font-bold mx-auto mb-2 ring-4 ring-yellow-400 shadow-lg shadow-yellow-500/20">
                        {leaders[0].avatar}
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">1</div>
                    </div>
                    <p className="font-bold text-base mt-2 text-amber-600 dark:text-amber-400">{leaders[0].name}</p>
                    <p className="text-sm font-bold text-primary">{leaders[0].points.toLocaleString()} pts</p>
                    <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" />{leaders[0].streak}</span>
                      <span className="flex items-center gap-1"><BookOpen size={12} />{leaders[0].courses}</span>
                    </div>
                    <div className="mt-3 w-20 h-24 bg-gradient-to-t from-yellow-400 to-amber-300 rounded-t-xl mx-auto flex items-end justify-center pb-2 shadow-lg shadow-yellow-500/20">
                      <Crown className="text-white -mt-6 bg-yellow-500 rounded-full p-1 shadow-sm" size={24} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 dark:from-amber-600 dark:to-orange-600 flex items-center justify-center text-xl font-bold mx-auto mb-2 ring-4 ring-amber-300 dark:ring-amber-500 shadow-lg">
                        {leaders[2].avatar}
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</div>
                    </div>
                    <p className="font-semibold text-sm mt-2">{leaders[2].name}</p>
                    <p className="text-sm font-bold text-primary">{leaders[2].points.toLocaleString()} pts</p>
                    <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" />{leaders[2].streak}</span>
                      <span className="flex items-center gap-1"><BookOpen size={12} />{leaders[2].courses}</span>
                    </div>
                    <div className="mt-3 w-16 h-16 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-xl mx-auto flex items-end justify-center pb-2 shadow-md">
                      <Medal className="text-white -mt-5 bg-amber-600 rounded-full p-0.5 shadow-sm" size={18} />
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
                    key={user.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.rank === 156 ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800" : "hover:bg-muted/50"
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
                    {user.rank === 156 && (
                      <Badge variant="default" className="shrink-0">You</Badge>
                    )}
                  </motion.div>
                ))}
              </div>

              {timeframe !== "allTime" && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Goal</p>
                      <p className="font-medium">Reach Top 50</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Points needed</p>
                      <p className="font-bold text-primary">550</p>
                    </div>
                  </div>
                  <Progress value={78} className="mt-3 h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Earn 550 more points to reach top 50 this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function BookOpen({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
