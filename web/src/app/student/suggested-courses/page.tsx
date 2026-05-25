"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  Target,
  AlertCircle,
  CheckCircle2,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Play,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { siteConfig } from "@/config/site";

interface CourseRecommendation {
  id: string;
  title: string;
  platform: string;
  instructor: string;
  thumbnail: string;
  matchScore: number;
  learningStyleFit: {
    visual: number;
    practical: number;
    theoretical: number;
    interactive: number;
  };
  pedagogicalApproach: string;
  pace: 'Fast' | 'Moderate' | 'Relaxed';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  contentMix: {
    video: number;
    handson: number;
    reading: number;
    quizzes: number;
  };
  technicalBreakdown?: {
    math: number;
    coding: number;
    theory: number;
    systems: number;
  };
  estimatedHours: number;
  personalizedHours: number;
  idealSessionLength: string;
  avgSalary: {
    entry: number;
    mid: number;
    senior: number;
  };
  jobDemand: {
    trend: 'High' | 'Growing' | 'Moderate' | 'Declining';
    openings: number;
    demandMultiplier?: string;
  };
  skillsGained: string[];
  projectOutcomes: string[];
  certificationValue: 'High' | 'Moderate' | 'Low';
  prerequisites: string[];
  completionRate: number;
  studentFriendly: {
    affordability: 'Free' | 'Budget' | 'Premium';
    schedule: 'Self-paced' | 'Deadline-driven';
    supportQuality: number;
  };
  insights: {
    type: 'warning' | 'tip' | 'highlight';
    message: string;
  }[];
  url?: string;
}

