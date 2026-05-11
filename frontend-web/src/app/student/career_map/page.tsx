"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { authService } from "@/lib/auth";
import { apiService, UserProfile } from "@/lib/api";
import { LearnerProfile } from "@/lib/api";

const [userData, setUserData] = useState<UserProfile | null>(null);
const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
const [loading, setLoading] = useState(true);

    const loadData = async () => {
      try {
        const [meResponse, profileResponse] = await Promise.all([
          apiService.getMe(),
          apiService.getLearnerProfile()
        ]);
        
        if (meResponse.success && meResponse.data) {
          setUserData(meResponse.data);
        }
        if (profileResponse.success && profileResponse.data) {
          setLearnerProfile(profileResponse.data);
        }
      } catch (err) {
        console.error('Failed to load career map data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    authService.logout();
    await signOut({ callbackUrl: "/" });
  };

  const handleBack = () => {
    router.push("/student/dashboard");
  };

  const careerPath = {
    goal: userData?.career_goal || userData?.target_roles || userData?.interests?.[0] || "Your Career Path",
    duration: userStats?.weeks_remaining ? `${userStats.weeks_remaining} weeks` : "12 weeks",
    level: userData?.preferred_nsqf_level ? `NSQF Level ${userData.preferred_nsqf_level}` : "Beginner",
    match: 92
  };

  const userProgress = userStats?.progress || 0;
  const userInterests = userData?.interests || [];
  const userSkills = userData?.skills || [];
  
  const milestones = [
    {
      id: 1,
      title: "Profile Setup",
      status: userProgress >= 10 ? "completed" : "completed",
      type: "onboarding",
      description: "Career assessment and goal setting completed",
      duration: "Completed",
      progress: userProgress >= 10 ? 100 : 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      details: {
        skills: userSkills.slice(0, 3),
        interests: userInterests.slice(0, 2),
        nextSteps: userProgress >= 10 ? "Begin foundational courses" : "Complete your profile"
      }
    },
    {
      id: 2,
      title: userInterests[0] ? `${userInterests[0]} Fundamentals` : "Foundation Course",
      status: userProgress >= 30 ? "completed" : userProgress >= 10 ? "current" : "upcoming",
      type: "course",
      description: `Build foundational skills in ${userInterests[0] || 'your chosen field'}`,
      duration: "6 weeks",
      progress: userProgress >= 30 ? 100 : Math.max(0, userProgress - 10) * 5,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      details: {
        skills: userSkills.slice(0, 4),
        nextSteps: userProgress >= 30 ? "Move to advanced topics" : "Complete module 1",
        level: "Beginner"
      }
    },
    {
      id: 3,
      title: "Skill Certification",
      status: userProgress >= 50 ? "completed" : userProgress >= 30 ? "current" : "upcoming",
      type: "certification",
      description: "Earn industry-recognized certification",
      duration: "8 weeks",
      progress: userProgress >= 50 ? 100 : Math.max(0, userProgress - 30) * 5,
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      details: {
        skills: userSkills,
        nextSteps: userProgress >= 50 ? "Apply for internship" : "Prepare for certification exam",
        level: "Intermediate"
      }
    },
    {
      id: 4,
      title: "Practical Application",
      status: userProgress >= 70 ? "completed" : userProgress >= 50 ? "current" : "upcoming",
      type: "internship",
      description: "Apply your skills in real-world projects",
      duration: "3 months",
      progress: userProgress >= 70 ? 100 : Math.max(0, userProgress - 50) * 5,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      details: {
        skills: userSkills,
        nextSteps: userProgress >= 70 ? "Prepare for job placement" : "Complete certification first",
        level: "Intermediate to Advanced"
      }
    },
    {
      id: 5,
      title: userData?.career_goal ? `Career: ${userData.career_goal}` : "Career Ready",
      status: userProgress >= 90 ? "completed" : userProgress >= 70 ? "current" : "upcoming",
      type: "job",
      description: "Start your professional career journey",
      duration: "Ongoing",
      progress: userProgress >= 90 ? 100 : Math.max(0, userProgress - 70) * 5,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      details: {
        goal: userData?.career_goal || userData?.target_roles || "Your target role",
        nextSteps: userProgress >= 90 ? "You are job ready!" : "Complete practical application",
        salary: "Based on market rates"
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 sm:pt-28 px-4 sm:px-6 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your career path...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 border-green-500 text-white";
      case "current": return "bg-blue-500 border-blue-500 text-white animate-pulse";
      case "upcoming": return "bg-gray-300 border-gray-300 text-gray-600";
      default: return "bg-gray-300 border-gray-300 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "current": return "In Progress";
      case "upcoming": return "Upcoming";
      default: return "Not Started";
    }
  };

  useEffect(() => {
          document.title = `My Career Map ✦ ${siteConfig.name}`;
      }, []);

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 pt-24 sm:pt-28 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="outline" onClick={handleBack} className="flex items-center justify-center gap-2 w-fit">
              <ChevronLeft size={16} />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Career Journey Map</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Your personalized path to becoming a {careerPath.goal}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center justify-center gap-2 w-fit self-start sm:self-auto">
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        {/* Career Path Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg shrink-0">
                    <Target className="text-primary" size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold">Your Path to {careerPath.goal}</h2>
                    <p className="text-sm text-muted-foreground">
                      Estimated duration: {careerPath.duration} • Level: {careerPath.level}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 w-fit">
                  {careerPath.match}% Path Match
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Journey Timeline - 3/4 width */}
          <div className="lg:col-span-3 order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="text-primary" size={20} />
                    Your Learning Journey
                  </CardTitle>
                  <CardDescription>
                    Follow this step-by-step path to achieve your career goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {milestones.map((milestone, index) => {
                      const Icon = milestone.icon;
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                          <div 
                            className={`flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedMilestone?.id === milestone.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedMilestone(milestone)}
                          >
                            {/* Progress Connector */}
                            <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${getStatusColor(milestone.status)}`}>
                                <Icon size={18} className="sm:w-5 sm:h-5" />
                              </div>
                              {index < milestones.length - 1 && (
                                <div className={`hidden sm:block flex-1 w-0.5 mt-2 ${
                                  milestone.status === "completed" ? 'bg-green-500' : 
                                  milestone.status === "current" ? 'bg-blue-500' : 'bg-gray-300'
                                }`} style={{ height: '80px' }} />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                <div className="min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold flex flex-wrap items-center gap-2">
                                    {milestone.title}
                                    <Badge 
                                      variant={
                                        milestone.status === "completed" ? "default" :
                                        milestone.status === "current" ? "secondary" : "outline"
                                      }
                                    >
                                      {getStatusText(milestone.status)}
                                    </Badge>
                                  </h3>
                                  <p className="text-muted-foreground mt-1">{milestone.description}</p>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock size={14} />
                                    <span>{milestone.duration}</span>
                                  </div>
                                  {milestone.progress > 0 && (
                                    <div className="w-32 mt-2">
                                      <Progress value={milestone.progress} className="h-2" />
                                      <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Skills Preview */}
                              <div className="flex flex-wrap gap-2">
                                {(milestone.details.skills || []).slice(0, 3).map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {(milestone.details.skills || []).length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(milestone.details.skills || []).length - 3} more
                                  </Badge>
                                )}
                              </div>

                              {/* Action Button */}
                              {milestone.status === "current" && (
                                <Button className="mt-4 flex items-center gap-2">
                                  Continue Learning
                                  <ArrowRight size={16} />
                                </Button>
                              )}
                              {milestone.status === "upcoming" && (
                                <Button variant="outline" className="mt-4">
                                  Preview Content
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Milestone Details */}
          <div className="space-y-4 lg:space-y-6 min-w-0 lg:sticky lg:top-24 lg:self-start order-2 lg:order-none">
            {/* Selected Milestone Details - desktop only; mobile uses Sheet below */}
            <div className="hidden lg:block">
            {selectedMilestone ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {React.createElement(selectedMilestone.icon, { 
                        className: selectedMilestone.color,
                        size: 20 
                      })}
                      {selectedMilestone.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedMilestone.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge 
                        variant={
                          selectedMilestone.status === "completed" ? "default" :
                          selectedMilestone.status === "current" ? "secondary" : "outline"
                        }
                      >
                        {getStatusText(selectedMilestone.status)}
                      </Badge>
                    </div>

                    {/* Duration */}
                    <div>
                      <h4 className="font-medium mb-2">Duration</h4>
                      <p className="text-sm text-muted-foreground">{selectedMilestone.duration}</p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-medium mb-2">Skills You'll Learn</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMilestone.details.skills.map((skill: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-medium mb-2">Resources</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedMilestone.details.resources.map((resource: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                          <li key={index}>• {resource}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h4 className="font-medium mb-2">Next Steps</h4>
                      <p className="text-sm text-muted-foreground">{selectedMilestone.details.nextSteps}</p>
                    </div>

                    {/* Provider/Level if available */}
                    {selectedMilestone.details.provider && (
                      <div>
                        <h4 className="font-medium mb-2">Provider</h4>
                        <p className="text-sm text-muted-foreground">{selectedMilestone.details.provider}</p>
                        <p className="text-xs text-muted-foreground">Level: {selectedMilestone.details.level}</p>
                      </div>
                    )}

                    {/* Salary info for job milestone */}
                    {selectedMilestone.details.salary && (
                      <div>
                        <h4 className="font-medium mb-2">Expected Salary</h4>
                        <p className="text-sm text-muted-foreground">{selectedMilestone.details.salary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="mx-auto text-muted-foreground mb-4" size={32} />
                    <h3 className="font-medium mb-2">Select a Milestone</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on any milestone in your journey to see detailed information and next steps.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            </div>

            {/* Journey Summary - visible on all screens */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Journey Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Milestones</span>
                    <span className="font-semibold">{milestones.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="font-semibold text-green-600">
                      {milestones.filter(m => m.status === "completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="font-semibold text-blue-600">
                      {milestones.filter(m => m.status === "current").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Remaining</span>
                    <span className="font-semibold">
                      {milestones.filter(m => m.status === "upcoming").length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sheet - Milestone details when selected on small screens */}
      <Sheet
        open={!!selectedMilestone && isMobile}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
      >
        <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="pr-12">
            <SheetTitle className={`flex items-center gap-2 ${!selectedMilestone ? "sr-only" : ""}`}>
              {selectedMilestone ? (
                <>
                  {React.createElement(selectedMilestone.icon, {
                    className: selectedMilestone.color,
                    size: 22,
                  })}
                  {selectedMilestone.title}
                </>
              ) : (
                "Milestone details"
              )}
            </SheetTitle>
          </SheetHeader>
          {selectedMilestone && (
            <>
              <SheetDescription className="text-left">
                {selectedMilestone.description}
              </SheetDescription>
              <div className="space-y-4 mt-6 pb-8">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge
                    variant={
                      selectedMilestone.status === "completed"
                        ? "default"
                        : selectedMilestone.status === "current"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {getStatusText(selectedMilestone.status)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-sm text-muted-foreground">{selectedMilestone.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Skills You&apos;ll Learn</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedMilestone.details.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Resources</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedMilestone.details.resources.map((resource: string, index: number) => (
                      <li key={index}>• {resource}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Next Steps</h4>
                  <p className="text-sm text-muted-foreground">{selectedMilestone.details.nextSteps}</p>
                </div>
                {selectedMilestone.details.provider && (
                  <div>
                    <h4 className="font-medium mb-2">Provider</h4>
                    <p className="text-sm text-muted-foreground">{selectedMilestone.details.provider}</p>
                    <p className="text-xs text-muted-foreground">Level: {selectedMilestone.details.level}</p>
                  </div>
                )}
                {selectedMilestone.details.salary && (
                  <div>
                    <h4 className="font-medium mb-2">Expected Salary</h4>
                    <p className="text-sm text-muted-foreground">{selectedMilestone.details.salary}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}