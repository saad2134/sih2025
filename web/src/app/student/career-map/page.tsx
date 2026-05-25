"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Target, 
  BookOpen, 
  Briefcase, 
  Award, 
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  Edit3,
  RotateCcw,
  Calendar,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

const iconMap: Record<string, any> = {
  CheckCircle2,
  BookOpen,
  Briefcase,
  Award,
  Target
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

interface MilestoneDetails {
  skills: string[];
  resources: string[];
  nextSteps: string;
  provider?: string;
  level?: string;
  salary?: string;
  companies?: string[];
  course_id?: string;
  enrolment_id?: string;
  current_week?: number;
  study_mode?: string;
  url?: string;
}

interface Milestone {
  id: number;
  title: string;
  status: string;
  type: string;
  description: string;
  duration: string;
  progress: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  bgColor: string;
  details: MilestoneDetails;
}

export default function CareerMap() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [selectedMilestone, setSelectedMilestone] = React.useState<Milestone | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [careerPath, setCareerPath] = React.useState<any>(null);
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [generatedAt, setGeneratedAt] = React.useState<string | null>(null);
  const [isStale, setIsStale] = React.useState<boolean>(false);
  const [regenerating, setRegenerating] = React.useState<boolean>(false);

  // Dialog States
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = React.useState("");
  const [infoDialogDesc, setInfoDialogDesc] = React.useState("");

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = React.useState("");
  const [confirmDialogDesc, setConfirmDialogDesc] = React.useState("");
  const [confirmType, setConfirmType] = React.useState<'reset' | 'remove' | null>(null);
  const [actionMilestone, setActionMilestone] = React.useState<Milestone | null>(null);

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = React.useState(false);
  const [rescheduleWeek, setRescheduleWeek] = React.useState("");

  React.useEffect(() => {
    document.title = `My Career Map ✦ ${siteConfig.name}`;
    loadCareerMap();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const loadCareerMap = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCareerMap();
      if (res.success && res.data) {
        setCareerPath(res.data.career_path);
        setGeneratedAt(res.data.generated_at || null);
        setIsStale(!!res.data.is_stale);
        
        // Map icon strings to components
        const mapped = (res.data.milestones || []).map((m: any) => ({
          ...m,
          icon: iconMap[m.icon] || BookOpen
        }));
        setMilestones(mapped);
      }
    } catch (err) {
      console.error("Failed to load career map", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await apiService.regenerateCareerMap();
      if (res.success && res.data) {
        setCareerPath(res.data.career_path);
        setGeneratedAt(res.data.generated_at || null);
        setIsStale(false);
        
        // Map icon strings to components
        const mapped = (res.data.milestones || []).map((m: any) => ({
          ...m,
          icon: iconMap[m.icon] || BookOpen
        }));
        setMilestones(mapped);
        setSelectedMilestone(null);
      }
    } catch (err) {
      console.error("Failed to regenerate career map", err);
    } finally {
      setRegenerating(false);
    }
  };

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

  if (loading || !careerPath) {
    return (
      <div className="p-4 sm:p-6 pb-24 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const handleMilestoneSelect = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
  };

  const handleCloseSheet = () => {
    setSelectedMilestone(null);
  };

  const handleStudyModeChange = async (milestone: Milestone, studyMode: string) => {
    try {
      setLoading(true);
      const enrolmentId = milestone.details.enrolment_id;
      let res;
      if (enrolmentId) {
        res = await apiService.updateEnrolment(enrolmentId, { study_mode: studyMode });
      } else {
        res = await apiService.overrideMilestone(milestone.id, studyMode);
      }
      
      if (res.success) {
        const resMap = await apiService.getCareerMap();
        if (resMap.success && resMap.data) {
          setCareerPath(resMap.data.career_path);
          const mapped = (resMap.data.milestones || []).map((m: any) => ({
            ...m,
            icon: iconMap[m.icon] || BookOpen
          }));
          setMilestones(mapped);
          const updated = mapped.find((m: any) => m.id === milestone.id);
          if (updated) {
            setSelectedMilestone(updated);
          }
        }
      }
    } catch (err) {
      console.error("Failed to change study mode", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleClick = (milestone: Milestone) => {
    setActionMilestone(milestone);
    setRescheduleWeek(String(milestone.details.current_week || 1));
    setRescheduleDialogOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!actionMilestone) return;
    const week = parseInt(rescheduleWeek);
    if (isNaN(week) || week < 0) return;
    setRescheduleDialogOpen(false);
    
    try {
      setLoading(true);
      const enrolmentId = actionMilestone.details.enrolment_id;
      if (!enrolmentId) return;
      
      const res = await apiService.updateEnrolment(enrolmentId, { current_week: week });
      if (res.success) {
        const resMap = await apiService.getCareerMap();
        if (resMap.success && resMap.data) {
          setCareerPath(resMap.data.career_path);
          const mapped = (resMap.data.milestones || []).map((m: any) => ({
            ...m,
            icon: iconMap[m.icon] || BookOpen
          }));
          setMilestones(mapped);
          const updated = mapped.find((m: any) => m.id === actionMilestone.id);
          if (updated) {
            setSelectedMilestone(updated);
          }
        }
      }
    } catch (err) {
      console.error("Failed to reschedule milestone", err);
    } finally {
      setLoading(false);
      setActionMilestone(null);
    }
  };

  const handleResetProgressClick = (milestone: Milestone) => {
    setActionMilestone(milestone);
    setConfirmType('reset');
    setConfirmDialogTitle("Reset Course Progress");
    setConfirmDialogDesc(`Are you sure you want to reset your progress for "${milestone.title}"? This will revert your completion percentage to 0%.`);
    setConfirmDialogOpen(true);
  };

  const handleRemoveCourseClick = (milestone: Milestone) => {
    setActionMilestone(milestone);
    setConfirmType('remove');
    setConfirmDialogTitle("Remove Course from Journey");
    setConfirmDialogDesc(`Are you sure you want to remove "${milestone.title}" from your career journey? This will drop your enrolment and remove it from the learning path.`);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!actionMilestone || !confirmType) return;
    setConfirmDialogOpen(false);
    
    try {
      setLoading(true);
      const enrolmentId = actionMilestone.details.enrolment_id;
      if (!enrolmentId) return;
      
      let res;
      if (confirmType === 'reset') {
        res = await apiService.updateEnrolment(enrolmentId, { progress_pct: 0 });
      } else if (confirmType === 'remove') {
        res = await apiService.updateEnrolment(enrolmentId, { dropped: true });
      }
      
      if (res && res.success) {
        const resMap = await apiService.getCareerMap();
        if (resMap.success && resMap.data) {
          setCareerPath(resMap.data.career_path);
          const mapped = (resMap.data.milestones || []).map((m: any) => ({
            ...m,
            icon: iconMap[m.icon] || BookOpen
          }));
          setMilestones(mapped);
          
          if (confirmType === 'remove') {
            setSelectedMilestone(null);
          } else {
            const updated = mapped.find((m: any) => m.id === actionMilestone.id);
            if (updated) {
              setSelectedMilestone(updated);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Failed to ${confirmType} milestone`, err);
    } finally {
      setLoading(false);
      setConfirmType(null);
      setActionMilestone(null);
    }
  };

  const handleMarkComplete = async (milestone: Milestone) => {
    const enrolmentId = milestone.details.enrolment_id;
    if (!enrolmentId) return;
    
    try {
      setLoading(true);
      const res = await apiService.updateEnrolment(enrolmentId, { progress_pct: 100 });
      if (res.success) {
        const resMap = await apiService.getCareerMap();
        if (resMap.success && resMap.data) {
          setCareerPath(resMap.data.career_path);
          const mapped = (resMap.data.milestones || []).map((m: any) => ({
            ...m,
            icon: iconMap[m.icon] || BookOpen
          }));
          setMilestones(mapped);
          const updated = mapped.find((m: any) => m.id === milestone.id);
          if (updated) {
            setSelectedMilestone(updated);
          }
        }
      }
    } catch (err) {
      console.error("Failed to mark milestone complete", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDetails = (milestone: Milestone) => {
    setInfoDialogTitle("Course Details Notice");
    setInfoDialogDesc("To edit course details or view details of this course, please visit the course catalog or contact ShikshaDisha support.");
    setInfoDialogOpen(true);
  };


  return (
    <div className="p-4 sm:p-6 pb-24 w-full">
      {isStale && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex items-start sm:items-center gap-3 text-sm"
        >
          <AlertCircle size={18} className="shrink-0 text-amber-500 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <span className="font-semibold">Path Auto-Updated: </span>
            Your profile or course enrollments have changed, so your custom career map was successfully auto-regenerated!
          </div>
        </motion.div>
      )}

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
                  {generatedAt && (
                    <p className="text-xs text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                      <Clock size={12} />
                      Generated on: {formatDate(generatedAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Badge variant="secondary" className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 w-fit justify-center">
                  {careerPath.match}% Path Match
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 px-3 gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-all w-fit"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                >
                  <RefreshCw size={14} className={regenerating ? "animate-spin text-primary" : "text-primary"} />
                  {regenerating ? "Regenerating..." : "Regenerate Path"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
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
                            selectedMilestone?.id === milestone.id 
                              ? 'ring-2 ring-primary border-primary bg-primary/5' 
                              : 'border-border'
                          }`}
                          onClick={() => handleMilestoneSelect(milestone)}
                        >
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
                                  {milestone.details.study_mode && milestone.details.study_mode !== "standard" && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                                      {milestone.details.study_mode === "already_studied" ? "Already Studied" : "Learned Off Platform"}
                                    </Badge>
                                  )}
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

                            <div className="flex flex-wrap gap-2">
                              {milestone.details.skills.slice(0, 3).map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {milestone.details.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{milestone.details.skills.length - 3} more
                                </Badge>
                              )}
                            </div>

                            {milestone.status === "current" && (
                              <Button 
                                className="mt-4 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push('/student/dashboard');
                                }}
                              >
                                Continue Learning
                                <ArrowRight size={16} />
                              </Button>
                            )}
                            {milestone.status === "upcoming" && (
                              <Button 
                                variant="outline" 
                                className="mt-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push('/student/browse-courses');
                                }}
                              >
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

        <div className="space-y-4 lg:space-y-6 min-w-0 lg:sticky lg:top-24 lg:self-start lg:order-none">
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
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={
                            selectedMilestone.status === "completed" ? "default" :
                            selectedMilestone.status === "current" ? "secondary" : "outline"
                          }
                        >
                          {getStatusText(selectedMilestone.status)}
                        </Badge>
                        {selectedMilestone.details.study_mode && selectedMilestone.details.study_mode !== "standard" && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                            {selectedMilestone.details.study_mode === "already_studied" ? "Already Studied" : "Learned Off Platform"}
                          </Badge>
                        )}
                      </div>
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
                    {selectedMilestone.details.url && selectedMilestone.details.url !== '#' && (
                      <div>
                        <h4 className="font-medium mb-2">Course Website</h4>
                        <Button variant="outline" size="sm" className="gap-1.5 w-full justify-start text-xs h-9" asChild>
                          <a href={selectedMilestone.details.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={13} className="text-primary" />
                            Preview / Visit Course
                          </a>
                        </Button>
                      </div>
                    )}
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Make Changes
                      </h4>
                      
                      {selectedMilestone.type === "course" && (
                        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs flex items-start gap-2">
                          <AlertCircle size={14} className="shrink-0 text-amber-500 mt-0.5" />
                          <div>
                            To edit course details or view details of this course, please visit the course catalog or contact ShikshaDisha support.
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="text-xs font-medium mb-1.5 block">Study Mode</label>
                        <select
                          value={selectedMilestone.details.study_mode || "standard"}
                          onChange={(e) => handleStudyModeChange(selectedMilestone, e.target.value)}
                          className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                        >
                          <option value="standard">Standard</option>
                          <option value="already_studied">Already Studied</option>
                          <option value="learned_off_platform">Learned Off Platform</option>
                        </select>
                      </div>

                      {selectedMilestone.details.enrolment_id && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleRescheduleClick(selectedMilestone)}
                            >
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              Reschedule
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleResetProgressClick(selectedMilestone)}
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              Reset Progress
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs col-span-2"
                              onClick={() => handleMarkComplete(selectedMilestone)}
                            >
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />
                              Mark Complete
                            </Button>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="text-xs w-full"
                            onClick={() => handleRemoveCourseClick(selectedMilestone)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove Course
                          </Button>
                        </div>
                      )}
                    </div>

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

        {isMobile && selectedMilestone && (
          <Sheet open={true} onOpenChange={handleCloseSheet}>
            <SheetContent side="bottom" className="h-[85dvh] overflow-y-auto rounded-t-2xl  z-1000">
              <SheetHeader className="pr-12">
                <SheetTitle className="flex items-center gap-2">
                  {React.createElement(selectedMilestone.icon, {
                    className: selectedMilestone.color,
                    size: 22,
                  })}
                  {selectedMilestone.title}
                </SheetTitle>
                <SheetDescription className="text-left">
                  {selectedMilestone.description}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6 pb-8">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="flex flex-wrap gap-2">
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
                    {selectedMilestone.details.study_mode && selectedMilestone.details.study_mode !== "standard" && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                        {selectedMilestone.details.study_mode === "already_studied" ? "Already Studied" : "Learned Off Platform"}
                      </Badge>
                    )}
                  </div>
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
                {selectedMilestone.details.url && selectedMilestone.details.url !== '#' && (
                  <div>
                    <h4 className="font-medium mb-2">Course Website</h4>
                    <Button variant="outline" size="sm" className="gap-1.5 w-full justify-start text-xs h-9" asChild>
                      <a href={selectedMilestone.details.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={13} className="text-primary" />
                        Preview / Visit Course
                      </a>
                    </Button>
                  </div>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Make Changes
                  </h4>
                  
                  {selectedMilestone.type === "course" && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        To edit course details or view details of this course, please visit the course catalog or contact ShikshaDisha support.
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="text-xs font-medium mb-1.5 block">Study Mode</label>
                    <select
                      value={selectedMilestone.details.study_mode || "standard"}
                      onChange={(e) => handleStudyModeChange(selectedMilestone, e.target.value)}
                      className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                    >
                      <option value="standard">Standard</option>
                      <option value="already_studied">Already Studied</option>
                      <option value="learned_off_platform">Learned Off Platform</option>
                    </select>
                  </div>

                  {selectedMilestone.details.enrolment_id && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleRescheduleClick(selectedMilestone)}
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleResetProgressClick(selectedMilestone)}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Reset Progress
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs col-span-2"
                          onClick={() => handleMarkComplete(selectedMilestone)}
                        >
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="text-xs w-full"
                        onClick={() => handleRemoveCourseClick(selectedMilestone)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove Course
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        {/* Info Dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                {infoDialogTitle}
              </DialogTitle>
              <DialogDescription className="text-left mt-2">
                {infoDialogDesc}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button onClick={() => setInfoDialogOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Confirm Dialog (Reset / Remove) */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className={`w-5 h-5 ${confirmType === 'remove' ? 'text-destructive' : 'text-primary'}`} />
                {confirmDialogTitle}
              </DialogTitle>
              <DialogDescription className="text-left mt-2">
                {confirmDialogDesc}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 flex flex-row justify-end">
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={confirmType === 'remove' ? 'destructive' : 'default'} 
                onClick={handleConfirmAction}
              >
                {confirmType === 'remove' ? 'Remove' : 'Reset'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Reschedule Milestone
              </DialogTitle>
              <DialogDescription className="text-left mt-2">
                Specify the new current week of learning for this course.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs font-semibold block mb-1">Current Learning Week</label>
              <input 
                type="number" 
                min="1" 
                value={rescheduleWeek} 
                onChange={(e) => setRescheduleWeek(e.target.value)} 
                className="w-full text-sm border rounded-md px-3 py-2 bg-background" 
              />
            </div>
            <DialogFooter className="mt-2 gap-2 flex flex-row justify-end">
              <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReschedule}
                disabled={!rescheduleWeek || isNaN(parseInt(rescheduleWeek)) || parseInt(rescheduleWeek) < 1}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}