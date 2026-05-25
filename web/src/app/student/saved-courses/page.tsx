"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Clock,
    Award,
    Star,
    Users,
    BookOpen,
    ChevronRight,
    Play,
    Bookmark,
    BookmarkCheck,
    AlertCircle,
    CheckCircle2,
    ArrowUpDown,
    ExternalLink
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { siteConfig } from "@/config/site";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const categories = [
    "All",
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Cloud Computing",
    "AI & Machine Learning",
    "Cybersecurity",
    "DevOps",
];

const allCourses = [
    {
        id: 1,
        title: "Introduction to Programming",
        provider: "FreeCode Academy",
        instructor: "Prof. Arun Kumar",
        rating: 4.9,
        students: 45000,
        duration: "8 weeks",
        level: "Beginner",
        price: 0,
        originalPrice: 0,
        image: "/api/placeholder/400/200",
        tags: ["Web Development", "Programming"],
        match: 98,
        completionRate: 94
    },
    {
        id: 2,
        title: "Digital Marketing Fundamentals",
        provider: "Skill India Hub",
        instructor: "Priya Sharma",
        rating: 4.7,
        students: 32000,
        duration: "6 weeks",
        level: "Beginner",
        price: 0,
        originalPrice: 0,
        image: "/api/placeholder/400/200",
        tags: ["Marketing", "Business"],
        match: 92,
        completionRate: 89
    },
    {
        id: 3,
        title: "Data Analytics Basics",
        provider: "Google Career Certificates",
        instructor: "Dr. Sarah Chen",
        rating: 4.8,
        students: 28000,
        duration: "10 weeks",
        level: "Beginner",
        price: 0,
        originalPrice: 0,
        image: "/api/placeholder/400/200",
        tags: ["Data Science", "Free Courses", "Analytics"],
        match: 90,
        completionRate: 87
    },
    {
        id: 4,
        title: "Full Stack Web Development Bootcamp",
        provider: "Tech Academy",
        instructor: "Sarah Johnson",
        rating: 4.8,
        students: 12500,
        duration: "12 weeks",
        level: "Beginner",
        price: 4999,
        originalPrice: 9999,
        image: "/api/placeholder/400/200",
        tags: ["Web Development", "JavaScript", "React"],
        match: 95
    },
    {
        id: 9,
        title: "Python for Data Science & Machine Learning",
        provider: "DataMaster",
        instructor: "Dr. Michael Chen",
        rating: 4.9,
        students: 8700,
        duration: "16 weeks",
        level: "Intermediate",
        price: 7999,
        originalPrice: 15000,
        image: "/api/placeholder/400/200",
        tags: ["Python", "Data Science", "ML"],
        match: 88
    },
    {
        id: 8,
        title: "AWS Cloud Practitioner Certification",
        provider: "CloudPro",
        instructor: "James Wilson",
        rating: 4.7,
        students: 5600,
        duration: "8 weeks",
        level: "Beginner",
        price: 3999,
        originalPrice: 7999,
        image: "/api/placeholder/400/200",
        tags: ["AWS", "Cloud", "Certification"],
        match: 82
    },
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const durations = ["Any Duration", "Under 4 weeks", "4-8 weeks", "8-12 weeks", "12+ weeks"];
const priceTypes = ["All", "Free", "Paid"];

import { apiService } from "@/lib/api";

export default function SavedCourses() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState("All");
    
    const [enrolDialogOpen, setEnrolDialogOpen] = React.useState(false);
    const [enrolCourseId, setEnrolCourseId] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 4000);
    };
    const [selectedLevel, setSelectedLevel] = React.useState("All Levels");
    const [selectedDuration, setSelectedDuration] = React.useState("Any Duration");
    const [selectedPriceType, setSelectedPriceType] = React.useState("All");
    const [showFilters, setShowFilters] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const coursesPerPage = 9;
    const [sortBy, setSortBy] = React.useState("popular");

    const [coursesList, setCoursesList] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const sortOptions = [
        { value: "popular", label: "Most Popular" },
        { value: "rating", label: "Highest Rated" },
        { value: "newest", label: "Newest" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "duration", label: "Shortest Duration" },
    ];

    const fetchSavedCourses = async () => {
        try {
            setLoading(true);
            const res = await apiService.getSavedCourses();
            if (res.success && res.data) {
                const items = res.data.map((c: any) => ({
                    id: String(c.id),
                    title: c.title,
                    provider: c.provider,
                    instructor: "Web Instructor",
                    rating: c.avg_rating || 4.7,
                    students: c.review_count * 12 || 1500,
                    duration: `${c.total_hours || 40} hours`,
                    level: c.difficulty ? c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1) : 'Beginner',
                    price: 0,
                    originalPrice: 0,
                    image: "/api/placeholder/400/200",
                    tags: c.style_tags || [],
                    match: c.match || 85,
                    completionRate: c.completion_rate || 75,
                    url: c.url || '#'
                }));
                setCoursesList(items);
            }
        } catch (err) {
            console.error("Failed to load saved courses", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchSavedCourses();
    }, []);

    const toggleBookmark = async (courseId: string) => {
        try {
            await apiService.unsaveCourse(courseId);
            setCoursesList(prev => prev.filter(c => c.id !== courseId));
        } catch (err) {
            console.error("Failed to unsave course", err);
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
                    window.location.href = '/student/career-map';
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
        setSelectedCategory("All");
        setSelectedLevel("All Levels");
        setSelectedDuration("Any Duration");
        setSelectedPriceType("All");
    };

    useEffect(() => {
        document.title = `Saved Courses ✦ ${siteConfig.name}`;
    }, []);

    const filteredCourses = coursesList.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.provider.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || course.tags.includes(selectedCategory);
        const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
        
        let matchesDuration = true;
        if (selectedDuration !== "Any Duration") {
            const weeks = parseInt(course.duration.split(" ")[0]);
            if (selectedDuration === "Under 4 weeks") matchesDuration = weeks < 4;
            else if (selectedDuration === "4-8 weeks") matchesDuration = weeks >= 4 && weeks <= 8;
            else if (selectedDuration === "8-12 weeks") matchesDuration = weeks > 8 && weeks <= 12;
            else if (selectedDuration === "12+ weeks") matchesDuration = weeks > 12;
        }

        const matchesPriceType = selectedPriceType === "All" || 
            (selectedPriceType === "Free" && course.price === 0) ||
            (selectedPriceType === "Paid" && course.price > 0);

        return matchesSearch && matchesCategory && matchesLevel && matchesDuration && matchesPriceType;
    }).sort((a, b) => {
        switch (sortBy) {
            case "popular": return b.students - a.students;
            case "rating": return b.rating - a.rating;
            case "price-low": return a.price - b.price;
            case "price-high": return b.price - a.price;
            case "duration": return parseInt(a.duration.split(" ")[0]) - parseInt(b.duration.split(" ")[0]);
            default: return 0;
        }
    });

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedLevel, selectedDuration, selectedPriceType, searchQuery, sortBy]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full">
            <div className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col lg:flex-row gap-6">
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

                            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-3`}>
                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2 ">
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
                                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={resetFilters}>
                                            Reset
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block">Category</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {categories.map((category) => (
                                                    <Button
                                                        key={category}
                                                        variant={selectedCategory === category ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setSelectedCategory(category)}
                                                        className="rounded-full text-xs h-6 px-2 whitespace-nowrap"
                                                    >
                                                        {category}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block">Level</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {levels.map((level) => (
                                                    <Button
                                                        key={level}
                                                        variant={selectedLevel === level ? "secondary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setSelectedLevel(level)}
                                                        className="text-xs h-6"
                                                    >
                                                        {level}
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
                                                {priceTypes.map((type) => (
                                                    <Button
                                                        key={type}
                                                        variant={selectedPriceType === type ? "secondary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setSelectedPriceType(type)}
                                                        className="text-xs h-6"
                                                    >
                                                        {type}
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
                                    placeholder="Search saved courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * coursesPerPage + 1}-{Math.min(currentPage * coursesPerPage, filteredCourses.length)}</span> of <span className="font-medium text-foreground">{filteredCourses.length}</span> saved courses
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {loading ? (
                                   Array.from({ length: 4 }).map((_, idx) => (
                                     <Card key={idx} className="h-80 flex flex-col w-full overflow-hidden p-4 space-y-4">
                                       <Skeleton className="h-32 w-full rounded-lg" />
                                       <Skeleton className="h-6 w-3/4" />
                                       <Skeleton className="h-4 w-1/2" />
                                       <div className="flex gap-2">
                                         <Skeleton className="h-8 w-20 rounded" />
                                         <Skeleton className="h-8 w-20 rounded" />
                                       </div>
                                     </Card>
                                   ))
                                 ) : (
                                   paginatedCourses.map((course, index) => (
                                     <motion.div
                                         key={course.id}
                                         initial={{ opacity: 0, y: 20 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         transition={{ duration: 0.5, delay: index * 0.1 }}
                                     >
                                         <Card className="h-full flex flex-col hover:shadow-lg transition-shadow w-full">
                                             <div className="relative h-32 sm:h-40 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-t-lg overflow-hidden">
                                                 <div className="absolute inset-0 flex items-center justify-center">
                                                     <Play className="w-8 h-8 sm:w-12 sm:h-12 text-violet-500/50" />
                                                 </div>
                                                 <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                                                     <Badge className="text-xs bg-violet-600">
                                                         {course.match}% Match
                                                     </Badge>
                                                 </div>
                                                 <Button
                                                     variant="ghost"
                                                     size="icon"
                                                     className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/80 hover:bg-background h-8 w-8"
                                                     onClick={() => toggleBookmark(course.id)}
                                                 >
                                                     <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                                                 </Button>
                                                 <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex gap-1 flex-wrap max-w-[80%]">
                                                     {course.tags.slice(0, 2).map((tag: string) => (
                                                         <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs truncate max-w-full">
                                                             {tag}
                                                         </Badge>
                                                     ))}
                                                 </div>
                                             </div>
                                             <CardHeader className="pb-2 px-3 sm:px-4">
                                                 <div className="flex items-start justify-between gap-2">
                                                     <CardTitle className="text-sm sm:text-base line-clamp-2 truncate">{course.title}</CardTitle>
                                                 </div>
                                                 <CardDescription className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                     <span className="truncate">{course.provider}</span>
                                                     <span className="hidden sm:inline">•</span>
                                                     <span className="truncate">{course.instructor}</span>
                                                 </CardDescription>
                                             </CardHeader>
                                             <CardContent className="flex-1 space-y-2 sm:space-y-3 px-3 sm:px-4">
                                                 <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                                     <div className="flex items-center gap-1">
                                                         <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                                                         <span className="text-xs">{course.rating}</span>
                                                     </div>
                                                     <div className="flex items-center gap-1">
                                                         <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                         <span className="text-xs">{course.students.toLocaleString()}</span>
                                                     </div>
                                                     <div className="flex items-center gap-1">
                                                         <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                         <span className="text-xs">{course.duration}</span>
                                                     </div>
                                                 </div>
                                                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                     <Badge variant="outline" className="text-xs">{course.level}</Badge>
                                                     <Progress value={course.match} className="flex-1 h-2" />
                                                 </div>
                                                 <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                     {course.price === 0 ? (
                                                         <>
                                                             <span className="text-sm sm:text-lg font-bold text-green-600">Free</span>
                                                             {course.completionRate && (
                                                                 <Badge className="bg-violet-500 text-xs">
                                                                     {course.completionRate}% Completion
                                                                 </Badge>
                                                             )}
                                                         </>
                                                     ) : (
                                                         <>
                                                             <span className="text-sm sm:text-lg font-bold text-violet-600">₹{course.price.toLocaleString()}</span>
                                                             <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{course.originalPrice.toLocaleString()}</span>
                                                             <Badge className="bg-green-500 text-xs">50% OFF</Badge>
                                                         </>
                                                     )}
                                                 </div>
                                             </CardContent>
                                             <CardFooter className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4 flex gap-2">
                                                 <Button 
                                                     className="flex-1 text-xs sm:text-sm"
                                                     onClick={() => handleEnrol(course.id)}
                                                 >
                                                     Enroll Now
                                                     <ChevronRight size={16} className="ml-1" />
                                                 </Button>
                                                 {course.url && course.url !== '#' && (
                                                     <Button variant="outline" size="sm" className="px-2" asChild>
                                                         <a href={course.url} target="_blank" rel="noopener noreferrer">
                                                             <ExternalLink size={14} className="text-primary" />
                                                         </a>
                                                     </Button>
                                                 )}
                                             </CardFooter>
                                         </Card>
                                     </motion.div>
                                   ))
                                 )}
                             </div>
 
                             {!loading && filteredCourses.length === 0 && (
                                 <div className="text-center py-12">
                                     <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                     <h3 className="text-lg font-semibold mb-2">No saved courses found</h3>
                                     <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                                     <Button variant="outline" onClick={() => {
                                         setSearchQuery("");
                                         setSelectedCategory("All");
                                         setSelectedLevel("All Levels");
                                         setSelectedDuration("Any Duration");
                                         setSelectedPriceType("All");
                                     }}>
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
}