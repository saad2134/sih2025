"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
    Brain,
    Clock,
    Target,
    Zap,
    ChevronRight,
    Palette,
    TrendingUp,
    Search,
    Filter,
    ArrowUpDown,
    Award,
    Calendar,
    CheckCircle2,
    Bookmark,
    BookmarkCheck,
    Sparkles,
    TrendingDown,
    RotateCcw
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";

interface QuizResult {
    id: string;
    quizTitle: string;
    category: string;
    difficulty: string;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: string;
    score: number;
    date: string;
    status: 'completed' | 'in-progress' | 'not-started';
    icon: React.ReactNode;
}

const quizHistoryData: QuizResult[] = [
{
        id: '9',
        quizTitle: "Python Basics",
        category: "Programming",
        difficulty: "Beginner",
        totalQuestions: 10,
        correctAnswers: 8,
        timeTaken: "5 min",
        score: 80,
        date: "2026-06-02 15:00",
        status: "completed",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '10',
        quizTitle: "Machine Learning Intro",
        category: "AI/ML",
        difficulty: "Intermediate",
        totalQuestions: 10,
        correctAnswers: 0,
        timeTaken: "0 min",
        score: 0,
        date: "2026-06-01 12:30",
        status: "not-started",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '11',
        quizTitle: "Cloud Computing",
        category: "Cloud",
        difficulty: "Advanced",
        totalQuestions: 12,
        correctAnswers: 9,
        timeTaken: "6 min",
        score: 75,
        date: "2026-05-30 10:00",
        status: "completed",
        icon: <Zap className="w-6 h-6" />
    },
    {
        id: '12',
        quizTitle: "Data Structures",
        category: "Programming",
        difficulty: "Intermediate",
        totalQuestions: 15,
        correctAnswers: 12,
        timeTaken: "8 min",
        score: 80,
        date: "2026-05-28 14:30",
        status: "completed",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '13',
        quizTitle: "UI/UX Design",
        category: "Design",
        difficulty: "Beginner",
        totalQuestions: 8,
        correctAnswers: 7,
        timeTaken: "4 min",
        score: 88,
        date: "2026-05-25 09:00",
        status: "completed",
        icon: <Palette className="w-6 h-6" />
    },
    {
        id: '14',
        quizTitle: "Network Security",
        category: "Security",
        difficulty: "Advanced",
        totalQuestions: 20,
        correctAnswers: 15,
        timeTaken: "12 min",
        score: 75,
        date: "2026-05-22 16:00",
        status: "completed",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: '15',
        quizTitle: "JavaScript Basics",
        category: "Web Development",
        difficulty: "Beginner",
        totalQuestions: 10,
        correctAnswers: 0,
        timeTaken: "0 min",
        score: 0,
        date: "2026-05-20 11:00",
        status: "in-progress",
        icon: <Target className="w-6 h-6" />
    }
];

