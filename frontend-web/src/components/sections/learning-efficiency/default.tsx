'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Section } from '@/components/ui/section';
import { Search, Brain, Target, Zap, CheckCircle, Clock, Sparkles, BookOpen, ChevronDown, Award } from 'lucide-react';

interface ScrollProgressState {
  progress: number;
  stage: 'IDLE' | 'SEARCHING' | 'LEARNING_BEHAVIOR' | 'PERSONALISING' | 'OPTIMISED';
}

const STAGE_LABELS = {
  IDLE: 'Searching for a course...',
  SEARCHING: 'Initial search - Low precision',
  LEARNING_BEHAVIOR: 'System analyzing behavior...',
  PERSONALISING: 'Personalized results appearing',
  OPTIMISED: 'Optimized learning outcome!',
};

const STAGE_MESSAGES = {
  IDLE: 'Start scrolling to see how our AI learns from you',
  SEARCHING: 'Many courses appear with mixed relevance',
  LEARNING_BEHAVIOR: 'AI observes your patterns and preferences',
  PERSONALISING: 'Results refine based on your behavior',
  OPTIMISED: 'Smarter search → Faster learning → Better outcomes',
};

const COURSE_CARDS = [
  { id: 1, title: 'Python Basics', relevance: 0.2 },
  { id: 2, title: 'Web Dev', relevance: 0.3 },
  { id: 3, title: 'Data Science', relevance: 0.4 },
  { id: 4, title: 'Machine Learning', relevance: 0.5 },
  { id: 5, title: 'Cloud Computing', relevance: 0.3 },
  { id: 6, title: 'React JS', relevance: 0.6 },
  { id: 7, title: 'AI Fundamentals', relevance: 0.7 },
  { id: 8, title: 'Your Perfect Match', relevance: 1, highlighted: true },
];

const PERSONALIZED_COURSES = [
  { id: 1, title: 'Advanced React Patterns', match: 98, path: 'Frontend' },
  { id: 2, title: 'TypeScript Mastery', match: 95, path: 'Frontend' },
  { id: 3, title: 'Next.js Full Stack', match: 92, path: 'Frontend' },
];

const LEARNING_PATH = [
  { week: 1, title: 'React Fundamentals', progress: 100 },
  { week: 2, title: 'State Management', progress: 85 },
  { week: 3, title: 'Advanced Patterns', progress: 40, current: true },
  { week: 4, title: 'Testing & Deployment', progress: 0, locked: true },
];