const sampleCourses: CourseRecommendation[] = [
  {
    id: '1',
    title: 'Machine Learning A-Z: Hands-On Python & R In Data Science',
    platform: 'Udemy',
    instructor: 'Kirill Eremenko',
    thumbnail: '/api/placeholder/400/225',
    matchScore: 94,
    learningStyleFit: {
      visual: 85,
      practical: 95,
      theoretical: 70,
      interactive: 90
    },
    pedagogicalApproach: 'Example-driven, Bottom-up',
    pace: 'Moderate',
    difficulty: 'Beginner',
    contentMix: {
      video: 45,
      handson: 40,
      reading: 10,
      quizzes: 5
    },
    technicalBreakdown: {
      math: 35,
      coding: 45,
      theory: 15,
      systems: 5
    },
    estimatedHours: 44,
    personalizedHours: 38,
    idealSessionLength: '2-3 hour sessions',
    avgSalary: {
      entry: 85000,
      mid: 125000,
      senior: 165000
    },
    jobDemand: {
      trend: 'High',
      openings: 12500,
      demandMultiplier: '5x growth in last 2 years'
    },
    skillsGained: [
      'Supervised & Unsupervised Learning',
      'Neural Networks',
      'Model Evaluation',
      'Feature Engineering',
      'Python/R for ML'
    ],
    projectOutcomes: [
      'Customer Churn Predictor',
      'Recommendation System',
      'Image Classification Model'
    ],
    certificationValue: 'High',
    prerequisites: ['Basic Python', 'High School Math'],
    completionRate: 68,
    studentFriendly: {
      affordability: 'Budget',
      schedule: 'Self-paced',
      supportQuality: 8
    },
    insights: [
      {
        type: 'highlight',
        message: 'Perfect match for your hands-on learning style - 95% practical work'
      },
      {
        type: 'tip',
        message: 'Only 35% math - lighter than most ML courses, great for beginners'
      },
      {
        type: 'warning',
        message: 'Some Python knowledge recommended - take Python basics first if new'
      }
    ]
  },
  {
    id: '2',
    title: 'React - The Complete Guide 2024',
    platform: 'Udemy',
    instructor: 'Maximilian Schwarzmüller',
    thumbnail: '/api/placeholder/400/225',
    matchScore: 92,
    learningStyleFit: {
      visual: 80,
      practical: 90,
      theoretical: 65,
      interactive: 85
    },
    pedagogicalApproach: 'Project-based, Incremental',
    pace: 'Fast',
    difficulty: 'Beginner',
    contentMix: {
      video: 50,
      handson: 45,
      reading: 3,
      quizzes: 2
    },
    estimatedHours: 48,
    personalizedHours: 42,
    idealSessionLength: '1-2 hour sessions',
    avgSalary: {
      entry: 75000,
      mid: 110000,
      senior: 145000
    },
    jobDemand: {
      trend: 'High',
      openings: 18700,
      demandMultiplier: '3x more jobs than Angular in your area'
    },
    skillsGained: [
      'React Hooks & Components',
      'State Management (Redux)',
      'Next.js',
      'Testing & Optimization',
      'Modern JavaScript'
    ],
    projectOutcomes: [
      'Full-Stack E-commerce App',
      'Social Media Dashboard',
      'Real-time Chat Application'
    ],
    certificationValue: 'Moderate',
    prerequisites: ['HTML/CSS', 'JavaScript Basics'],
    completionRate: 72,
    studentFriendly: {
      affordability: 'Budget',
      schedule: 'Self-paced',
      supportQuality: 9
    },
    insights: [
      {
        type: 'highlight',
        message: '3x more React jobs than Angular - highest ROI for frontend development'
      },
      {
        type: 'highlight',
        message: 'Fast-paced fits your learning preference - you finish courses 15% quicker'
      },
      {
        type: 'tip',
        message: '3 portfolio-ready projects - directly hireable after completion'
      }
    ]
  },
  {
    id: '3',
    title: 'Deep Learning Specialization',
    platform: 'Coursera',
    instructor: 'Andrew Ng',
    thumbnail: '/api/placeholder/400/225',
    matchScore: 78,
    learningStyleFit: {
      visual: 70,
      practical: 60,
      theoretical: 90,
      interactive: 55
    },
    pedagogicalApproach: 'Theory-first, Top-down',
    pace: 'Moderate',
    difficulty: 'Advanced',
    contentMix: {
      video: 60,
      handson: 25,
      reading: 10,
      quizzes: 5
    },
    technicalBreakdown: {
      math: 65,
      coding: 20,
      theory: 10,
      systems: 5
    },
    estimatedHours: 120,
    personalizedHours: 145,
    idealSessionLength: '1-1.5 hour sessions',
    avgSalary: {
      entry: 95000,
      mid: 140000,
      senior: 185000
    },
    jobDemand: {
      trend: 'Growing',
      openings: 8200,
      demandMultiplier: '40% growth year-over-year'
    },
    skillsGained: [
      'Neural Network Architecture',
      'CNN & RNN',
      'Transformers',
      'Hyperparameter Tuning',
      'TensorFlow'
    ],
    projectOutcomes: [
      'Image Recognition System',
      'NLP Sentiment Analyzer',
      'Autonomous Car Vision'
    ],
    certificationValue: 'High',
    prerequisites: ['Linear Algebra', 'Calculus', 'Python', 'ML Basics'],
    completionRate: 45,
    studentFriendly: {
      affordability: 'Premium',
      schedule: 'Deadline-driven',
      supportQuality: 7
    },
    insights: [
      {
        type: 'warning',
        message: '65% math content - higher than your typical preference. Consider ML fundamentals first.'
      },
      {
        type: 'warning',
        message: 'Theory-heavy (90%) - may not match your hands-on learning style perfectly'
      },
      {
        type: 'tip',
        message: 'Industry gold standard certification - worth the challenge for career impact'
      }
    ]
  }
];

const sortOptions = [
  { value: "match", label: "Best Match" },
  { value: "rating", label: "Highest Rated" },
  { value: "salary-high", label: "Highest Salary" },
  { value: "duration", label: "Shortest Duration" },
  { value: "popular", label: "Most Popular" },
];

const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const paces = ["All", "Fast", "Moderate", "Relaxed"];
const durations = ["All", "Under 10 hours", "10-25 hours", "25-50 hours", "50+ hours"];
const priceTypes = ["All", "Free", "Budget", "Premium"];
const platforms = ["All", "Udemy", "Coursera", "edX", "LinkedIn Learning"];

import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';