export default function QuickQuiz() {
    const [activeTab, setActiveTab] = React.useState("quick-quiz");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState("popular");
    const [selectedDifficulty, setSelectedDifficulty] = React.useState("All");
    const [showFilters, setShowFilters] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const quizzesPerPage = 6;

    const [bookmarkedQuizzes, setBookmarkedQuizzes] = React.useState<number[]>([1, 3]);

    const [savedSearchQuery, setSavedSearchQuery] = React.useState("");
    const [savedSortBy, setSavedSortBy] = React.useState("recent");
    const [savedDifficulty, setSavedDifficulty] = React.useState("All");
    const [showSavedFilters, setShowSavedFilters] = React.useState(false);

    const toggleBookmark = (quizId: number) => {
        setBookmarkedQuizzes(prev =>
            prev.includes(quizId)
                ? prev.filter(id => id !== quizId)
                : [...prev, quizId]
        );
    };

    const [historySearchQuery, setHistorySearchQuery] = React.useState("");
    const [historySortBy, setHistorySortBy] = React.useState("recent");
    const [selectedStatus, setSelectedStatus] = React.useState("All");
    const [selectedHistoryDifficulty, setSelectedHistoryDifficulty] = React.useState("All");
    const [showHistoryFilters, setShowHistoryFilters] = React.useState(false);
    const [historyPage, setHistoryPage] = React.useState(1);
    const resultsPerPage = 6;

    const sortOptions = [
        { value: "popular", label: "Most Popular" },
        { value: "short", label: "Shortest Time" },
        { value: "questions", label: "Most Questions" },
    ];

    const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

    const historySortOptions = [
        { value: "recent", label: "Most Recent" },
        { value: "score-high", label: "Highest Score" },
        { value: "score-low", label: "Lowest Score" },
    ];

    const savedSortOptions = [
        { value: "recent", label: "Recently Saved" },
        { value: "questions", label: "Most Questions" },
        { value: "short", label: "Shortest Time" },
    ];

    const statuses = ["All", "completed", "in-progress", "not-started"];

    useEffect(() => {
        document.title = `Quick Quiz ✦ ${siteConfig.name}`;
    }, []);

    const quizCategories = [
        {
            id: 1,
            title: "Web Development",
            description: "Test your knowledge of HTML, CSS, JavaScript",
            questions: 10,
            duration: "5 min",
            difficulty: "Beginner",
            icon: <Target className="w-6 h-6" />
        },
        {
            id: 2,
            title: "Programming Basics",
            description: "Core programming concepts and logic",
            questions: 8,
            duration: "4 min",
            difficulty: "Beginner",
            icon: <Brain className="w-6 h-6" />
        },
        {
            id: 3,
            title: "Problem Solving",
            description: "Critical thinking and analytical skills",
            questions: 12,
            duration: "6 min",
            difficulty: "Intermediate",
            icon: <Zap className="w-6 h-6" />
        },
        {
            id: 4,
            title: "Digital Marketing",
            description: "SEO, social media, and marketing fundamentals",
            questions: 10,
            duration: "5 min",
            difficulty: "Beginner",
            icon: <TrendingUp className="w-6 h-6" />
        },
        {
            id: 5,
            title: "Graphic Design",
            description: "Design principles, tools, and creativity",
            questions: 8,
            duration: "4 min",
            difficulty: "Beginner",
            icon: <Palette className="w-6 h-6" />
        },
        {
            id: 6,
            title: "Data Science",
            description: "Statistics, data analysis, and visualization",
            questions: 15,
            duration: "8 min",
            difficulty: "Intermediate",
            icon: <Brain className="w-6 h-6" />
        },
        {
            id: 7,
            title: "Cloud Computing",
            description: "AWS, Azure, and cloud fundamentals",
            questions: 12,
            duration: "6 min",
            difficulty: "Advanced",
            icon: <Zap className="w-6 h-6" />
        },
        {
            id: 8,
            title: "Cybersecurity Basics",
            description: "Network security and threat prevention",
            questions: 10,
            duration: "5 min",
            difficulty: "Beginner",
            icon: <Target className="w-6 h-6" />
        }
    ];

    const completedCategories = quizHistoryData
        .filter(q => q.status === 'completed')
        .map(q => q.quizTitle);
    
    const weakCategories = quizHistoryData
        .filter(q => q.status === 'completed' && q.score < 70)
        .map(q => q.quizTitle);
    
    const recommendedQuizzes = quizCategories
        .map(quiz => {
            let score = 0;
            if (!completedCategories.includes(quiz.title)) {
                score += 30;
            } else {
                const completedQuiz = quizHistoryData.find(q => q.quizTitle === quiz.title && q.status === 'completed');
                if (completedQuiz && completedQuiz.score < 70) {
                    score += 40;
                    score += 20;
                } else if (completedQuiz && completedQuiz.score >= 80) {
                    score += 10;
                }
            }
            if (quiz.difficulty === 'Intermediate') score += 15;
            if (quiz.difficulty === 'Advanced') score += 10;
            return { ...quiz, recommendationScore: score };
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 6);

    const getQuizIdByTitle = (title: string) => {
        const quiz = quizCategories.find(q => q.title === title);
        return quiz ? quiz.id : 1;
    };

    const filteredQuizzes = quizCategories.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    }).sort((a, b) => {
        switch (sortBy) {
            case "short": return parseInt(a.duration) - parseInt(b.duration);
            case "questions": return b.questions - a.questions;
            default: return 0;
        }
    });

    const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
    const paginatedQuizzes = filteredQuizzes.slice(
        (currentPage - 1) * quizzesPerPage,
        currentPage * quizzesPerPage
    );

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedDifficulty, searchQuery, sortBy]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedDifficulty("All");
        setSortBy("popular");
    };

    const filteredResults = quizHistoryData.filter(result => {
        const matchesSearch = result.quizTitle.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
            result.category.toLowerCase().includes(historySearchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || result.status === selectedStatus;
        const matchesDifficulty = selectedHistoryDifficulty === "All" || result.difficulty === selectedHistoryDifficulty;
        return matchesSearch && matchesStatus && matchesDifficulty;
    }).sort((a, b) => {
        switch (historySortBy) {
            case "score-high": return b.score - a.score;
            case "score-low": return a.score - b.score;
            default: return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });

    const historyTotalPages = Math.ceil(filteredResults.length / resultsPerPage);
    const paginatedResults = filteredResults.slice(
        (historyPage - 1) * resultsPerPage,
        historyPage * resultsPerPage
    );

    React.useEffect(() => {
        setHistoryPage(1);
    }, [selectedStatus, selectedHistoryDifficulty, historySearchQuery, historySortBy]);

    const resetHistoryFilters = () => {
        setHistorySearchQuery("");
        setSelectedStatus("All");
        setSelectedHistoryDifficulty("All");
        setHistorySortBy("recent");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-500 text-xs">Completed</Badge>;
            case "in-progress":
                return <Badge className="bg-amber-500 text-xs">In Progress</Badge>;
            case "not-started":
                return <Badge className="bg-muted text-xs">Not Started</Badge>;
            default:
                return null;
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "(Just now)";
        if (diffMins < 60) return `(${diffMins} min${diffMins > 1 ? 's' : ''} ago)`;
        if (diffHours < 24) return `(${diffHours} hour${diffHours > 1 ? 's' : ''} ago)`;
        if (diffDays < 7) return `(${diffDays} day${diffDays > 1 ? 's' : ''} ago)`;
        return "";
    };

    const totalQuizzes = quizHistoryData.length;
    const completedQuizzes = quizHistoryData.filter(q => q.status === 'completed').length;
    const averageScore = Math.round(
        quizHistoryData.filter(q => q.status === 'completed').reduce((acc, q) => acc + q.score, 0) / 
        quizHistoryData.filter(q => q.status === 'completed').length
    ) || 0;

    return (
        <div className="flex flex-col min-h-full w-full">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
                <div className="w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <TabsList className="mb-0">
                            <TabsTrigger value="quick-quiz">
                                <Search className="w-4 h-4 mr-2" />
                                Browse
                            </TabsTrigger>
                            <TabsTrigger value="recommended">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Recommended
                            </TabsTrigger>
                            <TabsTrigger value="saved">
                                <Bookmark className="w-4 h-4 mr-2" />
                                Saved
                            </TabsTrigger>
                            <TabsTrigger value="history">
                                <Clock className="w-4 h-4 mr-2" />
                                History
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/30">
                            <Brain className="w-4 h-4 text-violet-500" />
                            <span className="text-sm text-muted-foreground">Total:</span>
                            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{totalQuizzes}</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Completed:</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">{completedQuizzes}</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-muted-foreground">Avg Score:</span>
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{averageScore}%</span>
                        </div>
                    </div>

                        <TabsContent value="quick-quiz" className="mt-0">
                            <div className="flex flex-col lg:flex-row gap-y-3 gap-x-6">
                            <div className="w-full lg:w-1/5 lg:sticky lg:top-20 lg:h-fit space-y-3">
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
                                                <label className="text-xs font-medium mb-1.5 block">Difficulty</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {difficulties.map((diff) => (
                                                        <Button
                                                            key={diff}
                                                            variant={selectedDifficulty === diff ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSelectedDifficulty(diff)}
                                                            className="rounded-full text-xs h-6 px-2"
                                                        >
                                                            {diff}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full  space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        placeholder="Search quizzes..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{(currentPage - 1) * quizzesPerPage + 1}-{Math.min(currentPage * quizzesPerPage, filteredQuizzes.length)}</span> of <span className="font-medium text-foreground">{filteredQuizzes.length}</span> quizzes
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginatedQuizzes.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 * index }}
                                        >
                                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-violet-100 dark:border-violet-900/30">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                                                {category.icon}
                                                            </div>
                                                            <CardTitle className="text-xl">{category.title}</CardTitle>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 h-8 w-8 border"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBookmark(category.id);
                                                            }}
                                                        >
                                                            {bookmarkedQuizzes.includes(category.id) ? (
                                                                <BookmarkCheck className="w-4 h-4 text-violet-500" />
                                                            ) : (
                                                                <Bookmark className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <CardDescription className="text-base">
                                                        {category.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex flex-wrap gap-3 mb-6">
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                                                            <Brain className="w-4 h-4" />
                                                            <span>{category.questions} Questions</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{category.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                                                            <Target className="w-4 h-4" />
                                                            <span>{category.difficulty}</span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/student/quick-quiz/${category.id}`} className="w-full">
                                                        <Button className="w-full group/btn">
                                                            Start Quiz
                                                            <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                {filteredQuizzes.length === 0 && (
                                    <div className="text-center py-12">
                                        <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
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
                        </TabsContent>

                        <TabsContent value="recommended" className="mt-0">
                            <div className="flex flex-col lg:flex-row gap-y-3 gap-x-6">
                            <div className="w-full lg:w-1/5 lg:sticky lg:top-20 lg:h-fit space-y-3">
                                <div className="border rounded-lg p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-violet-500" />
                                        <span className="text-sm font-semibold">AI Recommendations</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on your quiz history and performance
                                    </p>
                                </div>
                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown size={14} />
                                        <span className="text-sm font-semibold">Why these?</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-2">
                                        <p>• Quizzes you haven't tried yet</p>
                                        <p>• Topics with lower scores</p>
                                        <p>• Progressive difficulty match</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">1-{recommendedQuizzes.length}</span> of <span className="font-medium text-foreground">{recommendedQuizzes.length}</span> recommended quizzes
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recommendedQuizzes.map((quiz, index) => (
                                        <motion.div
                                            key={quiz.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 * index }}
                                        >
                                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-violet-100 dark:border-violet-900/30">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                                                {quiz.icon}
                                                            </div>
                                                            <CardTitle className="text-xl">{quiz.title}</CardTitle>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 h-8 w-8 border"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBookmark(quiz.id);
                                                            }}
                                                        >
                                                            {bookmarkedQuizzes.includes(quiz.id) ? (
                                                                <BookmarkCheck className="w-4 h-4 text-violet-500" />
                                                            ) : (
                                                                <Bookmark className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <CardDescription className="text-base">
                                                        {quiz.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge className="bg-violet-500 text-xs">
                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                            {quiz.recommendationScore}% Match
                                                        </Badge>
                                                        {weakCategories.includes(quiz.title) && (
                                                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                                                <RotateCcw className="w-3 h-3 mr-1" />
                                                                Needs Practice
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 mb-6">
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                                                            <Brain className="w-4 h-4" />
                                                            <span>{quiz.questions} Questions</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{quiz.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                                                            <Target className="w-4 h-4" />
                                                            <span>{quiz.difficulty}</span>
                                                        </div>
</div>
                                                    <Link href={`/student/quick-quiz/${quiz.id}`} className="w-full">
                                                        <Button className="w-full group/btn">
                                                            Start Quiz
                                                            <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="saved" className="mt-0">
                            <div className="flex flex-col lg:flex-row gap-y-3 gap-x-6">
                            <div className="w-full lg:w-1/5 lg:sticky lg:top-20 lg:h-fit space-y-3">
                                <Button
                                    variant="outline"
                                    className="lg:hidden w-full flex items-center justify-between"
                                    onClick={() => setShowSavedFilters(!showSavedFilters)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} />
                                        <span className="text-sm">Sort & Filter</span>
                                    </div>
                                    {showSavedFilters ? <ChevronRight className="rotate-90" size={16} /> : <ChevronRight size={16} />}
                                </Button>

                                <div className={`${showSavedFilters ? 'block' : 'hidden '} lg:block space-y-3`}>
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowUpDown size={14} />
                                            <span className="text-sm font-semibold">Sort</span>
                                        </div>
                                        <select
                                            value={savedSortBy}
                                            onChange={(e) => setSavedSortBy(e.target.value)}
                                            className="w-full text-xs border rounded-md px-2 py-1.5 bg-background"
                                        >
                                            {savedSortOptions.map((option) => (
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
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 text-xs border" 
                                                onClick={() => {
                                                    setSavedSearchQuery("");
                                                    setSavedDifficulty("All");
                                                    setSavedSortBy("recent");
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium mb-1.5 block">Difficulty</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {difficulties.map((diff) => (
                                                        <Button
                                                            key={diff}
                                                            variant={savedDifficulty === diff ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSavedDifficulty(diff)}
                                                            className="rounded-full text-xs h-6 px-2"
                                                        >
                                                            {diff}
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
                                        placeholder="Search saved quizzes..."
                                        value={savedSearchQuery}
                                        onChange={(e) => setSavedSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {bookmarkedQuizzes.length > 0 ? (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {quizCategories.filter(q => bookmarkedQuizzes.includes(q.id)).filter(quiz => {
                                                    const matchesSearch = quiz.title.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
                                                        quiz.description.toLowerCase().includes(savedSearchQuery.toLowerCase());
                                                    const matchesDifficulty = savedDifficulty === "All" || quiz.difficulty === savedDifficulty;
                                                    return matchesSearch && matchesDifficulty;
                                                }).length} of {bookmarkedQuizzes.length} saved quizzes
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {quizCategories
                                                .filter(q => bookmarkedQuizzes.includes(q.id))
                                                .filter(quiz => {
                                                    const matchesSearch = quiz.title.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
                                                        quiz.description.toLowerCase().includes(savedSearchQuery.toLowerCase());
                                                    const matchesDifficulty = savedDifficulty === "All" || quiz.difficulty === savedDifficulty;
                                                    return matchesSearch && matchesDifficulty;
                                                })
                                                .sort((a, b) => {
                                                    switch (savedSortBy) {
                                                        case "questions": return b.questions - a.questions;
                                                        case "short": return parseInt(a.duration) - parseInt(b.duration);
                                                        default: return 0;
                                                    }
                                                })
                                                .map((category, index) => (
                                                <motion.div
                                                    key={category.id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                                >
                                                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-violet-100 dark:border-violet-900/30">
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                                                        {category.icon}
                                                                    </div>
                                                                    <CardTitle className="text-xl">{category.title}</CardTitle>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="shrink-0 h-8 w-8 border"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleBookmark(category.id);
                                                                    }}
                                                                >
                                                                    <BookmarkCheck className="w-4 h-4 text-violet-500" />
                                                                </Button>
                                                            </div>
                                                            <CardDescription className="text-base">
                                                                {category.description}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="flex flex-wrap gap-3 mb-6">
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                                                                    <Brain className="w-4 h-4" />
                                                                    <span>{category.questions} Questions</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>{category.duration}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                                                                    <Target className="w-4 h-4" />
                                                                    <span>{category.difficulty}</span>
                                                                </div>
                                                            </div>
                                                            <Link href={`/student/quick-quiz/${category.id}`} className="w-full">
                                                                <Button className="w-full group/btn">
                                                                    Start Quiz
                                                                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                                </Button>
                                                            </Link>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No saved quizzes</h3>
                                        <p className="text-muted-foreground mb-4">Bookmark quizzes from the Browse tab to see them here</p>
                                        <Button variant="outline" onClick={() => setActiveTab("quick-quiz")}>
                                            Browse Quizzes
                                        </Button>
                                    </div>
                                )}
                            </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <div className="flex flex-col lg:flex-row gap-y-3 gap-x-6">
                            <div className="w-full lg:w-1/5 lg:sticky lg:top-20 lg:h-fit space-y-3">
                                <Button
                                    variant="outline"
                                    className="lg:hidden w-full flex items-center justify-between"
                                    onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} />
                                        <span className="text-sm">Sort & Filter</span>
                                    </div>
                                    {showHistoryFilters ? <ChevronRight className="rotate-90" size={16} /> : <ChevronRight size={16} />}
                                </Button>

                                <div className={`${showHistoryFilters ? 'block' : 'hidden '} lg:block space-y-3`}>
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowUpDown size={14} />
                                            <span className="text-sm font-semibold">Sort</span>
                                        </div>
                                        <select
                                            value={historySortBy}
                                            onChange={(e) => setHistorySortBy(e.target.value)}
                                            className="w-full text-xs border rounded-md px-2 py-1.5 bg-background"
                                        >
                                            {historySortOptions.map((option) => (
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
                                            <Button variant="ghost" size="sm" className="h-6 text-xs border" onClick={resetHistoryFilters}>
                                                Reset
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium mb-1.5 block">Status</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {statuses.map((status) => (
                                                        <Button
                                                            key={status}
                                                            variant={selectedStatus === status ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSelectedStatus(status)}
                                                            className="rounded-full text-xs h-6 px-2 capitalize"
                                                        >
                                                            {status === "All" ? "All" : status.replace("-", " ")}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium mb-1.5 block">Difficulty</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {difficulties.map((diff) => (
                                                        <Button
                                                            key={diff}
                                                            variant={selectedHistoryDifficulty === diff ? "secondary" : "ghost"}
                                                            size="sm"
                                                            onClick={() => setSelectedHistoryDifficulty(diff)}
                                                            className="text-xs h-6"
                                                        >
                                                            {diff}
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
                                        placeholder="Search quiz history..."
                                        value={historySearchQuery}
                                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{(historyPage - 1) * resultsPerPage + 1}-{Math.min(historyPage * resultsPerPage, filteredResults.length)}</span> of <span className="font-medium text-foreground">{filteredResults.length}</span> results
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {paginatedResults.map((result, index) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 * index }}
                                        >
                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 sm:p-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                                                            {result.icon}
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                                <h3 className="text-base sm:text-lg font-semibold truncate">{result.quizTitle}</h3>
                                                                {getStatusBadge(result.status)}
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                                                                <span className="flex items-center gap-1">
                                                                    <Target className="w-3 h-3" />
                                                                    {result.difficulty}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Brain className="w-3 h-3" />
                                                                    {result.totalQuestions} Questions
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {result.timeTaken}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>{result.date} {getRelativeTime(result.date)}</span>
                                                                </span>
                                                            </div>

                                                            {result.status === 'completed' && (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-xs text-muted-foreground mr-2">Score</span>
                                                                            <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                                                                                {result.correctAnswers}/{result.totalQuestions} ({result.score}%)
                                                                            </span>
                                                                        </div>
                                                                        <Progress value={result.score} className="h-2" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {result.status === 'in-progress' && (
                                                                <Link href={`/student/quick-quiz/${getQuizIdByTitle(result.quizTitle)}`}>
                                                                    <Button variant="outline" size="sm" className="mt-2">
                                                                        Continue Quiz
                                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                                    </Button>
                                                                </Link>
                                                            )}

                                                            {result.status === 'not-started' && (
                                                                <Link href={`/student/quick-quiz/${getQuizIdByTitle(result.quizTitle)}`}>
                                                                    <Button variant="outline" size="sm" className="mt-2">
                                                                        Start Quiz
                                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                {filteredResults.length === 0 && (
                                    <div className="text-center py-12">
                                        <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No quiz history found</h3>
                                        <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                                        <Button variant="outline" onClick={resetHistoryFilters}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                )}

                                {historyTotalPages > 1 && (
                                    <Pagination className="mt-8">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                                    className={historyPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink 
                                                        onClick={() => setHistoryPage(page)}
                                                        isActive={historyPage === page}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext 
                                                    onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                                                    className={historyPage === historyTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>
                        </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}