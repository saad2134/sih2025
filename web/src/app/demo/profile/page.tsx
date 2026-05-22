"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    BookOpen,
    Target,
    Clock,
    Star,
    Edit,
    CreditCard,
    Zap,
    TrendingUp,
    Upload,
    Camera,
    HelpCircle
} from "lucide-react";
import { siteConfig } from "@/config/site";

function ResponsiveDialog({ open, onOpenChange, trigger, children, title, description, footer, className }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    title: string;
    description: string;
    footer?: React.ReactNode;
    className?: string;
}) {
    const [isSmallScreen, setIsSmallScreen] = React.useState(false);

    React.useEffect(() => {
        const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (isSmallScreen) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">{children}</div>
                    <DrawerFooter>
                        {footer}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={className}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
                <DialogFooter>
                    {footer}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const userProfile = {
    name: "Saad Mohammed",
    email: "saad.mohammed@example.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    joinedDate: "January 2025",
    avatar: "SM",
    level: 8,
    points: 2450,
    rank: 42,
    streak: 12,

    education: {
        qualification: "Bachelor's Degree",
        field: "Computer Science",
        institution: "Mumbai University"
    },

    careerGoal: "Software Development",
    targetRoles: "Full Stack Developer, Backend Engineer",

    skills: [
        { name: "JavaScript", level: 75, certified: true },
        { name: "React", level: 65, certified: true },
        { name: "Python", level: 60, certified: false },
        { name: "Node.js", level: 55, certified: false },
        { name: "SQL", level: 50, certified: false },
        { name: "TypeScript", level: 45, certified: false },
        { name: "Docker", level: 40, certified: false },
        { name: "Git", level: 35, certified: false },
        { name: "AWS", level: 30, certified: false },
        { name: "GraphQL", level: 25, certified: false },
        { name: "MongoDB", level: 20, certified: false },
    ],

    interests: ["Web Development", "Data Science", "AI/ML", "Cloud Computing"],

    learningPreferences: {
        type: "Hands-on projects",
        style: "Self-paced",
        timeCommitment: "1-2 hours/day",
    },

    completedCourses: 5,
    inProgressCourses: 3,
    totalHoursLearned: 48,
    certificatesEarned: 4,

    activityLog: [
        { id: 1, action: "Completed module", target: "React Fundamentals", date: "Today, 2:30 PM", type: "course" },
        { id: 2, action: "Earned badge", target: "Fast Learner", date: "Yesterday", type: "achievement" },
        { id: 3, action: "Started course", target: "Python for Data Science", date: "Feb 10, 2025", type: "course" },
        { id: 4, action: "Completed quiz", target: "JavaScript Basics", date: "Feb 8, 2025", type: "quiz" },
    ]
};

export default function Profile() {
    const router = useRouter();
    const [isSmallScreen, setIsSmallScreen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [isPaidUser, setIsPaidUser] = React.useState(false);
    const [activityFilter, setActivityFilter] = React.useState("all");
    const [activitySort, setActivitySort] = React.useState("newest");
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
    const [editForm, setEditForm] = React.useState({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        location: userProfile.location,
    });
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
    const [learningPrefsOpen, setLearningPrefsOpen] = React.useState(false);
    const [learningForm, setLearningForm] = React.useState({
        type: userProfile.learningPreferences.type,
        style: userProfile.learningPreferences.style,
        timeCommitment: userProfile.learningPreferences.timeCommitment,
    });
    const [careerGoalOpen, setCareerGoalOpen] = React.useState(false);
    const [careerForm, setCareerForm] = React.useState({
        careerGoal: userProfile.careerGoal,
        targetRoles: userProfile.targetRoles,
    });
    const [interestsForm, setInterestsForm] = React.useState([...userProfile.interests]);
    const [skillsOpen, setSkillsOpen] = React.useState(false);
    const [skillsForm, setSkillsForm] = React.useState([...userProfile.skills]);
    const [skillsPage, setSkillsPage] = React.useState(1);
    const skillsPerPage = 10;

    useEffect(() => {
        document.title = `Profile ✦ ${siteConfig.name}`;
    }, []);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        setEditDialogOpen(false);
        setAvatarPreview(null);
    };

    const handleSaveLearningPrefs = () => {
        setLearningPrefsOpen(false);
    };

    const handleSaveCareerGoal = () => {
        setCareerGoalOpen(false);
    };

    const handleSaveSkills = () => {
        setSkillsOpen(false);
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "course": return BookOpen;
            case "achievement": return Award;
            case "quiz": return Star;
            default: return Clock;
        }
    };

    const filteredActivities = React.useMemo(() => {
        let filtered = [...userProfile.activityLog];
        if (activityFilter !== "all") {
            filtered = filtered.filter(a => a.type === activityFilter);
        }
        if (activitySort === "newest") {
            filtered.reverse();
        }
        return filtered;
    }, [activityFilter, activitySort]);

    const paginatedActivities = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredActivities.slice(start, start + itemsPerPage);
    }, [filteredActivities, currentPage]);

    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="h-full">
                                    <CardHeader className="pb-2 relative">
                                        <ResponsiveDialog
                                            open={editDialogOpen}
                                            onOpenChange={setEditDialogOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Profile"
                                            description="Update your personal information and career goals."
                                            className="sm:max-w-[500px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveProfile}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-3xl font-bold text-violet-600">
                                                            {avatarPreview ? (
                                                                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover rounded-full" />
                                                            ) : (
                                                                userProfile.avatar
                                                            )}
                                                        </div>
                                                        <label
                                                            htmlFor="avatar-upload"
                                                            className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors"
                                                        >
                                                            <Camera className="w-4 h-4" />
                                                            <input
                                                                id="avatar-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleAvatarUpload}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                    {avatarPreview && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleRemoveAvatar}
                                                            className="text-xs"
                                                        >
                                                            Remove Photo
                                                        </Button>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">Click camera icon to upload photo</p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="location">Location</Label>
                                                    <Input
                                                        id="location"
                                                        value={editForm.location}
                                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </ResponsiveDialog>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl font-bold text-violet-600 shrink-0">
                                                {userProfile.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span>Level {userProfile.level} • {userProfile.points.toLocaleString()} pts</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30">
                                                #{userProfile.rank} Rank
                                            </Badge>
                                            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30">
                                                🔥 {userProfile.streak} day streak
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 pt-3 border-t text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="truncate">{userProfile.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>{userProfile.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>{userProfile.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Joined {userProfile.joinedDate}</span>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                            >
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            Billing & Subscription
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950/30 text-xs">
                                                    Current Plan: {isPaidUser ? "Pro" : "Freemium"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {isPaidUser
                                                    ? "You're on the Pro plan. Thank you for your support!"
                                                    : "You're on the free plan. Upgrade to unlock all features!"}
                                            </p>
                                        </div>
                                        <Button
                                            className={`w-full font-semibold transition-all duration-300 ${!isPaidUser ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 animate-shine' : ''}`}
                                            variant={isPaidUser ? "outline" : "default"}
                                            onClick={() => router.push("/demo/billing")}
                                        >
                                            <Zap className={`w-4 h-4 mr-1.5 ${!isPaidUser ? 'fill-white' : ''}`} />
                                            {isPaidUser ? "Manage Billing" : "Upgrade Now"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card>
                                    <CardHeader className="pb-3 relative">
                                        <ResponsiveDialog
                                            open={learningPrefsOpen}
                                            onOpenChange={setLearningPrefsOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Learning Preferences"
                                            description="Update your learning preferences."
                                            className="sm:max-w-[400px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setLearningPrefsOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveLearningPrefs}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Learning Type</Label>
                                                    <Select
                                                        value={learningForm.type}
                                                        onValueChange={(value) => setLearningForm({ ...learningForm, type: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Videos">Videos</SelectItem>
                                                            <SelectItem value="Hands-on projects">Hands-on projects</SelectItem>
                                                            <SelectItem value="Articles">Articles</SelectItem>
                                                            <SelectItem value="Quizzes">Quizzes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Learning Style</Label>
                                                    <Select
                                                        value={learningForm.style}
                                                        onValueChange={(value) => setLearningForm({ ...learningForm, style: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Guided paths with deadlines">Guided paths with deadlines</SelectItem>
                                                            <SelectItem value="Self-paced">Self-paced learning</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Time Commitment</Label>
                                                    <Select
                                                        value={learningForm.timeCommitment}
                                                        onValueChange={(value) => setLearningForm({ ...learningForm, timeCommitment: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Less than 1 hour/day">&lt;1 hour/day</SelectItem>
                                                            <SelectItem value="1-2 hours/day">1-2 hours/day</SelectItem>
                                                            <SelectItem value="2-5 hours/day">2-5 hours/day</SelectItem>
                                                            <SelectItem value="5+ hours/day">5+ hours/day</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </ResponsiveDialog>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <BookOpen className="w-5 h-5 text-violet-500" />
                                            Learning Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Type</span>
                                            <span className="text-right">{userProfile.learningPreferences.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Style</span>
                                            <span className="text-right">{userProfile.learningPreferences.style}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Time</span>
                                            <span className="text-right">{userProfile.learningPreferences.timeCommitment}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                            >
                                <Card className="h-full">
                                    <CardHeader className="pb-3 relative">
                                        <ResponsiveDialog
                                            open={skillsOpen}
                                            onOpenChange={setSkillsOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Skills"
                                            description="Add or remove skills and their proficiency levels."
                                            className="sm:max-w-[500px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setSkillsOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleSaveSkills}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
                                                {skillsForm.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input
                                                            value={skill.name}
                                                            onChange={(e) => {
                                                                const newSkills = [...skillsForm];
                                                                newSkills[index] = { ...skill, name: e.target.value };
                                                                setSkillsForm(newSkills);
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={skill.level}
                                                            onChange={(e) => {
                                                                const newSkills = [...skillsForm];
                                                                newSkills[index] = { ...skill, level: parseInt(e.target.value) || 0 };
                                                                setSkillsForm(newSkills);
                                                            }}
                                                            className="w-16"
                                                            min={0}
                                                            max={100}
                                                        />
                                                        <Checkbox
                                                            checked={skill.certified}
                                                            onCheckedChange={(checked) => {
                                                                const newSkills = [...skillsForm];
                                                                newSkills[index] = { ...skill, certified: checked as boolean };
                                                                setSkillsForm(newSkills);
                                                            }}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSkillsForm(skillsForm.filter((_, i) => i !== index))}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSkillsForm([...skillsForm, { name: "", level: 0, certified: false }])}
                                                >
                                                    + Add Skill
                                                </Button>
                                            </div>
                                        </ResponsiveDialog>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <BookOpen className="w-5 h-5 text-blue-500" />
                                            Skills
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="min-h-[220px] flex flex-col justify-between">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                            {userProfile.skills
                                                .slice((skillsPage - 1) * skillsPerPage, skillsPage * skillsPerPage)
                                                .map((skill) => (
                                                <div key={skill.name} className="flex items-center gap-1">
                                                    <span className="text-sm w-20 truncate">{skill.name}</span>
                                                    <Progress value={skill.level} className="flex-1 h-2" />
                                                    <span className="text-xs text-muted-foreground w-7">{skill.level}%</span>
                                                    {skill.certified ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Award className="w-4 h-4 text-amber-500 cursor-help shrink-0" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Certified / Course completed</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help shrink-0" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Self-proclaimed skill</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {userProfile.skills.length > skillsPerPage && (
                                            <div className="flex items-center justify-between pt-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSkillsPage(p => Math.max(1, p - 1))}
                                                    disabled={skillsPage === 1}
                                                >
                                                    Prev
                                                </Button>
                                                <span className="text-xs text-muted-foreground">
                                                    {skillsPage} / {Math.ceil(userProfile.skills.length / skillsPerPage)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSkillsPage(p => Math.min(Math.ceil(userProfile.skills.length / skillsPerPage), p + 1))}
                                                    disabled={skillsPage >= Math.ceil(userProfile.skills.length / skillsPerPage)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card className="h-full">
                                    <div className="relative">
                                        <ResponsiveDialog
                                            open={careerGoalOpen}
                                            onOpenChange={setCareerGoalOpen}
                                            trigger={
                                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 border z-10">
                                                    <Edit size={18} />
                                                </Button>
                                            }
                                            title="Edit Career Goals & Interests"
                                            description="Update your career goals and interests."
                                            className="sm:max-w-[450px]"
                                            footer={
                                                <>
                                                    <Button variant="outline" onClick={() => setCareerGoalOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={() => setCareerGoalOpen(false)}>
                                                        Save Changes
                                                    </Button>
                                                </>
                                            }
                                        >
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium">Career Goal</Label>
                                                    <div className="grid gap-2">
                                                        <Label className="text-xs text-muted-foreground">Domain</Label>
                                                        <Input
                                                            value={careerForm.careerGoal}
                                                            onChange={(e) => setCareerForm({ ...careerForm, careerGoal: e.target.value })}
                                                            placeholder="e.g., Software Development"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label className="text-xs text-muted-foreground">Targeted Roles</Label>
                                                        <Input
                                                            value={careerForm.targetRoles}
                                                            onChange={(e) => setCareerForm({ ...careerForm, targetRoles: e.target.value })}
                                                            placeholder="e.g., Full Stack Developer, Backend Engineer"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 pt-2">
                                                    <Label className="text-sm font-medium">Interests</Label>
                                                    {interestsForm.map((interest, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <Input
                                                                value={interest}
                                                                onChange={(e) => {
                                                                    const newInterests = [...interestsForm];
                                                                    newInterests[index] = e.target.value;
                                                                    setInterestsForm(newInterests);
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setInterestsForm(interestsForm.filter((_, i) => i !== index))}
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setInterestsForm([...interestsForm, ""])}
                                                    >
                                                        + Add Interest
                                                    </Button>
                                                </div>
                                            </div>
                                        </ResponsiveDialog>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Target className="w-5 h-5 text-violet-500" />
                                                Career Goal
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Domain</span>
                                                <span className="text-right">{userProfile.careerGoal}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Targeted Roles</span>
                                                <span className="text-right">{userProfile.targetRoles}</span>
                                            </div>
                                        </CardContent>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Star className="w-5 h-5 text-pink-500" />
                                                Interests
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {userProfile.interests.map((interest) => (
                                                    <Badge key={interest} variant="secondary">
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="text-primary" size={20} />
                                            Learning Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-primary">{userProfile.completedCourses}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-blue-500">{userProfile.inProgressCourses}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">In Progress</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-green-500">{userProfile.totalHoursLearned}h</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Hours Learned</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl sm:text-3xl font-bold text-amber-500">{userProfile.certificatesEarned}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Certificates</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-violet-500" />
                                            Recent Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2 mb-4">
                                            <select
                                                value={activityFilter}
                                                onChange={(e) => { setActivityFilter(e.target.value); setCurrentPage(1); }}
                                                className="text-xs border rounded-md px-2 py-1 bg-background"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="course">Courses</option>
                                                <option value="achievement">Achievements</option>
                                                <option value="quiz">Quizzes</option>
                                            </select>
                                            <select
                                                value={activitySort}
                                                onChange={(e) => { setActivitySort(e.target.value); setCurrentPage(1); }}
                                                className="text-xs border rounded-md px-2 py-1 bg-background"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            {paginatedActivities.map((activity, index) => {
                                                const Icon = getActivityIcon(activity.type);
                                                return (
                                                    <motion.div
                                                        key={activity.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                                            <Icon className="w-4 h-4 text-violet-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{activity.action}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{activity.target}</p>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground shrink-0">{activity.date}</span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-xs text-muted-foreground">
                                                    Page {currentPage} of {totalPages}
                                                </p>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="h-7 px-2"
                                                    >
                                                        Prev
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="h-7 px-2"
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