export default function LearningEfficiency() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressValue = useMotionValue(0);
  const [state, setState] = useState<ScrollProgressState>({
    progress: 0,
    stage: 'IDLE',
  });

  const updateProgress = useCallback((value: number) => {
    const progress = Math.max(0, Math.min(1, value));

    let stage: ScrollProgressState['stage'];
    if (progress < 0.1) {
      stage = 'IDLE';
    } else if (progress < 0.3) {
      stage = 'SEARCHING';
    } else if (progress < 0.55) {
      stage = 'LEARNING_BEHAVIOR';
    } else if (progress < 0.8) {
      stage = 'PERSONALISING';
    } else {
      stage = 'OPTIMISED';
    }

    setState({ progress, stage });
    progressValue.set(progress);
  }, [progressValue]);

  const getRelevanceScore = () => {
    switch (state.stage) {
      case 'IDLE': return 0;
      case 'SEARCHING': return Math.round(20 + state.progress * 80);
      case 'LEARNING_BEHAVIOR': return Math.round(35 + (state.progress - 0.3) * 200);
      case 'PERSONALISING': return Math.round(60 + (state.progress - 0.55) * 160);
      case 'OPTIMISED': return Math.round(92 + (state.progress - 0.8) * 32);
    }
  };

  const getTimeToFind = () => {
    switch (state.stage) {
      case 'IDLE': return '--';
      case 'SEARCHING': return Math.round(45 - state.progress * 20) + 's';
      case 'LEARNING_BEHAVIOR': return Math.round(25 - (state.progress - 0.3) * 60) + 's';
      case 'PERSONALISING': return Math.round(12 - (state.progress - 0.55) * 30) + 's';
      case 'OPTIMISED': return Math.round(3 + (0.8 - state.progress) * 12) + 's';
    }
  };

  const getEfficiency = () => {
    return Math.round(getRelevanceScore() * 0.85);
  };

  const getTimeSaved = () => {
    switch (state.stage) {
      case 'IDLE': return 0;
      case 'SEARCHING': return Math.round(state.progress * 20);
      case 'LEARNING_BEHAVIOR': return Math.round(20 + (state.progress - 0.3) * 80);
      case 'PERSONALISING': return Math.round(40 + (state.progress - 0.55) * 120);
      case 'OPTIMISED': return Math.round(70 + (state.progress - 0.8) * 80);
    }
  };

  const getIntelligenceLevel = () => {
    switch (state.stage) {
      case 'IDLE': return 0;
      case 'SEARCHING': return 10;
      case 'LEARNING_BEHAVIOR': return Math.round(10 + (state.progress - 0.3) * 120);
      case 'PERSONALISING': return Math.round(40 + (state.progress - 0.55) * 100);
      case 'OPTIMISED': return Math.round(90 + (state.progress - 0.8) * 40);
    }
  };

  const showInitialSearch = state.stage !== 'IDLE';
  const showAnalysis = state.stage === 'LEARNING_BEHAVIOR' || state.stage === 'PERSONALISING' || state.stage === 'OPTIMISED';
  const showPersonalized = state.stage === 'PERSONALISING' || state.stage === 'OPTIMISED';
  const showOptimized = state.stage === 'OPTIMISED';

  return (
    <Section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 h-24 w-24 rounded-full bg-primary/20 dark:bg-primary/15 blur-xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-secondary/20 dark:bg-secondary/15 blur-xl"
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 h-20 w-20 rounded-full bg-accent/15 dark:bg-accent/10 blur-lg"
          animate={{
            x: [0, -15, 15, 0],
            y: [0, -10, 10, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      <div
        ref={containerRef}
        className="relative min-h-screen"
      >
        <div className="absolute inset-0 " />

        <div className="relative z-10 h-full flex flex-col  px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="scroll-m-20 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[oklch(0.55_0.18_290)] via-[oklch(0.65_0.16_290)] to-[oklch(0.55_0.18_290)] animate-gradient-x leading-[1.3] transition-transform duration-300 hover:scale-105 cursor-default">
                How Our AI Learns Your Style
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-6 sm:text-xl md:text-2xl lg:text-3xl">
                Watch as our pathway engine analyzes your behavior and optimizes your learning journey in real-time!
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center mt-4 animate-bounce">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col items-center mb-6">
            <p className="text-xl text-muted-foreground mb-4">
              Drag the slider to explore how our AI learns
            </p>
            <div className="relative w-full max-w-md">
              <div className="relative h-2 md:h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.progress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={state.progress * 100}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) / 100;
                  updateProgress(value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <motion.div
                className="absolute top-1/8 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full shadow-lg flex items-center justify-center pointer-events-none"
                style={{ left: `${state.progress * 100}%`, marginLeft: state.progress > 0 && state.progress < 100 ? '-24px' : '-12px' }}
              >
                <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
              </motion.div>

              <div className="flex justify-between mt-4 text-[20px] text-muted-foreground">
                <span>Start</span>
                <span>Complete</span>
              </div>
            </div>


          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-4 ">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-500",
                    state.stage === 'IDLE' && "bg-muted text-muted-foreground",
                    state.stage === 'SEARCHING' && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                    state.stage === 'LEARNING_BEHAVIOR' && "bg-blue-500/20 text-blue-600 dark:text-blue-400",
                    state.stage === 'PERSONALISING' && "bg-purple-500/20 text-purple-600 dark:text-purple-400",
                    state.stage === 'OPTIMISED' && "bg-green-500/20 text-green-600 dark:text-green-400"
                  )}>
                    {state.stage === 'IDLE' && <Search className="w-4 h-4 inline-block mr-2" />}
                    {state.stage === 'SEARCHING' && <Search className="w-4 h-4 inline-block mr-2" />}
                    {state.stage === 'LEARNING_BEHAVIOR' && <Brain className="w-4 h-4 inline-block mr-2" />}
                    {state.stage === 'PERSONALISING' && <Target className="w-4 h-4 inline-block mr-2" />}
                    {state.stage === 'OPTIMISED' && <Zap className="w-4 h-4 inline-block mr-2" />}
                    {STAGE_LABELS[state.stage]}
                  </div>
                </div>

                <div className={cn(
                  "p-4 md:p-5 rounded-xl bg-card border transition-all duration-500 ",
                  showOptimized ? "border-green-500/30 shadow-lg shadow-green-500/10 " : "border-border"
                )}>
                  <div className="space-y-3 ">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-10 md:h-11 bg-muted rounded-lg flex items-center px-3 gap-2">
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground text-sm truncate">Search courses...</span>
                        <span className="ml-auto animate-pulse shrink-0">|</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium">{STAGE_MESSAGES[state.stage]}</p>

                    {showInitialSearch && (
                      <motion.div
                        className="grid grid-cols-2 gap-2"
                        initial={false}
                        animate={{
                          opacity: showPersonalized ? 0 : 1,
                          scale: showPersonalized ? 0.95 : 1
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ display: showPersonalized ? 'none' : 'grid' }}
                      >
                        {COURSE_CARDS.slice(0, showAnalysis ? 8 : 6).map((course, index) => (
                          <motion.div
                            key={course.id}
                            className={cn(
                              "p-2 rounded-lg text-xs border transition-colors duration-300",
                              course.relevance > 0.6 ? "bg-green-500/10 border-green-500/30" :
                                course.relevance > 0.4 ? "bg-amber-500/10 border-amber-500/30" :
                                  "bg-red-500/10 border-red-500/30"
                            )}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: showAnalysis ? Math.min(1, course.relevance + 0.3) : 0.7,
                              y: 0
                            }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                              ease: "easeOut"
                            }}
                          >
                            <span className="font-medium">{course.title}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {showPersonalized && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {PERSONALIZED_COURSES.map((course, i) => (
                          <motion.div
                            key={course.id}
                            className={cn(
                              "p-2.5 rounded-lg border bg-gradient-to-r",
                              course.match > 90 ? "from-green-500/20 to-transparent border-green-500/40" :
                                "from-purple-500/20 to-transparent border-purple-500/40"
                            )}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: i * 0.1,
                              ease: "easeOut"
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{course.title}</p>
                                <p className="text-xs text-muted-foreground">{course.path}</p>
                              </div>
                              <span className="text-lg font-bold text-green-500">{course.match}%</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {showOptimized && (
                      <motion.div
                        className="space-y-2 pt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <p className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-green-500" />
                          Your Learning Path
                        </p>
                        {LEARNING_PATH.map((item, i) => (
                          <motion.div
                            key={i}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg",
                              item.locked ? "opacity-40" : "opacity-100"
                            )}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: item.locked ? 0.4 : 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: i * 0.08,
                              ease: "easeOut"
                            }}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              item.progress === 100 ? "bg-green-500 text-white" :
                                item.current ? "bg-primary text-primary-foreground" :
                                  "bg-muted text-muted-foreground"
                            )}>
                              {item.progress === 100 ? <CheckCircle className="w-3 h-3" /> : item.week}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.title}</p>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                <motion.div
                                  className="h-full bg-primary rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.progress}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                            {item.current && (
                              <Sparkles className="w-3 h-3 text-primary animate-pulse shrink-0" />
                            )}
                          </motion.div>
                        ))}

                        <motion.div
                          className="flex flex-wrap gap-1.5 pt-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        >
                          {['React Pro', 'Fast Learner'].map((badge) => (
                            <div
                              key={badge}
                              className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-xs"
                            >
                              <Award className="w-3 h-3" />
                              {badge}
                            </div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 md:p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Relevance</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">{getRelevanceScore()}%</div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getRelevanceScore()}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="p-3 md:p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Time</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">{getTimeToFind()}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">vs 45s avg</p>
                  </div>

                  <div className="p-3 md:p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-muted-foreground">Saved</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-green-500">+{getTimeSaved()}s</div>
                  </div>

                  <div className="p-3 md:p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Brain className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs text-muted-foreground">AI Level</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-purple-500">{getIntelligenceLevel()}%</div>
                  </div>
                </div>

                <div className="p-4 md:p-5 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    Efficiency Score
                  </h3>

                  <div className="relative h-28 md:h-32 flex items-center justify-center overflow-hidden">
                    <svg className="w-40 h-20 md:w-48 md:h-24" viewBox="0 0 120 60" preserveAspectRatio="xMidYMid meet">
                      <path
                        d="M 15 55 A 45 45 0 0 1 105 55"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="text-muted/30"
                      />
                      <motion.path
                        d="M 15 55 A 45 45 0 0 1 105 55"
                        fill="none"
                        stroke="url(#efficiencyGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 141' }}
                        animate={{ strokeDasharray: `${(getEfficiency() / 100) * 141} 141` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--chart-5))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-1">
                      <span className="text-3xl md:text-4xl font-bold">{getEfficiency()}%</span>
                    </div>
                  </div>
                </div>

                {showOptimized && (
                  <motion.div
                    className={cn(
                      "p-3 rounded-lg border text-center",
                      "bg-green-500/20 border-green-500/40"
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <p className="text-sm font-semibold text-green-500 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {STAGE_MESSAGES.OPTIMISED}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
    </Section>
  );
}
