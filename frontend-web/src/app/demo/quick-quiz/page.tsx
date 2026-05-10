"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    ArrowUpDown
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { siteConfig } from "@/config/site";

export default function QuickQuiz() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState("popular");
    const [selectedDifficulty, setSelectedDifficulty] = React.useState("All");
    const [showFilters, setShowFilters] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const quizzesPerPage = 6;

    const sortOptions = [
        { value: "popular", label: "Most Popular" },
        { value: "short", label: "Shortest Time" },
        { value: "questions", label: "Most Questions" },
    ];

    const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

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

    return (
        <div className="flex flex-col min-h-full w-full">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
                <div className="w-full">

                    <div className="flex flex-col lg:flex-row gap-y-3 gap-x-6">
                        {/* Sidebar */}
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

                        {/* Content */}
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
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                                        {category.icon}
                                                    </div>
                                                    <CardTitle className="text-xl">{category.title}</CardTitle>
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
                                                <Button className="w-full group/btn">
                                                    Start Quiz
                                                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
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
                </div>
            </div>
        </div>
    );
}
