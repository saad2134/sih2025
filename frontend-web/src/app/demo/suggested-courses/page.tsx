"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  Target,
  AlertCircle,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const CourseRecommendationPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedPace, setSelectedPace] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>(['1']);

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  useEffect(() => {
    document.title = `Recommendations ✦ ${siteConfig.name}`;
  }, []);

  const filteredCourses = sampleCourses.filter(course => {
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLevel("All");
    setSelectedPace("All");
    setSelectedDuration("All");
    setSelectedPrice("All");
    setSelectedPlatform("All");
    setSortBy("match");
  };

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
                    <p className="text-muted-foreground text-[10px] sm:text-xs hidden sm:block">
                      Curated based on your visual-practical learning style
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                    <div className="text-xs sm:text-sm font-bold text-primary">Visual</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Primary Style</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                    <div className="text-xs sm:text-sm font-bold text-primary">Hands-On</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Learning Mode</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                    <div className="text-xs sm:text-sm font-bold text-primary">Fast</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Pace Preference</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-muted rounded-lg">
                    <div className="text-xs sm:text-sm font-bold text-primary">2-3hrs</div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">Session Length</div>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    isExpanded={selectedCourse === course.id}
                    onToggle={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
                    isBookmarked={bookmarkedCourses.includes(course.id)}
                    onToggleBookmark={() => toggleBookmark(course.id)}
                  />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
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
    </div>
  );
};

const CourseCard: React.FC<{
  course: CourseRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}> = ({ course, isExpanded, onToggle, isBookmarked, onToggleBookmark }) => {
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
          <Button className="flex-1 h-9 sm:h-10 text-xs sm:text-sm">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Start Learning
          </Button>
          <Button variant="outline" onClick={onToggle} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
            {isExpanded ? 'Show Less' : 'View Details'}
            <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseRecommendationPage;