const CourseRecommendationPage: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [enrolDialogOpen, setEnrolDialogOpen] = useState(false);
  const [enrolCourseId, setEnrolCourseId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };
  const [sortBy, setSortBy] = useState("match");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedPace, setSelectedPace] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({
    styleText: "visual-practical",
    primaryStyle: "Visual",
    learningMode: "Hands-On",
    pacePreference: "Fast",
    sessionLength: "2-3hrs"
  });

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, profileRes] = await Promise.all([
        apiService.getRecommendations(),
        apiService.getLearnerProfile().catch(() => ({ success: false, data: null }))
      ]);

      if (profileRes.success && profileRes.data) {
        const p = profileRes.data;
        const vark = p.vark_scores || { v: 0.25, a: 0.25, r: 0.25, k: 0.25 };
        const varkMap = [
          { key: 'visual', label: 'Visual', score: vark.v || 0 },
          { key: 'auditory', label: 'Auditory', score: vark.a || 0 },
          { key: 'reading', label: 'Read/Write', score: vark.r || 0 },
          { key: 'practical', label: 'Practical', score: vark.k || 0 }
        ];
        varkMap.sort((a, b) => b.score - a.score);
        const primaryStyle = varkMap[0].label;
        const styleText = `${varkMap[0].key}-${varkMap[1].key}`;
        
        const prefs = p.style_preferences || [];
        let learningMode = "Hands-On";
        if (prefs.includes("videos")) {
          learningMode = "Videos";
        } else if (prefs.includes("reading")) {
          learningMode = "Articles";
        } else if (prefs.includes("quizzes")) {
          learningMode = "Quizzes";
        } else if (prefs.includes("projects")) {
          learningMode = "Hands-On";
        }
        
        const hours = p.hours_per_week || 10;
        let pacePreference = "Moderate";
        let sessionLength = "1-2hrs";
        
        if (hours >= 35) {
          pacePreference = "Fast";
          sessionLength = "3-4hrs";
        } else if (hours >= 20) {
          pacePreference = "Fast";
          sessionLength = "2-3hrs";
        } else if (hours >= 10) {
          pacePreference = "Moderate";
          sessionLength = "1-2hrs";
        } else {
          pacePreference = "Relaxed";
          sessionLength = "30-45m";
        }
        
        setProfileData({
          styleText,
          primaryStyle,
          learningMode,
          pacePreference,
          sessionLength
        });
      }

      if (res.success && res.data) {
        const savedRes = await apiService.getSavedCourses();
        const savedIds = savedRes.success && savedRes.data ? savedRes.data.map(item => String(item.id)) : [];
        setBookmarkedCourses(savedIds);

        const items = ((res.data as any).items || []).map((rec: any) => {
          const c = rec.course || rec;
          const mr = c.match_report || rec.match_report || {};
          
          const learningStyleFit = {
            visual: Math.round((c.vark_v_score || 0.25) * 100),
            practical: Math.round((c.vark_k_score || 0.25) * 100),
            theoretical: Math.round((c.vark_r_score || 0.25) * 100),
            interactive: Math.round((c.vark_a_score || 0.25) * 100),
          };

          const insights = (mr.warnings || []).map((w: any) => ({
            type: 'warning',
            message: w.message
          }));
          if (c.nsqf_level > 0) {
            insights.push({
              type: 'highlight',
              message: `NSQF Level ${c.nsqf_level} aligned course - matches qualification standards`
            });
          }
          if (learningStyleFit.practical > 45) {
            insights.push({
              type: 'highlight',
              message: `High practical style fit (${learningStyleFit.practical}%) - excellent for hands-on learning`
            });
          }
          if (insights.length === 0) {
            insights.push({
              type: 'highlight',
              message: 'Personalized match for your VARK learning profile'
            });
          }

          return {
            id: String(c.id),
            title: c.title,
            platform: c.provider,
            instructor: c.provider === "NCVET" ? "NCVET Board" : "Web Instructor",
            thumbnail: '/api/placeholder/400/225',
            matchScore: typeof mr.overall_match_pct === 'number' ? mr.overall_match_pct : 75,
            learningStyleFit,
            pedagogicalApproach: mr.why_this_ranking || 'Aligned curriculum',
            pace: c.hours_per_week > 8 ? 'Fast' : c.hours_per_week > 4 ? 'Moderate' : 'Relaxed',
            difficulty: c.difficulty ? c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1) : 'Beginner',
            contentMix: {
              video: Math.round((c.vark_v_score || 0.25) * 100),
              handson: Math.round((c.vark_k_score || 0.25) * 100),
              reading: Math.round((c.vark_r_score || 0.25) * 100),
              quizzes: Math.round((c.vark_a_score || 0.25) * 100),
            },
            estimatedHours: c.total_hours || 40,
            personalizedHours: c.total_hours || 40,
            idealSessionLength: '1-2 hour sessions',
            avgSalary: {
              entry: 500000,
              mid: 900000,
              senior: 1500000,
            },
            jobDemand: {
              trend: c.nsqf_level > 0 ? 'High' : 'Growing',
              openings: 12500,
            },
            skillsGained: c.style_tags || [],
            projectOutcomes: c.job_roles || ['Portfolio Project'],
            certificationValue: c.nsqf_level > 0 ? 'High' : 'Moderate',
            prerequisites: c.prerequisites || [],
            completionRate: Math.round(c.completion_rate || 72),
            studentFriendly: {
              affordability: c.nsqf_level > 0 ? 'Free' : 'Budget',
              schedule: 'Self-paced',
              supportQuality: 8,
            },
            insights: insights,
            url: c.url || '#',
          };
        });
        setCourses(items);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror") || msg.toLowerCase().includes("api error")) {
        setError('Cannot reach backend');
      } else {
        setError('Failed to load course recommendations.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const toggleBookmark = async (courseId: string) => {
    const isBookmarked = bookmarkedCourses.includes(courseId);
    try {
      if (isBookmarked) {
        await apiService.unsaveCourse(courseId);
        setBookmarkedCourses(prev => prev.filter(id => id !== courseId));
      } else {
        await apiService.saveCourse(courseId);
        setBookmarkedCourses(prev => [...prev, courseId]);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const handleEnrol = (courseId: string) => {
    setEnrolCourseId(courseId);
    setEnrolDialogOpen(true);
  };

  const confirmEnrol = async () => {
    if (!enrolCourseId) return;
    setEnrolDialogOpen(false);
    try {
      setLoading(true);
      const res = await apiService.enrolInCourse(enrolCourseId);
      if (res.success) {
        showToast("Enrolled successfully! Redirecting to your Career Map...", "success");
        setTimeout(() => {
          router.push('/student/career-map');
        }, 1500);
      } else {
        showToast("Enrolment failed. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to enroll in course", err);
      showToast("Enrolment failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLevel("All");
    setSelectedPace("All");
    setSelectedDuration("All");
    setSelectedPrice("All");
    setSelectedPlatform("All");
    setSortBy("match");
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || course.difficulty === selectedLevel;
    const matchesPace = selectedPace === "All" || course.pace === selectedPace;
    
    let matchesDuration = true;
    if (selectedDuration !== "All") {
      const hours = course.personalizedHours;
      if (selectedDuration === "Under 10 hours") matchesDuration = hours < 10;
      else if (selectedDuration === "10-25 hours") matchesDuration = hours >= 10 && hours <= 25;
      else if (selectedDuration === "25-50 hours") matchesDuration = hours > 25 && hours <= 50;
      else if (selectedDuration === "50+ hours") matchesDuration = hours > 50;
    }

    const matchesPrice = selectedPrice === "All" || 
      (selectedPrice === "Free" && course.studentFriendly.affordability === "Free") ||
      (selectedPrice === "Budget" && course.studentFriendly.affordability === "Budget") ||
      (selectedPrice === "Premium" && course.studentFriendly.affordability === "Premium");

    const matchesPlatform = selectedPlatform === "All" || course.platform.toLowerCase().includes(selectedPlatform.toLowerCase());

    return matchesSearch && matchesLevel && matchesPace && matchesDuration && matchesPrice && matchesPlatform;
  }).sort((a, b) => {
    switch (sortBy) {
      case "match": return b.matchScore - a.matchScore;
      case "salary-high": return b.avgSalary.entry - a.avgSalary.entry;
      case "duration": return a.personalizedHours - b.personalizedHours;
      case "popular": return b.jobDemand.openings - a.jobDemand.openings;
      default: return 0;
    }
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevel, selectedPace, selectedDuration, selectedPrice, selectedPlatform, searchQuery, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-y-3 gap-x-6">
            <div className="w-full lg:w-1/5 lg:sticky lg:top-20 lg:h-fit space-y-3">
              <div className="bg-card rounded-xl p-3 border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-card-foreground">Your Personalized Learning Path</h2>
                    {loading ? (
                      <Skeleton className="h-3 w-32 mt-1 hidden sm:block" />
                    ) : (
                      <p className="text-muted-foreground text-[10px] sm:text-xs hidden sm:block">
                        Curated based on your {profileData.styleText} learning style
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="text-center p-1.5 sm:p-2 bg-muted rounded-lg flex flex-col items-center justify-center space-y-1.5 h-[52px]">
                        <Skeleton className="h-3.5 w-12 rounded" />
                        <Skeleton className="h-2.5 w-16 rounded" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                        <div className="text-xs sm:text-sm font-bold text-primary">{profileData.primaryStyle}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground">Primary Style</div>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                        <div className="text-xs sm:text-sm font-bold text-primary">{profileData.learningMode}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground">Learning Mode</div>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                        <div className="text-xs sm:text-sm font-bold text-primary">{profileData.pacePreference}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground">Pace Preference</div>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                        <div className="text-xs sm:text-sm font-bold text-primary">{profileData.sessionLength}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground">Session Length</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="lg:hidden w-full flex items-center justify-between"
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  <span className="text-sm">Sort & Filter</span>
                </div>
                {showFilters ? <ChevronRight className="rotate-90" size={16} /> : <ChevronRight size={16} />}
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden '} lg:block space-y-3`}>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpDown size={14} />
                    <span className="text-sm font-semibold">Sort</span>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs border rounded-md px-2 py-1.5 bg-background"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Filter size={14} />
                      <span className="text-sm font-semibold">Filters</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs border" onClick={resetFilters}>
                      Reset
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Level</label>
                      <div className="flex flex-wrap gap-1.5">
                        {levels.map((level) => (
                          <Button
                            key={level}
                            variant={selectedLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedLevel(level)}
                            className="rounded-full text-xs h-6 px-2"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Pace</label>
                      <div className="flex flex-wrap gap-1.5">
                        {paces.map((pace) => (
                          <Button
                            key={pace}
                            variant={selectedPace === pace ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedPace(pace)}
                            className="text-xs h-6"
                          >
                            {pace}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Duration</label>
                      <div className="flex flex-wrap gap-1.5">
                        {durations.map((duration) => (
                          <Button
                            key={duration}
                            variant={selectedDuration === duration ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedDuration(duration)}
                            className="text-xs h-6"
                          >
                            {duration}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Price</label>
                      <div className="flex flex-wrap gap-1.5">
                        {priceTypes.map((price) => (
                          <Button
                            key={price}
                            variant={selectedPrice === price ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedPrice(price)}
                            className="text-xs h-6"
                          >
                            {price}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Platform</label>
                      <div className="flex flex-wrap gap-1.5">
                        {platforms.map((platform) => (
                          <Button
                            key={platform}
                            variant={selectedPlatform === platform ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedPlatform(platform)}
                            className="text-xs h-6"
                          >
                            {platform}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{(currentPage - 1) * coursesPerPage + 1}-{Math.min(currentPage * coursesPerPage, filteredCourses.length)}</span> of <span className="font-medium text-foreground">{filteredCourses.length}</span> recommendations
                </p>
              </div>

              {error ? (
                <div className="text-center py-12 border rounded-lg bg-card shadow-sm flex flex-col items-center justify-center p-6 w-full">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{error}</h3>
                  <p className="text-muted-foreground mb-6">Please check your network connection or make sure the server is running.</p>
                  <Button onClick={fetchRecommendations}>
                    Retry Connection
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <Card key={idx} className="h-64 flex flex-col w-full overflow-hidden p-4 space-y-4">
                          <Skeleton className="h-28 w-full rounded-lg" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-20 rounded" />
                            <Skeleton className="h-8 w-20 rounded" />
                          </div>
                        </Card>
                      ))
                    ) : (
                      paginatedCourses.map((course) => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          isExpanded={selectedCourse === course.id}
                          onToggle={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
                          isBookmarked={bookmarkedCourses.includes(course.id)}
                          onToggleBookmark={() => toggleBookmark(course.id)}
                          onEnrol={() => handleEnrol(course.id)}
                        />
                      ))
                    )}
                  </div>

                  {!loading && filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                      <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                      <Button variant="outline" onClick={resetFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </>
              )}

              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={enrolDialogOpen} onOpenChange={setEnrolDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              Do you want to enroll in this course and add it to your Learning Journey?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setEnrolDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEnrol}>
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm w-full bg-background border rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`p-1.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className="text-muted-foreground hover:text-foreground text-xs font-semibold px-2 py-1 hover:bg-muted rounded"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

const CourseCard: React.FC<{
  course: CourseRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onEnrol: () => void;
}> = ({ course, isExpanded, onToggle, isBookmarked, onToggleBookmark, onEnrol }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow w-full overflow-hidden">
      <div className="relative h-28 sm:h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-8 h-8 sm:w-12 sm:h-12 text-violet-500/50" />
        </div>
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 sm:px-3 py-1 rounded-full">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600 fill-violet-600" />
          <span className="text-xs sm:text-sm font-bold text-violet-700">{course.matchScore}% Match</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/80 hover:bg-background h-8 w-8"
          onClick={onToggleBookmark}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
          ) : (
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </Button>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          <span className="text-xs sm:text-sm font-semibold text-green-700">{course.jobDemand.trend}</span>
        </div>
      </div>

      <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm sm:text-base line-clamp-2">{course.title}</CardTitle>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="truncate">{course.instructor}</span>
          <span className="hidden sm:inline">•</span>
          <span>{course.platform}</span>
          <Badge variant="outline" className="text-[10px] sm:text-xs py-0 h-5 sm:h-6 ml-1">{course.difficulty}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 sm:space-y-3 px-3 sm:px-4 pb-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Avg Salary</div>
            <div className="text-sm sm:text-base font-bold text-card-foreground">${(course.avgSalary.entry / 1000).toFixed(0)}k-${(course.avgSalary.senior / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Job Openings</div>
            <div className="text-sm sm:text-base font-bold text-card-foreground">{(course.jobDemand.openings / 1000).toFixed(1)}k+</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Duration</div>
            <div className="text-sm sm:text-base font-bold text-card-foreground">{course.personalizedHours}hrs</div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-card-foreground">Learning Style Compatibility</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(course.learningStyleFit).map(([style, score]) => (
              <div key={style}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] sm:text-xs font-medium capitalize text-gray-700 dark:text-gray-300">{style}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-card-foreground">{score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                  <div className="h-1.5 sm:h-2 rounded-full bg-violet-500" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-card-foreground">Content Mix</span>
            </div>
            <div className="space-y-1">
              {Object.entries(course.contentMix).map(([type, percentage]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs capitalize text-muted-foreground">{type}</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-card-foreground">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {course.technicalBreakdown && (
            <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-card-foreground">Technical</span>
              </div>
              <div className="space-y-1">
                {Object.entries(course.technicalBreakdown).map(([type, percentage]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs capitalize text-muted-foreground">{type}</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-card-foreground">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {course.insights.slice(0, 2).map((insight, index) => (
            <div 
              key={index}
              className={`flex items-start gap-2 p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs ${
                insight.type === 'warning' 
                  ? 'bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800' 
                  : insight.type === 'highlight'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {insight.type === 'warning' ? (
                <AlertCircle className="w-3 h-3 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              ) : insight.type === 'highlight' ? (
                <Star className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-card-foreground line-clamp-2">{insight.message}</span>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                Skills You'll Gain
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {course.skillsGained.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs py-0 sm:py-1">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                Portfolio Projects
              </h4>
              <ul className="space-y-1">
                {course.projectOutcomes.map((project, index) => (
                  <li key={index} className="flex items-start gap-2 text-[10px] sm:text-xs text-card-foreground">
                    <Star className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    {project}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Cost</div>
                <div className="text-xs sm:text-sm font-semibold text-card-foreground">{course.studentFriendly.affordability}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Schedule</div>
                <div className="text-xs sm:text-sm font-semibold text-card-foreground">{course.studentFriendly.schedule}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Support</div>
                <div className="text-xs sm:text-sm font-semibold text-card-foreground">{course.studentFriendly.supportQuality}/10</div>
              </div>
            </div>

            {course.prerequisites.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                  Prerequisites
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {course.prerequisites.map((prereq, index) => (
                    <span 
                      key={index}
                      className="bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Student Completion Rate</span>
                <span className="text-xs sm:text-sm font-bold text-card-foreground">{course.completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-emerald-500 h-1.5 sm:h-2 rounded-full"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
          <Button className="flex-1 h-9 sm:h-10 text-xs sm:text-sm" onClick={onEnrol}>
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Start Learning
          </Button>
          {course.url && course.url !== '#' && (
            <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm px-3 gap-1.5" asChild>
              <a href={course.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                Visit Website
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={onToggle} className="h-9 sm:h-10 text-xs sm:text-sm px-3">
            {isExpanded ? 'Show Less' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseRecommendationPage;
