"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
    Brain,
    Clock,
    Target,
    ChevronRight,
    Search,
    Filter,
    ArrowUpDown,
    Award,
    Calendar,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
        id: '1',
        quizTitle: "Web Development",
        category: "Web Development",
        difficulty: "Beginner",
        totalQuestions: 10,
        correctAnswers: 8,
        timeTaken: "4 min",
        score: 80,
        date: "2025-05-08",
        status: "completed",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: '2',
        quizTitle: "Programming Basics",
        category: "Programming",
        difficulty: "Beginner",
        totalQuestions: 8,
        correctAnswers: 6,
        timeTaken: "3 min",
        score: 75,
        date: "2025-05-07",
        status: "completed",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '3',
        quizTitle: "Problem Solving",
        category: "Logic",
        difficulty: "Intermediate",
        totalQuestions: 12,
        correctAnswers: 10,
        timeTaken: "5 min",
        score: 83,
        date: "2025-05-06",
        status: "completed",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '4',
        quizTitle: "Digital Marketing",
        category: "Marketing",
        difficulty: "Beginner",
        totalQuestions: 10,
        correctAnswers: 7,
        timeTaken: "4 min",
        score: 70,
        date: "2025-05-05",
        status: "completed",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: '5',
        quizTitle: "Data Science",
        category: "Data Science",
        difficulty: "Intermediate",
        totalQuestions: 15,
        correctAnswers: 12,
        timeTaken: "7 min",
        score: 80,
        date: "2025-05-04",
        status: "completed",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '6',
        quizTitle: "Graphic Design",
        category: "Design",
        difficulty: "Beginner",
        totalQuestions: 8,
        correctAnswers: 0,
        timeTaken: "0 min",
        score: 0,
        date: "2025-05-03",
        status: "in-progress",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: '7',
        quizTitle: "Cloud Computing",
        category: "Cloud",
        difficulty: "Advanced",
        totalQuestions: 12,
        correctAnswers: 9,
        timeTaken: "5 min",
        score: 75,
        date: "2025-05-02",
        status: "completed",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: '8',
        quizTitle: "Cybersecurity Basics",
        category: "Security",
        difficulty: "Beginner",
        totalQuestions: 10,
        correctAnswers: 9,
        timeTaken: "4 min",
        score: 90,
        date: "2025-05-01",
        status: "completed",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: '9',
        quizTitle: "Python Basics",
        category: "Programming",
        difficulty: "Beginner",
        totalQuestions: 10,
        correctAnswers: 8,
        timeTaken: "5 min",
        score: 80,
        date: "2025-04-30",
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
        date: "2025-04-29",
        status: "not-started",
        icon: <Brain className="w-6 h-6" />
    }
];

export default function QuizHistory() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState("recent");
    const [selectedStatus, setSelectedStatus] = React.useState("All");
    const [selectedDifficulty, setSelectedDifficulty] = React.useState("All");
    const [showFilters, setShowFilters] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const resultsPerPage = 6;

    const sortOptions = [
        { value: "recent", label: "Most Recent" },
        { value: "score-high", label: "Highest Score" },
        { value: "score-low", label: "Lowest Score" },
    ];

    const statuses = ["All", "completed", "in-progress", "not-started"];
    const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

    useEffect(() => {
        document.title = `Quiz History ✦ ${siteConfig.name}`;
    }, []);

    const filteredResults = quizHistoryData.filter(result => {
        const matchesSearch = result.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || result.status === selectedStatus;
        const matchesDifficulty = selectedDifficulty === "All" || result.difficulty === selectedDifficulty;
        return matchesSearch && matchesStatus && matchesDifficulty;
    }).sort((a, b) => {
        switch (sortBy) {
            case "score-high": return b.score - a.score;
            case "score-low": return a.score - b.score;
            default: return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });

    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
    const paginatedResults = filteredResults.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, selectedDifficulty, searchQuery, sortBy]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedStatus("All");
        setSelectedDifficulty("All");
        setSortBy("recent");
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
                                                        variant={selectedDifficulty === diff ? "secondary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setSelectedDifficulty(diff)}
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-100 dark:border-violet-900/30">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Quizzes</p>
                                                <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{totalQuizzes}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900/30">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Completed</p>
                                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{completedQuizzes}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900/30">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Avg Score</p>
                                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{averageScore}%</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Search quiz history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * resultsPerPage + 1}-{Math.min(currentPage * resultsPerPage, filteredResults.length)}</span> of <span className="font-medium text-foreground">{filteredResults.length}</span> results
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
                                                                {result.date}
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
                                                            <Button variant="outline" size="sm" className="mt-2">
                                                                Continue Quiz
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        )}

                                                        {result.status === 'not-started' && (
                                                            <Button variant="outline" size="sm" className="mt-2">
                                                                Start Quiz
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
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
                </div>
            </div>
        </div>
    );
}