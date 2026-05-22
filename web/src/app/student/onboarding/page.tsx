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
import { signOut } from "next-auth/react";
import { authService } from "@/lib/auth";
import { ChevronLeft, ChevronRight, User, BookOpen, Target, Settings, Clock, Star, Send, LogOut } from "lucide-react";
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
        motivations: [],
        familiarWith: [],
        neurodivergentConditions: [],
        learningEnvironment: [],
        internetSituation: [],
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
        } else if (s === 2) {
            if (!formData.interests?.length && !formData.otherInterest?.trim()) newErrors.interests = "Select or specify at least one interest";
            if (!formData.learningGoals?.length && !formData.otherGoal?.trim()) newErrors.learningGoals = "Select or specify at least one learning goal";
            if (!formData.targetRoles?.trim()) newErrors.targetRoles = "Please specify target industries or roles";
        } else if (s === 3) {
            if (!formData.learningTypes?.length) newErrors.learningTypes = "Select at least one learning type";
            if (!formData.videoFormat) newErrors.videoFormat = "Please select your preferred video format";
            if (!formData.instructorStyle) newErrors.instructorStyle = "Please select instructor style preference";
            if (!formData.courseStructure) newErrors.courseStructure = "Please select course structure preference";
            if (!formData.theoryPracticeRatio) newErrors.theoryPracticeRatio = "Please select theory vs practice ratio";
            if (!formData.mathIntensity) newErrors.mathIntensity = "Please select math intensity preference";
            if (!formData.learningEnvironment?.length) newErrors.learningEnvironment = "Please select at least one learning environment";
            if (!formData.internetSituation?.length) newErrors.internetSituation = "Please select your internet situation";
            if (!formData.learningStyle) newErrors.learningStyle = "Please select your learning preference";
            if (!formData.collaborativeLearning) newErrors.collaborativeLearning = "Please select collaborative learning preference";
        } else if (s === 4) {
            if (!formData.timeCommitment) newErrors.timeCommitment = "Please select time commitment";
            if (!formData.timeline) newErrors.timeline = "Please select target timeline";
            if (!formData.motivations?.length) newErrors.motivations = "Select at least one motivation";
            if (!formData.hasResources) newErrors.hasResources = "Please select resource availability";
            if (!formData.reminders) newErrors.reminders = "Please select reminder preference";
            if (!formData.gamification) newErrors.gamification = "Please select gamification preference";
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

    const [saving, setSaving] = React.useState(false);

    const handleSubmit = async () => {
        setHasAttemptedNext(true);
        if (!validateStep(step)) return;
        
        setSaving(true);
        try {
            const userId = localStorage.getItem('user_id');
            
            if (userId) {
                const onboardingData = {
                    fullName: formData.fullName,
                    contact: formData.contact,
                    education: formData.education,
                    fieldOfStudy: formData.fieldOfStudy,
                    comfortableSubjects: formData.comfortableSubjects,
                    skills: formData.skills,
                    interests: formData.interests,
                    learningGoals: formData.learningGoals,
                    learningTypes: formData.learningTypes,
                    videoFormat: formData.videoFormat,
                    learningStyle: formData.learningStyle,
                    instructorStyle: formData.instructorStyle,
                    courseStructure: formData.courseStructure,
                    theoryPracticeRatio: formData.theoryPracticeRatio,
                    mathIntensity: formData.mathIntensity,
                    learningEnvironment: formData.learningEnvironment,
                    internetSituation: formData.internetSituation,
                    collaborativeLearning: formData.collaborativeLearning,
                    familiarWith: formData.familiarWith,
                    certifications: formData.certifications,
                    resumeUrl: formData.resume,
                    targetRoles: formData.targetRoles,
                    preferredLanguage: 'en',
                    careerGoal: formData.interests?.[0] || formData.otherInterest || null
                };
                
                const { apiService } = await import('@/lib/api');
                
                const quizResponse = await apiService.getOnboardingQuiz();
                if (!quizResponse.success || !quizResponse.data) {
                    throw new Error('Failed to load quiz');
                }
                
                const varkAnswers = quizResponse.data.questions.map(q => ({
                    question_id: q.id,
                    option_id: q.options[0].id
                }));
                
                const submitData = {
                    vark_answers: varkAnswers,
                    topic: formData.interests?.[0] || formData.otherInterest || 'general',
                    goal: formData.learningGoals?.[0] || 'curiosity',
                    hours_per_week: parseInt(formData.timeCommitment) || 5,
                    math_comfort: parseInt(formData.mathIntensity) || 3,
                    style_preferences: formData.learningTypes || [],
                    prior_knowledge: formData.skills?.[0] || 'none',
                    career_target: formData.targetRoles || undefined,
                    language: 'en'
                };
                
                const result = await apiService.submitOnboarding(submitData);
                if (!result.success) {
                    throw new Error(result.error?.message || 'Failed to submit onboarding');
                }
                
                if (result.data?.job_id) {
                    localStorage.setItem('onboarding_job_id', result.data.job_id);
                    localStorage.setItem('onboarding_profile_id', result.data.profile_id);
                }
            }
            
            localStorage.setItem('onboarding_completed', 'true');
            router.push("/student/dashboard");
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            router.push("/student/dashboard");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        authService.logout();
        await signOut({ callbackUrl: "/" });
    };

    const progress = (step / (steps.length - 1)) * 100;

    useEffect(() => {
              document.title = `Onboarding Questionaire ✦ ${siteConfig.name}`;
          }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 pt-24 sm:pt-28 pb-20 relative">
            {/* Top Right Buttons */}
            <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <LogOut size={16} />
                    Logout
                </Button>
            </div>

            



            <div className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-card rounded-lg shadow-sm border overflow-x-hidden">

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-foreground text-center">
                    Welcome to Your Learning Journey
                </h1>
                <p className="text-muted-foreground text-center mb-6 sm:mb-8 text-sm sm:text-base">
                    Help us personalize your experience by answering a few questions
                </p>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium text-muted-foreground">{step + 1} of {steps.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Step Indicators */}
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
                        {/* Step 1: Personal Info */}
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

                        {/* Step 2: Skills & Assessment */}
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
                                        <Label>Are you familiar with (choose all that apply):</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {["Online learning platforms", "Coding environments (IDEs)", "Project-based learning", "Version Control (Git)", "Cloud platforms", "Agile methodologies"].map((item) => (
                                                <div key={item} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={item}
                                                        checked={formData.familiarWith?.includes(item) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("familiarWith", item, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={item} className="text-sm cursor-pointer">{item}</Label>
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

                                    <div className="space-y-2">
                                        <Label htmlFor="certifications">Completed certifications or courses</Label>
                                        <Textarea
                                            id="certifications"
                                            placeholder="List any certifications or courses you've completed"
                                            value={formData.certifications || ""}
                                            onChange={(e) => handleChange("certifications", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="resume">Resume or LinkedIn profile URL (optional)</Label>
                                        <Input
                                            id="resume"
                                            placeholder="https://linkedin.com/in/yourprofile or https://yourportfolio.com"
                                            value={formData.resume || ""}
                                            onChange={(e) => handleChange("resume", e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Career Goals */}
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
                                        <div className="mt-2">
                                            <Input
                                                placeholder="Other (please specify)"
                                                value={formData.otherInterest || ""}
                                                onChange={(e) => handleChange("otherInterest", e.target.value)}
                                            />
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
                                        <div className="mt-2">
                                            <Input
                                                placeholder="Other goal (please specify)"
                                                value={formData.otherGoal || ""}
                                                onChange={(e) => handleChange("otherGoal", e.target.value)}
                                            />
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
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Learning Preferences */}
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
                                                { id: "notes", label: "Short notes", desc: "Concise summaries" },
                                                { id: "interactive", label: "Interactive exercises", desc: "Engaging activities" },
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
                                        <Label>What video format would you prefer? <span className="text-destructive">*</span></Label>
                                        {errors.videoFormat && <p className="text-sm text-destructive">{errors.videoFormat}</p>}
                                        <RadioGroup
                                            value={formData.videoFormat || ""}
                                            onValueChange={(value) => handleChange("videoFormat", value)}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="single" id="single" />
                                                <Label htmlFor="single" className="cursor-pointer">
                                                    <span className="font-medium">20 min long video</span>
                                                    <p className="text-sm text-muted-foreground">Complete lesson in one sitting</p>
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="chunks" id="chunks" />
                                                <Label htmlFor="chunks" className="cursor-pointer">
                                                    <span className="font-medium">4 chunks of 5min each with kinesthetics</span>
                                                    <p className="text-sm text-muted-foreground">Bite-sized lessons with hands-on activities</p>
                                                </Label>
                                            </div>
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
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="mixed" id="mixed" />
                                                <Label htmlFor="mixed" className="cursor-pointer">
                                                    <span className="font-medium">Mixed approach</span>
                                                    <p className="text-sm text-muted-foreground">Some structure with flexibility</p>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Instructor style preference: <span className="text-destructive">*</span></Label>
                                        {errors.instructorStyle && <p className="text-sm text-destructive">{errors.instructorStyle}</p>}
                                        <RadioGroup
                                            value={formData.instructorStyle || ""}
                                            onValueChange={(value) => handleChange("instructorStyle", value)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {[
                                                { id: "energetic", label: "Energetic and fast-paced" },
                                                { id: "calm", label: "Calm and methodical" },
                                                { id: "humorous", label: "Humorous and entertaining" },
                                                { id: "strict", label: "Strict and formal" },
                                                { id: "noPref", label: "No preference" },
                                            ].map((option) => (
                                                <div key={option.id} className="flex items-center gap-2">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Course structure preference: <span className="text-destructive">*</span></Label>
                                        {errors.courseStructure && <p className="text-sm text-destructive">{errors.courseStructure}</p>}
                                        <RadioGroup
                                            value={formData.courseStructure || ""}
                                            onValueChange={(value) => handleChange("courseStructure", value)}
                                            className="flex flex-col gap-4"
                                        >
                                            {[
                                                { id: "structured", label: "Highly structured", desc: "Week-by-week modules" },
                                                { id: "flexible", label: "Flexible", desc: "Self-paced, no deadlines" },
                                                { id: "projectBased", label: "Project-based", desc: "Build as you learn" },
                                                { id: "challengeBased", label: "Challenge-based", desc: "Solve problems" },
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
                                        <Label>How much theory vs practice do you want? <span className="text-destructive">*</span></Label>
                                        {errors.theoryPracticeRatio && <p className="text-sm text-destructive">{errors.theoryPracticeRatio}</p>}
                                        <RadioGroup
                                            value={formData.theoryPracticeRatio || ""}
                                            onValueChange={(value) => handleChange("theoryPracticeRatio", value)}
                                            className="flex flex-col gap-4"
                                        >
                                            {[
                                                { id: "80practice", label: "80% practice, 20% theory", desc: "Learn by doing" },
                                                { id: "60practice", label: "60% practice, 40% theory", desc: "Balanced approach" },
                                                { id: "40practice", label: "40% practice, 60% theory", desc: "Understand deeply" },
                                                { id: "20practice", label: "20% practice, 80% theory", desc: "Academic focus" },
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
                                        <Label>For technical courses, math intensity preference: <span className="text-destructive">*</span></Label>
                                        {errors.mathIntensity && <p className="text-sm text-destructive">{errors.mathIntensity}</p>}
                                        <RadioGroup
                                            value={formData.mathIntensity || ""}
                                            onValueChange={(value) => handleChange("mathIntensity", value)}
                                            className="flex flex-col gap-4"
                                        >
                                            {[
                                                { id: "minimal", label: "Minimal math", desc: "Code-focused" },
                                                { id: "light", label: "Light math", desc: "Where necessary only" },
                                                { id: "moderate", label: "Moderate math", desc: "Comfortable with it" },
                                                { id: "heavy", label: "Heavy math", desc: "Rigorous proofs and problems" },
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
                                        <Label>Your typical learning environment: <span className="text-destructive">*</span></Label>
                                        {errors.learningEnvironment && <p className="text-sm text-destructive">{errors.learningEnvironment}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                "Quiet home office/room",
                                                "Shared space (distractions present)",
                                                "During commute (mobile/audio only)",
                                                "Coffee shop/public spaces",
                                                "Workplace (lunch breaks)",
                                            ].map((env) => (
                                                <div key={env} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`env_${env.replace(/\s+/g, '_').replace(/[()/]/g, '')}`}
                                                        checked={formData.learningEnvironment?.includes(env) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("learningEnvironment", env, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`env_${env.replace(/\s+/g, '_').replace(/[()/]/g, '')}`} className="cursor-pointer">{env}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Your internet situation: <span className="text-destructive">*</span></Label>
                                        {errors.internetSituation && <p className="text-sm text-destructive">{errors.internetSituation}</p>}
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                "High-speed broadband (stream 1080p easily)",
                                                "Moderate (stream 720p, occasional buffering)",
                                                "Limited/slow (prefer downloadable content)",
                                                "Mobile data only (need low-bandwidth options)",
                                            ].map((internet) => (
                                                <div key={internet} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`internet_${internet.replace(/\s+/g, '_').replace(/[()/]/g, '')}`}
                                                        checked={formData.internetSituation?.includes(internet) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("internetSituation", internet, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`internet_${internet.replace(/\s+/g, '_').replace(/[()/]/g, '')}`} className="cursor-pointer">{internet}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Are you open to collaborative/group learning? <span className="text-destructive">*</span></Label>
                                        {errors.collaborativeLearning && <p className="text-sm text-destructive">{errors.collaborativeLearning}</p>}
                                        <RadioGroup
                                            value={formData.collaborativeLearning || ""}
                                            onValueChange={(value) => handleChange("collaborativeLearning", value)}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="yes" id="collabYes" />
                                                <Label htmlFor="collabYes" className="cursor-pointer">Yes, I enjoy learning with others</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="no" id="collabNo" />
                                                <Label htmlFor="collabNo" className="cursor-pointer">No, I prefer learning alone</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="sometimes" id="collabSometimes" />
                                                <Label htmlFor="collabSometimes" className="cursor-pointer">Sometimes, for specific activities</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5: Availability & Motivation */}
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
                                                { id: "2-5hrs", label: "2-5 hours/week", desc: "Moderate pace" },
                                                { id: "weekends", label: "Weekends only", desc: "Focused weekend learning" },
                                                { id: "flexible", label: "Flexible/No preference", desc: "Varies by week" },
                                                { id: "intensive", label: "Full-time (5+ hrs/day)", desc: "Intensive learning" },
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
                                        <Label>What is your target completion timeline? <span className="text-destructive">*</span></Label>
                                        {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
                                        <RadioGroup
                                            value={formData.timeline || ""}
                                            onValueChange={(value) => handleChange("timeline", value)}
                                            className="flex flex-wrap gap-4"
                                        >
                                            {[
                                                { id: "1month", label: "<1 month" },
                                                { id: "1-3months", label: "1-3 months" },
                                                { id: "3-6months", label: "3-6 months" },
                                                { id: "6+months", label: "6+ months" },
                                                { id: "noTimeline", label: "No fixed timeline" },
                                            ].map((option) => (
                                                <div key={option.id} className="flex items-center gap-2">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
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
                                                "Community recognition",
                                                "Earning potential",
                                                "Building things",
                                                "Career growth",
                                                "Personal satisfaction",
                                                "Problem solving"
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Label>Do you have stable internet access and a personal computer/laptop? <span className="text-destructive">*</span></Label>
                                            {errors.hasResources && <p className="text-sm text-destructive">{errors.hasResources}</p>}
                                            <RadioGroup
                                                value={formData.hasResources || ""}
                                                onValueChange={(value) => handleChange("hasResources", value)}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="yes" id="resourcesYes" />
                                                    <Label htmlFor="resourcesYes" className="cursor-pointer">Yes</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="no" id="resourcesNo" />
                                                    <Label htmlFor="resourcesNo" className="cursor-pointer">No</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="limited" id="resourcesLimited" />
                                                    <Label htmlFor="resourcesLimited" className="cursor-pointer">Limited access</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="accommodations">Accessibility needs or learning accommodations</Label>
                                            <Input
                                                id="accommodations"
                                                placeholder="e.g., larger fonts, screen readers, etc."
                                                value={formData.accommodations || ""}
                                                onChange={(e) => handleChange("accommodations", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Do you suffer from any of these?</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {["ADHD", "Dyslexia", "Autism"].map((condition) => (
                                                <div key={condition} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`condition_${condition}`}
                                                        checked={formData.neurodivergentConditions?.includes(condition) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleArrayChange("neurodivergentConditions", condition, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`condition_${condition}`} className="cursor-pointer">{condition}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Label>Do you want to receive regular reminders/motivational nudges? <span className="text-destructive">*</span></Label>
                                            {errors.reminders && <p className="text-sm text-destructive">{errors.reminders}</p>}
                                            <RadioGroup
                                                value={formData.reminders || ""}
                                                onValueChange={(value) => handleChange("reminders", value)}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="yes" id="remindersYes" />
                                                    <Label htmlFor="remindersYes" className="cursor-pointer">Yes</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="no" id="remindersNo" />
                                                    <Label htmlFor="remindersNo" className="cursor-pointer">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-4">
                                            <Label>Are you interested in gamified elements? <span className="text-destructive">*</span></Label>
                                            {errors.gamification && <p className="text-sm text-destructive">{errors.gamification}</p>}
                                            <RadioGroup
                                                value={formData.gamification || ""}
                                                onValueChange={(value) => handleChange("gamification", value)}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="yes" id="gamificationYes" />
                                                    <Label htmlFor="gamificationYes" className="cursor-pointer">Yes</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value="no" id="gamificationNo" />
                                                    <Label htmlFor="gamificationNo" className="cursor-pointer">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 6: Feedback */}
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

                                    <div className="space-y-2">
                                        <Label htmlFor="additionalComments">Any additional comments or preferences?</Label>
                                        <Textarea
                                            id="additionalComments"
                                            placeholder="Share any other thoughts or special requirements..."
                                            value={formData.additionalComments || ""}
                                            onChange={(e) => handleChange("additionalComments", e.target.value)}
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

                {/* Navigation */}
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