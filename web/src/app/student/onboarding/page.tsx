"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User, BookOpen, Target, Settings, Clock, Star, Send, LogOut, Play, Wand2, RotateCcw, Loader2, Lock, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { apiService, QuizQuestion, VarkAnswer } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUpload from "@/components/uploadcare/avatar-upload";

const steps = [
    { name: "Personal Info", icon: User },
    { name: "Skills & Assessment", icon: BookOpen },
    { name: "Career Goals", icon: Target },
    { name: "Learning Style Quiz", icon: Settings },
    { name: "Availability & Motivation", icon: Clock },
    { name: "Feedback", icon: Send },
];

const stepTitles = [
    "Basic Personal and Academic Information",
    "Prerequisite Knowledge & Skill Assessment",
    "Interests and Career Goals",
    "VARK Learning Preferences Quiz",
    "Time Commitment & Motivation",
    "Additional Details & Custom Requests",
];

const PROFICIENCY_SKILLS = ["Computer basics", "Internet navigation", "Mathematics", "English communication", "Programming fundamentals"];

export default function OnboardingForm() {
    const [step, setStep] = React.useState(0);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [hasAttemptedNext, setHasAttemptedNext] = React.useState(false);
    const [varkQuestions, setVarkQuestions] = useState<QuizQuestion[]>([]);
    const [varkAnswers, setVarkAnswers] = useState<Record<number, string>>({});
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [exitDialogOpen, setExitDialogOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const check = () => setIsSmallScreen(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handleLogout = async () => {
        try {
            await apiService.logout();
        } catch {
            // fall through
        }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        setExitDialogOpen(false);
        window.location.href = "/auth";
    };

    const handleGoHome = () => {
        setExitDialogOpen(false);
        router.push("/");
    };

    // Polling states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState<string>("pending");
    const [pollingError, setPollingError] = useState<string | null>(null);

    // Avatar state (optional during onboarding)
    const [onboardingAvatarUrl, setOnboardingAvatarUrl] = useState<string | null>(null);
    const [onboardingAvatarUuid, setOnboardingAvatarUuid] = useState<string | null>(null);

    const [formData, setFormData] = React.useState<any>({
        fullName: "",
        email: "",
        phone: "",
        education: "",
        fieldOfStudy: "",
        comfortableSubjects: [],
        skills: [],
        interests: [],
        learningGoals: [],
        targetRoles: "",
        domainStack: [],
        learningTypes: [],
        pacePreference: "moderate",
        learningStyle: "selfPaced",
        timeCommitment: "2-5hrs",
        duration: "2-6months",
        budgetRange: "500-2000",
        motivations: [],
        featureRequests: "",
        language: "en"
    });
    const router = useRouter();

    // Fetch VARK quiz and user profile details from backend
    useEffect(() => {
        apiService.getOnboardingQuiz()
            .then(res => {
                if (res.success && res.data?.questions) {
                    setVarkQuestions(res.data.questions);
                }
            })
            .catch(err => {
                console.error("Failed to load VARK quiz from backend", err);
            });
        
        apiService.getMe()
            .then(res => {
                if (res.success && res.data) {
                    if (res.data.onboarding_done) {
                        router.push("/student/dashboard");
                        return;
                    }
                    const fullName = res.data.full_name;
                    const email = res.data.email;
                    setFormData((prev: any) => ({
                        ...prev,
                        fullName: fullName || prev.fullName || "",
                        email: email || prev.email || "",
                    }));
                }
                setLoadingProfile(false);
            })
            .catch(err => {
                console.error("Failed to fetch current user profile", err);
                setLoadingProfile(false);
            });
        
        document.title = `Onboarding Questionnaire ✦ ${siteConfig.name}`;
    }, [router]);

    // Polling job status
    useEffect(() => {
        if (!jobId || pollingStatus === "completed" || pollingStatus === "failed") return;

        const interval = setInterval(async () => {
            try {
                const res = await apiService.getOnboardingStatus(jobId);
                if (res.success && res.data) {
                    const status = res.data.status;
                    setPollingStatus(status);
                    if (status === "completed" || status === "ready" || status === "success") {
                        clearInterval(interval);
                        // Persist avatar if one was uploaded
                        if (onboardingAvatarUrl) {
                            try {
                                await apiService.updateAvatar(onboardingAvatarUrl);
                            } catch (_) {}
                        }
                        // Redirect to dashboard
                        router.push("/student/dashboard");
                    } else if (status === "failed") {
                        clearInterval(interval);
                        setPollingError(res.data.error || "Recommendation engine failed.");
                    }
                }
            } catch (err) {
                console.error("Error polling onboarding status", err);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [jobId, pollingStatus, onboardingAvatarUrl]);


    const validateStep = (s: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (s === 0) {
            if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
            if (!formData.email?.trim()) {
                newErrors.email = "Email address is required";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }
            if (!formData.phone?.trim()) {
                newErrors.phone = "Phone number is required";
            } else if (!/^\+?[0-9\s-]{10,20}$/.test(formData.phone)) {
                newErrors.phone = "Please enter a valid phone number (10+ digits)";
            }
            if (!formData.education) newErrors.education = "Please select your qualification";
            if (!formData.fieldOfStudy?.trim()) newErrors.fieldOfStudy = "Field of study is required";
        } else if (s === 1) {
            const proficiencyKeys = PROFICIENCY_SKILLS.map(sk => `proficiency_${sk.replace(/\s+/g, '_')}`);
            const allRated = proficiencyKeys.every(key => formData[key]);
            if (!allRated) newErrors.proficiency = "Please rate all 5 foundational skills";
            if (!formData.skills?.length) newErrors.skills = "Select at least one skill you possess";
        } else if (s === 2) {
            if (!formData.interests?.length) newErrors.interests = "Select at least one interest";
            if (!formData.learningGoals?.length) newErrors.learningGoals = "Select at least one learning goal";
            if (!formData.targetRoles?.trim()) newErrors.targetRoles = "Please specify target industries or roles";
        } else if (s === 3) {
            // Validate VARK answers
            if (varkQuestions.length > 0) {
                const unanswered = varkQuestions.filter(q => !varkAnswers[q.id]);
                if (unanswered.length > 0) {
                    newErrors.vark = `Please answer all ${varkQuestions.length} learning style questions.`;
                }
            }
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

    const handleVarkAnswer = (questionId: number, optionId: string) => {
        setVarkAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
        setErrors(prev => ({ ...prev, vark: "" }));
    };

    const handleSubmit = async () => {
        setHasAttemptedNext(true);
        if (!validateStep(step)) return;

        setIsSubmitting(true);
        setPollingError(null);

        // Map UI selections to API payload format
        const varkAnswersPayload: VarkAnswer[] = Object.entries(varkAnswers).map(([qId, optId]) => ({
            question_id: parseInt(qId),
            option_id: optId
        }));

        // Hours per week conversion
        let hours = 10;
        if (formData.timeCommitment === "less1hr") hours = 5;
        else if (formData.timeCommitment === "1-2hrs") hours = 10;
        else if (formData.timeCommitment === "2-5hrs") hours = 20;
        else if (formData.timeCommitment === "5plus") hours = 35;

        const mathComfort = parseInt(formData.proficiency_Mathematics || "3");

        const submitPayload = {
            vark_answers: varkAnswersPayload,
            topic: formData.interests[0] || formData.fieldOfStudy || "General Technology",
            goal: formData.learningGoals.join(", "),
            hours_per_week: hours,
            math_comfort: Math.min(4, Math.max(1, mathComfort - 1)), // map 1-5 scale to 1-4 scale
            style_preferences: [...formData.learningTypes, formData.learningStyle],
            prior_knowledge: `Possesses skills: ${formData.skills.join(", ")}. Comfortable subjects: ${formData.comfortableSubjects.join(", ")}`,
            career_target: formData.targetRoles,
            language: formData.language || "en"
        };

        try {
            const response = await apiService.submitOnboarding(submitPayload);
            if (response.success && response.data) {
                setJobId(response.data.job_id);
                setPollingStatus("pending");
            } else {
                setIsSubmitting(false);
                setPollingError(response.error?.message || "Failed to submit onboarding details.");
            }
        } catch (err: any) {
            setIsSubmitting(false);
            setPollingError(err.message || "An error occurred during submission.");
        }
    };

    const fillDemoData = () => {
        setFormData((prev: any) => ({
            ...prev,
            fullName: "Raj Sharma",
            email: prev.email || "raj.sharma@example.com",
            phone: "+919876543210",
            education: "bachelor",
            fieldOfStudy: "Computer Science",
            comfortableSubjects: ["Programming in Python", "Data Structures", "Web Development"],
            proficiency_Computer_basics: "4",
            proficiency_Internet_navigation: "5",
            proficiency_Mathematics: "4",
            proficiency_English_communication: "3",
            proficiency_Programming_fundamentals: "4",
            skills: ["Python", "JavaScript", "HTML/CSS", "Problem solving"],
            interests: ["Web Development", "AI/ML", "Data Science"],
            learningGoals: ["Getting a job/internship", "Building projects"],
            targetRoles: "Software Developer",
            domainStack: ["frontendReact", "aiML"],
            learningTypes: ["videos", "projects"],
            pacePreference: "moderate",
            learningStyle: "selfPaced",
            timeCommitment: "2-5hrs",
            duration: "2-6months",
            budgetRange: "500-2000",
            motivations: ["Certificates", "Skill advancement", "Career growth"],
            language: "en"
        }));

        // Auto answer VARK questions if available
        if (varkQuestions.length > 0) {
            const autoAnswers: Record<number, string> = {};
            varkQuestions.forEach(q => {
                if (q.options?.length > 0) {
                    autoAnswers[q.id] = q.options[0].id;
                }
            });
            setVarkAnswers(autoAnswers);
        }
    };

    const clearForm = () => {
        setFormData((prev: any) => ({
            fullName: prev.fullName || "",
            email: prev.email || "",
            phone: "",
            education: "",
            fieldOfStudy: "",
            comfortableSubjects: [],
            skills: [],
            interests: [],
            learningGoals: [],
            learningTypes: [],
            motivations: [],
            domainStack: [],
            language: "en"
        }));
        setVarkAnswers({});
        setStep(0);
        setErrors({});
        setPollingError(null);
    };

    const progress = (step / (steps.length - 1)) * 100;
    const CurrentStepIcon = steps[step].icon;

    if (loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-card rounded-lg shadow-sm border space-y-6">
                    <div className="space-y-2 text-center">
                        <Skeleton className="h-8 w-64 mx-auto" />
                        <Skeleton className="h-4 w-96 mx-auto animate-pulse" />
                    </div>
                    <div className="flex justify-center gap-2 mt-4 mb-6">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="flex justify-between gap-2 border-b pb-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex flex-col items-center space-y-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md border-2 border-violet-500/20 bg-card/85 backdrop-blur-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse"></div>
                    <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center relative">
                            <Loader2 className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold tracking-tight">AI Matching in Progress</h2>
                            <p className="text-sm text-muted-foreground">
                                Analyzing your skills, VARK learning preferences, and career targets to formulate your custom curriculums.
                            </p>
                        </div>

                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                <span>Status:</span>
                                <span className="capitalize text-violet-600 dark:text-violet-400 animate-pulse font-mono">{pollingStatus}...</span>
                            </div>
                            <Progress value={pollingStatus === "pending" ? 45 : pollingStatus === "processing" ? 75 : 90} className="h-2" />
                        </div>

                        {pollingError ? (
                            <div className="p-3 w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg space-y-2">
                                <p>{pollingError}</p>
                                <Button variant="outline" size="sm" onClick={() => setIsSubmitting(false)} className="w-full h-8 text-xs">
                                    Edit Form & Retry
                                </Button>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                This will take 5-10 seconds. Please do not close this window.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen lg:h-screen flex flex-col bg-background">

            <div className="hidden lg:block w-full border-b border-border/50 bg-card/30">
                <div className="max-w-6xl mx-auto px-8 py-3">
                    <div className="flex items-center relative">
                        {steps.map((stepItem, index) => {
                            const Icon = stepItem.icon;
                            return (
                            <div key={index} className="flex-1 flex flex-col items-center z-10 relative">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index <= step
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "bg-card border-muted text-muted-foreground"
                                            } transition-colors duration-300`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium text-center ${index <= step ? "text-primary" : "text-muted-foreground"
                                            }`}
                                    >
                                        {stepItem.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <motion.div
                                        initial={{ x: -5, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                        className="absolute text-muted-foreground/30 top-2.5"
                                        style={{ left: "calc(50% + 24px)" }}
                                    >
                                        <ChevronRight size={20} />
                                    </motion.div>
                                )}
                            </div>
                            );
                        })}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10"></div>
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">

            <div className="w-full lg:w-[38%] flex flex-col p-4 pt-6 lg:p-8 lg:border-r border-border/50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-5">

                        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background border border-primary/10">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground inline-flex items-center justify-center">
                                <Sparkles size={22} className="text-foreground shrink-0 mr-1.5" />
                                Welcome Aboard
                            </h1>
                            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
                                Help us personalize your experience by answering a few questions
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fillDemoData}
                                className="flex items-center gap-1.5 text-xs hover:bg-violet-50 dark:hover:bg-violet-950/20"
                            >
                                <Wand2 size={14} className="text-violet-500" />
                                <span className="truncate">Fill Demo Data</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearForm}
                                className="flex items-center gap-1.5 text-xs"
                            >
                                <RotateCcw size={14} />
                                <span className="truncate">Clear</span>
                            </Button>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                <span className="text-sm font-medium text-muted-foreground">{step + 1} of {steps.length}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                                <CurrentStepIcon size={22} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Step {step + 1}</p>
                                <h2 className="text-lg font-semibold text-foreground leading-tight">{stepTitles[step]}</h2>
                            </div>
                        </div>

                        <div className="flex flex-col gap-0 lg:hidden">
                            {steps.map((stepItem, index) => {
                                const Icon = stepItem.icon;
                                const isActive = index <= step;
                                const isCurrent = index === step;
                                return (
                                    <div key={index} className="flex items-stretch">
                                        <div className="flex flex-col items-center w-10 shrink-0">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${isActive
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "bg-card border-muted text-muted-foreground"
                                                    } transition-colors duration-300`}
                                            >
                                                <Icon size={14} />
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div className={`w-0.5 flex-1 min-h-[16px] ${isActive && index < step ? "bg-primary" : "bg-muted"}`} />
                                            )}
                                        </div>
                                        <div className={`flex items-center pb-4 ml-2 ${isCurrent ? "text-foreground" : isActive ? "text-foreground/80" : "text-muted-foreground"}`}>
                                            <span className={`text-sm font-medium ${isCurrent ? "text-primary font-semibold" : ""}`}>
                                                {stepItem.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-6 lg:mt-0">
                    <div className="flex sm:hidden flex-row gap-3">
                        {step > 0 ? (
                            <Button variant="outline" onClick={prevStep} size="sm" className="flex items-center justify-center gap-1.5 flex-1">
                                <ChevronLeft size={16} />
                                Back
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExitDialogOpen(true)}
                                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground flex-1"
                            >
                                <LogOut size={14} />
                                <span className="truncate">Exit</span>
                            </Button>
                        )}
                        {step < steps.length - 1 ? (
                            <Button onClick={nextStep} size="sm" className="flex items-center justify-center gap-1.5 flex-1">
                                Next
                                <ChevronRight size={16} />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} size="sm" className="flex items-center justify-center gap-1.5 flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold">
                                Submit
                                <ChevronRight size={16} />
                            </Button>
                        )}
                    </div>
                    <div className="hidden sm:flex flex-row justify-between gap-3">
                        <div className="flex gap-3">
                            {step > 0 ? (
                                <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
                                    <ChevronLeft size={20} />
                                    Back
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setExitDialogOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut size={18} />
                                    <span>Exit</span>
                                </Button>
                            )}
                        </div>
                        {step < steps.length - 1 ? (
                            <Button onClick={nextStep} className="flex items-center gap-2 ml-auto">
                                Next
                                <ChevronRight size={20} />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} className="flex items-center gap-2 ml-auto bg-violet-600 hover:bg-violet-700 text-white font-bold">
                                Submit & Begin Journey
                                <ChevronRight size={20} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[62%] flex items-center justify-center p-2 lg:p-3 bg-gradient-to-br from-background via-muted/30 to-background">
                <div className="w-full h-full overflow-y-auto scrollbar-thin p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -25 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {step === 0 && (
                                <>
                                    {step === 0 && hasAttemptedNext && Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please fill in all required fields before continuing.
                                        </div>
                                    )}

                                    {/* Optional profile photo */}
                                    <div className="flex flex-col items-center pb-2">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">Profile Photo <span className="text-xs">(optional)</span></p>
                                        <AvatarUpload
                                            currentUrl={onboardingAvatarUrl}
                                            initials={(formData.fullName || "ST").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                            onUploadComplete={(url, uuid) => {
                                                setOnboardingAvatarUrl(url);
                                                setOnboardingAvatarUuid(uuid);
                                            }}
                                            onRemove={() => {
                                                setOnboardingAvatarUrl(null);
                                                setOnboardingAvatarUuid(null);
                                            }}
                                            size={80}
                                        />
                                    </div>
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
                                            <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="phone"
                                                placeholder="e.g., +919876543210"
                                                value={formData.phone || ""}
                                                onChange={(e) => { handleChange("phone", e.target.value); setErrors((prev) => ({ ...prev, phone: "" })); }}
                                                aria-invalid={!!errors.phone}
                                            />
                                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="email" className="text-muted-foreground flex items-center gap-1.5">
                                                Email Address
                                            </Label>
                                            <span className="text-[10px] sm:text-xs font-semibold text-violet-500 bg-violet-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                <Lock size={10} />
                                                Locked (Registered Email)
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                value={formData.email || ""}
                                                disabled
                                                readOnly
                                                className="bg-muted/50 border-muted text-muted-foreground cursor-not-allowed pr-10"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
                                            </div>
                                        </div>
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                                </>
                            )}

                            {step === 1 && (
                                <>
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
                                        <div className="space-y-4 pl-4">
                                            {PROFICIENCY_SKILLS.map((skill) => (
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
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    {Object.keys(errors).length > 0 && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                            Please complete all required sections before continuing.
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <Label>What are the main skills or subjects you wish to learn or improve? <span className="text-destructive">*</span></Label>
                                        {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
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
                                        {errors.learningGoals && <p className="text-sm text-destructive">{errors.learningGoals}</p>}
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

                                    <div className="space-y-2">
                                        <Label htmlFor="targetRoles">Which specific target career role are you interested in? <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="targetRoles"
                                            placeholder="e.g. Software Developer, Data Scientist, Graphic Designer"
                                            value={formData.targetRoles || ""}
                                            onChange={(e) => { handleChange("targetRoles", e.target.value); setErrors((prev) => ({ ...prev, targetRoles: "" })); }}
                                            aria-invalid={!!errors.targetRoles}
                                        />
                                        {errors.targetRoles && <p className="text-sm text-destructive">{errors.targetRoles}</p>}
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    {errors.vark && (
                                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                            {errors.vark}
                                        </div>
                                    )}

                                    {varkQuestions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 space-y-2">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <p className="text-sm text-muted-foreground">Loading quiz questions from server...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {varkQuestions.map((q, idx) => (
                                                <div key={q.id} className="space-y-3 p-4 border rounded-xl bg-muted/30">
                                                    <h3 className="font-semibold text-sm sm:text-base text-foreground flex gap-2">
                                                        <span className="text-primary font-mono">{idx + 1}.</span>
                                                        <span>{q.text}</span>
                                                    </h3>
                                                    <RadioGroup
                                                        value={varkAnswers[q.id] || ""}
                                                        onValueChange={(val) => handleVarkAnswer(q.id, val)}
                                                        className="flex flex-col gap-2 pt-1"
                                                    >
                                                        {q.options.map((opt) => (
                                                            <div 
                                                                key={opt.id} 
                                                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                                    varkAnswers[q.id] === opt.id 
                                                                        ? "border-violet-500 bg-violet-50/20 dark:bg-violet-950/10 shadow-sm" 
                                                                        : "hover:bg-muted/50 border-transparent"
                                                                }`}
                                                                onClick={() => handleVarkAnswer(q.id, opt.id)}
                                                            >
                                                                <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="mt-1" />
                                                                <Label htmlFor={`opt-${opt.id}`} className="text-sm cursor-pointer leading-normal pr-2">
                                                                    {opt.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {step === 4 && (
                                <>
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
                                                { id: "less1hr", label: "<1 hour/day (approx 5h/wk)", desc: "Light learning" },
                                                { id: "1-2hrs", label: "1-2 hours/day (approx 10h/wk)", desc: "Regular commitment" },
                                                { id: "2-5hrs", label: "2-5 hours/day (approx 20h/wk)", desc: "Moderate pace" },
                                                { id: "5plus", label: "5+ hours/day (approx 35h/wk)", desc: "Intensive learning" },
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
                                        <Label>Preferred program duration: <span className="text-destructive">*</span></Label>
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

                                    <div className="space-y-4">
                                        <Label>Preferred learning format: <span className="text-destructive">*</span></Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: "videos", label: "Videos", desc: "Visual and auditory learning" },
                                                { id: "reading", label: "Reading articles", desc: "Text-based content" },
                                                { id: "projects", label: "Hands-on projects", desc: "Learning by doing" },
                                                { id: "quizzes", label: "Interactive quizzes", desc: "Testing knowledge" },
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
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="featureRequests">Is there anything specific you want us to know about you?</Label>
                                        <Textarea
                                            id="featureRequests"
                                            placeholder="Share any special goals, learning challenges, background info, or specific needs..."
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
                                                    Your responses will be sent directly to our ML engines to classify your VARK scores and match you to tailored study tracks.
                                                </p>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    Click submit to compile recommendations.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            </div>

            {isSmallScreen ? (
                <Drawer open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Leave onboarding?</DrawerTitle>
                            <DrawerDescription>You can always come back later to complete your profile.</DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 pb-4 flex flex-row gap-2">
                            <Button variant="outline" className="flex-1 justify-center" onClick={() => setExitDialogOpen(false)}>
                                Stay Here
                            </Button>
                            <Button variant="outline" className="flex-1 justify-center" onClick={handleGoHome}>
                                Go to Home
                            </Button>
                            <Button variant="destructive" className="flex-1 justify-center" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Leave onboarding?</DialogTitle>
                            <DialogDescription>You can always come back later to complete your profile.</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-row gap-2 px-6 pb-6">
                            <Button variant="outline" className="flex-1" onClick={() => setExitDialogOpen(false)}>
                                Stay Here
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={handleGoHome}>
                                Go to Home
                            </Button>
                            <Button variant="destructive" className="flex-1" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}
