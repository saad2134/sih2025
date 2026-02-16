"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Sparkles, 
  Brain,
  Target,
  Zap,
  Award,
  AlertCircle,
  ChevronRight,
  Star,
  Briefcase,
  GraduationCap,
  Timer,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

const CourseRecommendationPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="bg-card rounded-2xl p-4 sm:p-8 border">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground">Your Personalized Learning Path</h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Curated based on your visual-practical learning style • Project-focused approach • Career goals in Tech
        </p>
      </div>

      <div className="bg-card rounded-xl border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Your Learning Profile</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-primary">Visual</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Primary Style</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-primary">Hands-On</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Learning Mode</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-primary">Fast</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Pace Preference</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-primary">2-3hrs</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Session Length</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sampleCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            isExpanded={selectedCourse === course.id}
            onToggle={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
          />
        ))}
      </div>
    </div>
  );
};

const CourseCard: React.FC<{
  course: CourseRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ course, isExpanded, onToggle }) => {
  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden border">
      <div className="bg-gradient-to-r from-[#3C0061] to-[#5a1a8a] px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
          <span className="font-bold text-white text-sm sm:text-lg">{course.matchScore}% Match Score</span>
          <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">- Perfect for your learning style!</span>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-2 sm:px-3 py-1 rounded-full">
          <TrendingUp className="w-3 h-4 text-white" />
          <span className="text-xs sm:text-sm font-semibold text-white">{course.jobDemand.trend} Demand</span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
          <div className="flex-shrink-0">
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:items-start justify-between mb-2 gap-2">
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-card-foreground">{course.title}</h3>
                <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                    {course.instructor}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{course.platform}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    {course.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Avg Salary</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">${(course.avgSalary.entry / 1000).toFixed(0)}k-${(course.avgSalary.senior / 1000).toFixed(0)}k</div>
                <div className="text-xs text-muted-foreground">Entry to Senior</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Job Openings</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">{(course.jobDemand.openings / 1000).toFixed(1)}k+</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{course.jobDemand.demandMultiplier}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Time to Complete</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">{course.personalizedHours}hrs</div>
                <div className="text-xs text-muted-foreground">Based on your pace</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-semibold text-card-foreground text-sm sm:text-base">Learning Style Compatibility</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(course.learningStyleFit).map(([style, score]) => (
              <div key={style}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs sm:text-sm font-bold capitalize text-gray-700 dark:text-gray-300">{style}</span>
                  <span className="text-xs sm:text-sm font-bold text-card-foreground">{score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-semibold text-card-foreground text-sm sm:text-base">Content Breakdown</span>
            </div>
            <div className="space-y-2">
              {Object.entries(course.contentMix).map(([type, percentage]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm capitalize text-muted-foreground">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-card-foreground w-8 sm:w-10 text-right">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {course.technicalBreakdown && (
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="font-semibold text-card-foreground text-sm sm:text-base">Technical Requirements</span>
              </div>
              <div className="space-y-2">
                {Object.entries(course.technicalBreakdown).map(([type, percentage]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm capitalize text-muted-foreground">
                      {type}
                      {type === 'math' && percentage > 50 && ' ⚠️'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-24 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            type === 'math' && percentage > 50 ? 'bg-orange-500' : 'bg-primary'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-card-foreground w-8 sm:w-10 text-right">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {course.insights.map((insight, index) => (
            <div 
              key={index}
              className={`flex items-start gap-2 p-2 sm:p-3 rounded-lg ${
                insight.type === 'warning' 
                  ? 'bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800' 
                  : insight.type === 'highlight'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {insight.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              ) : insight.type === 'highlight' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-xs sm:text-sm text-card-foreground">{insight.message}</span>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-card-foreground text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-primary" />
                Skills You'll Gain
              </h4>
              <div className="flex flex-wrap gap-2">
                {course.skillsGained.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-card-foreground text-sm sm:text-base">
                <BookOpen className="w-4 h-4 text-primary" />
                Portfolio Projects
              </h4>
              <ul className="space-y-1">
                {course.projectOutcomes.map((project, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-card-foreground">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    {project}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1">Cost</div>
                <div className="font-semibold text-card-foreground">{course.studentFriendly.affordability}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1">Schedule</div>
                <div className="font-semibold text-card-foreground">{course.studentFriendly.schedule}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1">Support</div>
                <div className="font-semibold text-card-foreground">{course.studentFriendly.supportQuality}/10</div>
              </div>
            </div>

            {course.prerequisites.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-card-foreground text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Prerequisites
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map((prereq, index) => (
                    <span 
                      key={index}
                      className="bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Student Completion Rate</span>
                <span className="font-bold text-card-foreground">{course.completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button className="flex-1 bg-primary text-primary-foreground py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Learning
          </button>
          <button 
            onClick={onToggle}
            className="bg-secondary text-secondary-foreground py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isExpanded ? 'Show Less' : 'View Details'}
            <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseRecommendationPage;
