"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User, BookOpen, Target, Settings, Clock, Star, Send, LogOut, Play } from "lucide-react";
import { siteConfig } from "@/config/site";


const steps = [
    { name: "Personal Info", icon: User },
    { name: "Skills & Assessment", icon: BookOpen },
    { name: "Career Goals", icon: Target },
    { name: "Learning Preferences", icon: Settings },
    { name: "Availability & Motivation", icon: Clock },
    { name: "Feedback", icon: Send },
];

const PROFICIENCY_SKILLS = ["Computer basics", "Internet navigation", "Mathematics", "English communication", "Programming fundamentals"];

export default function OnboardingForm() {
    const [step, setStep] = React.useState(0);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [hasAttemptedNext, setHasAttemptedNext] = React.useState(false);
    const [formData, setFormData] = React.useState<any>({
        comfortableSubjects: [],
        skills: [],
        interests: [],
        learningGoals: [],
        learningTypes: [],
        learningStyles: [],
        motivations: [],
        familiarWith: [],
        domainStack: [],
        backgroundExperience: [],
    });
    const router = useRouter();

    const validateStep = (s: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (s === 0) {
            if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
            if (!formData.contact?.trim()) newErrors.contact = "Email or mobile number is required";
            else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^\+?[\d\s-]{10,}$/;
                if (!emailRegex.test(formData.contact.trim()) && !phoneRegex.test(formData.contact.replace(/\s/g, ''))) {
                    newErrors.contact = "Enter a valid email or phone number";
                }
            }
            if (!formData.education) newErrors.education = "Please select your qualification";
            if (!formData.fieldOfStudy?.trim()) newErrors.fieldOfStudy = "Field of study is required";
        } else if (s === 1) {
            const proficiencyKeys = PROFICIENCY_SKILLS.map(sk => `proficiency_${sk.replace(/\s+/g, '_')}`);
            const allRated = proficiencyKeys.every(key => formData[key]);
            if (!allRated) newErrors.proficiency = "Please rate all 5 foundational skills";
            if (!formData.skills?.length) newErrors.skills = "Select at least one skill you possess";
            if (!formData.backgroundExperience?.length) newErrors.backgroundExperience = "Select at least one option";
        } else if (s === 2) {
            if (!formData.interests?.length && !formData.otherInterest?.trim()) newErrors.interests = "Select or specify at least one interest";
            if (!formData.learningGoals?.length && !formData.otherGoal?.trim()) newErrors.learningGoals = "Select or specify at least one learning goal";
            if (!formData.targetRoles?.trim()) newErrors.targetRoles = "Please specify target industries or roles";
            if (!formData.domainStack?.length) newErrors.domainStack = "Select at least one domain/stack";
        } else if (s === 3) {
            if (!formData.learningTypes?.length) newErrors.learningTypes = "Select at least one learning type";
            if (!formData.learningStyle) newErrors.learningStyle = "Please select your learning preference";
            if (!formData.pacePreference) newErrors.pacePreference = "Please select your pace preference";
        } else if (s === 4) {
            if (!formData.timeCommitment) newErrors.timeCommitment = "Please select time commitment";
            if (!formData.duration) newErrors.duration = "Please select preferred duration";
            if (!formData.budgetRange) newErrors.budgetRange = "Please select budget range";
            if (!formData.motivations?.length) newErrors.motivations = "Select at least one motivation";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        setHasAttemptedNext(true);
        if (!validateStep(step)) return;
        setHasAttemptedNext(false);
        setErrors({});
        setStep((prev) => Math.min(prev + 1, steps.length - 1));
    };
    const prevStep = () => {
        setErrors({});
        setHasAttemptedNext(false);
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleArrayChange = (key: string, value: string, checked: boolean) => {
        setFormData((prev: any) => ({
            ...prev,
            [key]: checked
                ? [...(prev[key] || []), value]
                : (prev[key] || []).filter((item: string) => item !== value)
        }));
    };

    const handleSubmit = () => {
        setHasAttemptedNext(true);
        if (!validateStep(step)) return;
        console.log("Collected Data:", formData);
        router.push("/demo/dashboard");
    };

    const handleLogout = () => {
        router.push("/");
    };

    const progress = (step / (steps.length - 1)) * 100;

    useEffect(() => {
              document.title = `Onboarding Questionaire ✦ ${siteConfig.name}`;
          }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 pt-24 sm:pt-28 pb-20 relative">
            <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2">
                <Button
                    variant="default"
                    onClick={() => router.push("/demo/dashboard")}
                    className="flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Play size={16} className="shrink-0" />
                    <span className="truncate">Try Demo Dashboard</span>
                </Button>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <LogOut size={16} />
                    Go to Landing Page
                </Button>
            </div>

            <div className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-card rounded-lg shadow-sm border overflow-x-hidden">

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-foreground text-center">
                    Welcome to Your Learning Journey
                </h1>
                <p className="text-muted-foreground text-center mb-6 sm:mb-8 text-sm sm:text-base">
                    Help us personalize your experience by answering a few questions
                </p>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium text-muted-foreground">{step + 1} of {steps.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-between mb-6 sm:mb-8 relative overflow-x-auto pb-2 -mx-1 scrollbar-thin">
                    {steps.map((stepItem, index) => {
                        const Icon = stepItem.icon;
                        return (
                            <div key={index} className="flex flex-col items-center z-10 shrink-0 min-w-[48px] sm:min-w-0">
                                <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${index <= step
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "bg-card border-muted text-muted-foreground"
                                        } transition-colors duration-300`}
                                >
                                    <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span
                                    className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center leading-tight max-w-[56px] sm:max-w-none ${index <= step ? "text-primary" : "text-muted-foreground"
                                        }`}
                                >
                                    {stepItem.name}
                                </span>
                            </div>
                        );
                    })}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10"></div>
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.4 }}
                    >
                        {step === 0 && (
                            <Card>
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle className="flex items-start sm:items-center gap-2 text-base sm:text-lg">
                                        <User className="text-primary shrink-0 mt-0.5 sm:mt-0" size={22} />
                                        <span>Basic Personal and Academic Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {step === 0 && hasAttemptedNext && Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please fill in all required fields before continuing.
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="fullName"
                                                placeholder="Enter your full name"
                                                value={formData.fullName || ""}
                                                onChange={(e) => { handleChange("fullName", e.target.value); setErrors((prev) => ({ ...prev, fullName: "" })); }}
                                                aria-invalid={!!errors.fullName}
                                            />
                                            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact">Email or Mobile Number <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="contact"
                                                placeholder="email@example.com or +1234567890"
                                                value={formData.contact || ""}
                                                onChange={(e) => { handleChange("contact", e.target.value); setErrors((prev) => ({ ...prev, contact: "" })); }}
                                                aria-invalid={!!errors.contact}
                                            />
                                            {errors.contact && <p className="text-sm text-destructive">{errors.contact}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="education">Current Educational Qualification <span className="text-destructive">*</span></Label>
                                            <Select
                                                onValueChange={(value) => { handleChange("education", value); setErrors((prev) => ({ ...prev, education: "" })); }}
                                                value={formData.education || ""}
                                            >
                                                <SelectTrigger id="education" aria-invalid={!!errors.education}>
                                                    <SelectValue placeholder="Select your qualification" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="highSchool">High School/12th Grade</SelectItem>
                                                    <SelectItem value="diploma">Diploma</SelectItem>
                                                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                                    <SelectItem value="master">Master's Degree</SelectItem>
                                                    <SelectItem value="phd">PhD</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.education && <p className="text-sm text-destructive">{errors.education}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fieldOfStudy">Major/Field of Study <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="fieldOfStudy"
                                                placeholder="e.g., Computer Science, Business Administration"
                                                value={formData.fieldOfStudy || ""}
                                                onChange={(e) => { handleChange("fieldOfStudy", e.target.value); setErrors((prev) => ({ ...prev, fieldOfStudy: "" })); }}
                                                aria-invalid={!!errors.fieldOfStudy}
                                            />
                                            {errors.fieldOfStudy && <p className="text-sm text-destructive">{errors.fieldOfStudy}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="text-primary" size={24} />
                                        Prerequisite Knowledge & Skill Assessment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please complete all required sections before continuing.
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <Label>Which subjects/topics are you already comfortable with?</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {["Basic Math", "Programming in Python", "Data Structures", "Algorithms", "Web Development", "Database Management", "Statistics", "Machine Learning", "UI/UX Design"].map((subject) => (
                                                <div key={subject} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={subject}
                                                        checked={formData.comfortableSubjects?.includes(subject) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("comfortableSubjects", subject, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={subject} className="text-sm cursor-pointer">{subject}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Rate your proficiency in these foundational skills (1-5): <span className="text-destructive">*</span></Label>
                                        {errors.proficiency && <p className="text-sm text-destructive">{errors.proficiency}</p>}
                                        <div className="space-y-4">
                                            {["Computer basics", "Internet navigation", "Mathematics", "English communication", "Programming fundamentals"].map((skill) => (
                                                <div key={skill} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                                    <span className="font-medium text-sm sm:text-base">{skill}</span>
                                                    <RadioGroup
                                                        value={formData[`proficiency_${skill.replace(/\s+/g, '_')}`] || ""}
                                                        onValueChange={(value) => handleChange(`proficiency_${skill.replace(/\s+/g, '_')}`, value)}
                                                        className="flex flex-wrap gap-1 sm:gap-2"
                                                    >
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <div key={num} className="flex items-center gap-1">
                                                                <RadioGroupItem value={num.toString()} id={`${skill}_${num}`} />
                                                                <Label htmlFor={`${skill}_${num}`} className="cursor-pointer">{num}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Technical or soft skills you possess: <span className="text-destructive">*</span></Label>
                                        {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {["C++", "Java", "HTML/CSS", "JavaScript", "Python", "SQL", "Public speaking", "Team leadership", "Problem solving", "Project management"].map((skill) => (
                                                <div key={skill} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`skill_${skill}`}
                                                        checked={formData.skills?.includes(skill) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("skills", skill, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`skill_${skill}`} className="text-sm cursor-pointer">{skill}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Current background experience: <span className="text-destructive">*</span></Label>
                                        {errors.backgroundExperience && <p className="text-sm text-destructive">{errors.backgroundExperience}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { id: "completedCourse", label: "Completed a full programming course" },
                                                { id: "builtWebApp", label: "Built and deployed a web app" },
                                                { id: "workedOnProjects", label: "Worked on personal/school projects" },
                                                { id: "noExperience", label: "No prior experience" },
                                            ].map((exp) => (
                                                <div key={exp.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`exp_${exp.id}`}
                                                        checked={formData.backgroundExperience?.includes(exp.id) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("backgroundExperience", exp.id, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`exp_${exp.id}`} className="text-sm cursor-pointer">{exp.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="text-primary" size={24} />
                                        Interests and Career Goals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please complete all required sections before continuing.
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <Label>What are the main skills or subjects you wish to learn or improve? <span className="text-destructive">*</span></Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {["Web Development", "Data Science", "Mobile App Development", "Cloud Computing", "AI/ML", "Cybersecurity", "UI/UX Design", "Digital Marketing", "Project Management", "Data Analysis", "Software Engineering", "DevOps"].map((interest) => (
                                                <div key={interest} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`interest_${interest}`}
                                                        checked={formData.interests?.includes(interest) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("interests", interest, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`interest_${interest}`} className="text-sm cursor-pointer">{interest}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What are your primary learning goals? <span className="text-destructive">*</span></Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {["Getting a job/internship", "Cracking competitive exams", "Building projects", "Gaining practical knowledge", "Career advancement", "Personal interest"].map((goal) => (
                                                <div key={goal} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`goal_${goal}`}
                                                        checked={formData.learningGoals?.includes(goal) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("learningGoals", goal, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`goal_${goal}`} className="text-sm cursor-pointer">{goal}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
                                    {errors.learningGoals && <p className="text-sm text-destructive">{errors.learningGoals}</p>}
                                    <div className="space-y-2">
                                        <Label htmlFor="targetRoles">Which industries or roles are you interested in? <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            id="targetRoles"
                                            placeholder="e.g., Software Development, Data Science, Networking, UI/UX Design, etc."
                                            value={formData.targetRoles || ""}
                                            onChange={(e) => { handleChange("targetRoles", e.target.value); setErrors((prev) => ({ ...prev, targetRoles: "" })); }}
                                            aria-invalid={!!errors.targetRoles}
                                        />
                                        {errors.targetRoles && <p className="text-sm text-destructive">{errors.targetRoles}</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Domain and stack (select from taxonomy): <span className="text-destructive">*</span></Label>
                                        {errors.domainStack && <p className="text-sm text-destructive">{errors.domainStack}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { id: "dataSciencePython", label: "Data Science with Python" },
                                                { id: "frontendReact", label: "Front-end with React" },
                                                { id: "backendNode", label: "Back-end with Node.js" },
                                                { id: "cloudAWS", label: "Cloud with AWS" },
                                                { id: "mobileFlutter", label: "Mobile with Flutter" },
                                                { id: "devopsDocker", label: "DevOps with Docker" },
                                                { id: "aiML", label: "AI/ML" },
                                                { id: "cybersecurity", label: "Cybersecurity" },
                                            ].map((domain) => (
                                                <div key={domain.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`domain_${domain.id}`}
                                                        checked={formData.domainStack?.includes(domain.id) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("domainStack", domain.id, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`domain_${domain.id}`} className="text-sm cursor-pointer">{domain.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="text-primary" size={24} />
                                        Learning Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please complete all required sections before continuing.
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <Label>What type of learning best suits you? <span className="text-destructive">*</span></Label>
                                        {errors.learningTypes && <p className="text-sm text-destructive">{errors.learningTypes}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: "videos", label: "Videos", desc: "Visual and auditory learning" },
                                                { id: "reading", label: "Reading articles", desc: "Text-based content" },
                                                { id: "projects", label: "Hands-on projects", desc: "Learning by doing" },
                                                { id: "quizzes", label: "Quizzes", desc: "Testing knowledge" },
                                            ].map((type) => (
                                                <div key={type.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <Checkbox
                                                        id={type.id}
                                                        checked={formData.learningTypes?.includes(type.id) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("learningTypes", type.id, checked as boolean)
                                                        }
                                                    />
                                                    <div>
                                                        <Label htmlFor={type.id} className="font-medium cursor-pointer">{type.label}</Label>
                                                        <p className="text-sm text-muted-foreground">{type.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What is your learning style? <span className="text-destructive">*</span></Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { id: "visual", label: "Visual", icon: "👁️" },
                                                { id: "auditory", label: "Auditory", icon: "👂" },
                                                { id: "reading", label: "Reading/Writing", icon: "📖" },
                                                { id: "kinesthetic", label: "Kinesthetic", icon: "✋" },
                                            ].map((style) => (
                                                <div key={style.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`style_${style.id}`}
                                                        checked={formData.learningStyles?.includes(style.id) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("learningStyles", style.id, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`style_${style.id}`} className="cursor-pointer">{style.icon} {style.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What is your pace and attention span? <span className="text-destructive">*</span></Label>
                                        {errors.pacePreference && <p className="text-sm text-destructive">{errors.pacePreference}</p>}
                                        <RadioGroup
                                            value={formData.pacePreference || ""}
                                            onValueChange={(value) => handleChange("pacePreference", value)}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                        >
                                            {[
                                                { id: "fast", label: "Fast learner", desc: "Can focus for extended periods" },
                                                { id: "moderate", label: "Moderate", desc: "Regular attention span" },
                                                { id: "slow", label: "Need more time", desc: "Prefer shorter sessions" },
                                            ].map((option) => (
                                                <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <div>
                                                        <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.label}</Label>
                                                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Do you prefer guided paths or self-paced learning? <span className="text-destructive">*</span></Label>
                                        {errors.learningStyle && <p className="text-sm text-destructive">{errors.learningStyle}</p>}
                                        <RadioGroup
                                            value={formData.learningStyle || ""}
                                            onValueChange={(value) => handleChange("learningStyle", value)}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="guided" id="guided" />
                                                <Label htmlFor="guided" className="cursor-pointer">
                                                    <span className="font-medium">Guided paths with deadlines</span>
                                                    <p className="text-sm text-muted-foreground">Structured learning with set timelines</p>
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="selfPaced" id="selfPaced" />
                                                <Label htmlFor="selfPaced" className="cursor-pointer">
                                                    <span className="font-medium">Self-paced learning</span>
                                                    <p className="text-sm text-muted-foreground">Learn at your own convenience</p>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 4 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="text-primary" size={24} />
                                        Time Commitment & Motivation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please complete all required sections before continuing.
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <Label>How much time can you dedicate to learning? <span className="text-destructive">*</span></Label>
                                        {errors.timeCommitment && <p className="text-sm text-destructive">{errors.timeCommitment}</p>}
                                        <RadioGroup
                                            value={formData.timeCommitment || ""}
                                            onValueChange={(value) => handleChange("timeCommitment", value)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {[
                                                { id: "less1hr", label: "<1 hour/day", desc: "Light learning" },
                                                { id: "1-2hrs", label: "1-2 hours/day", desc: "Regular commitment" },
                                                { id: "2-5hrs", label: "2-5 hours/day", desc: "Moderate pace" },
                                                { id: "5plus", label: "5+ hours/day", desc: "Intensive learning" },
                                            ].map((option) => (
                                                <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <div>
                                                        <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.label}</Label>
                                                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What duration is acceptable? <span className="text-destructive">*</span></Label>
                                        {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                                        <RadioGroup
                                            value={formData.duration || ""}
                                            onValueChange={(value) => handleChange("duration", value)}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                        >
                                            {[
                                                { id: "less2months", label: "<2 months", desc: "Quick intensive" },
                                                { id: "2-6months", label: "2-6 months", desc: "Standard pace" },
                                                { id: "more6months", label: ">6 months", desc: "Extended learning" },
                                            ].map((option) => (
                                                <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <div>
                                                        <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.label}</Label>
                                                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Budget range per month: <span className="text-destructive">*</span></Label>
                                        {errors.budgetRange && <p className="text-sm text-destructive">{errors.budgetRange}</p>}
                                        <RadioGroup
                                            value={formData.budgetRange || ""}
                                            onValueChange={(value) => handleChange("budgetRange", value)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {[
                                                { id: "free", label: "Free", desc: "No budget" },
                                                { id: "under500", label: "Under ₹500", desc: "Budget-friendly" },
                                                { id: "500-2000", label: "₹500-₹2000", desc: "Moderate" },
                                                { id: "2000plus", label: "₹2000+", desc: "Premium" },
                                            ].map((option) => (
                                                <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <div>
                                                        <Label htmlFor={option.id} className="font-medium cursor-pointer">{option.label}</Label>
                                                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What motivates you to learn? <span className="text-destructive">*</span></Label>
                                        {errors.motivations && <p className="text-sm text-destructive">{errors.motivations}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                "Certificates",
                                                "Skill advancement",
                                                "Career growth",
                                                "Personal satisfaction",
                                            ].map((motivation) => (
                                                <div key={motivation} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`motivation_${motivation}`}
                                                        checked={formData.motivations?.includes(motivation) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("motivations", motivation, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`motivation_${motivation}`} className="cursor-pointer">{motivation}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 5 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="text-primary" size={24} />
                                        Final Feedback & Custom Requests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="featureRequests">Are there any topics or features you want to see on the platform?</Label>
                                        <Textarea
                                            id="featureRequests"
                                            placeholder="Tell us what you'd like to see in our learning platform..."
                                            value={formData.featureRequests || ""}
                                            onChange={(e) => handleChange("featureRequests", e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg border">
                                        <div className="flex items-start gap-3">
                                            <Star className="text-primary mt-0.5" size={20} />
                                            <div>
                                                <h3 className="font-medium">Thank you for completing the questionnaire!</h3>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    Your responses will help us create a personalized learning path just for you.
                                                </p>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    Click submit to get started on your learning journey.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className={`flex flex-col-reverse sm:flex-row ${step > 0 ? 'justify-between' : 'justify-end'} mt-6 sm:mt-8 gap-3 sm:gap-4`}>
                    {step > 0 && (
                        <Button variant="outline" onClick={prevStep} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                            <ChevronLeft size={20} />
                            Back
                        </Button>
                    )}

                    {step < steps.length - 1 ? (
                        <Button onClick={nextStep} className="flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto">
                            Next
                            <ChevronRight size={20} />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-auto">
                            Submit & Get Started
                            <ChevronRight size={20} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
