"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  ChevronLeft,
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  ArrowRight,
  Star,
  Target,
  Zap,
  Building,
  BarChart3,
  Calendar,
  Search,
  Code,
  Palette,
  Database,
  Shield,
  Cloud,
  Smartphone,
  Brain
} from "lucide-react";
import { siteConfig } from "@/config/site";

const skills = [
  { name: "Web Development", demand: 92, growth: "+15%", salary: "₹6-12 LPA", icon: Code },
  { name: "Data Science", demand: 88, growth: "+22%", salary: "₹8-15 LPA", icon: Database },
  { name: "Cloud Computing", demand: 85, growth: "+18%", salary: "₹7-14 LPA", icon: Cloud },
  { name: "AI/ML", demand: 90, growth: "+25%", salary: "₹10-20 LPA", icon: Brain },
  { name: "Cybersecurity", demand: 82, growth: "+12%", salary: "₹6-13 LPA", icon: Shield },
  { name: "Mobile Development", demand: 78, growth: "+10%", salary: "₹5-11 LPA", icon: Smartphone },
  { name: "UI/UX Design", demand: 76, growth: "+14%", salary: "₹5-10 LPA", icon: Palette },
  { name: "DevOps", demand: 80, growth: "+16%", salary: "₹7-13 LPA", icon: Cloud },
];

const jobRoles = [
  { title: "Frontend Developer", demand: "Very High", openings: 12500, avgSalary: "₹8 LPA", growth: "+18%" },
  { title: "Backend Developer", demand: "Very High", openings: 10200, avgSalary: "₹9 LPA", growth: "+15%" },
  { title: "Full-Stack Developer", demand: "High", openings: 8900, avgSalary: "₹10 LPA", growth: "+20%" },
  { title: "Data Scientist", demand: "Very High", openings: 7600, avgSalary: "₹12 LPA", growth: "+25%" },
  { title: "ML Engineer", demand: "High", openings: 5400, avgSalary: "₹14 LPA", growth: "+28%" },
  { title: "DevOps Engineer", demand: "High", openings: 4800, avgSalary: "₹11 LPA", growth: "+16%" },
];

const companies = [
  { name: "TCS", hiring: 4500, roles: ["Software Engineer", "Developer", "Analyst"] },
  { name: "Infosys", hiring: 3800, roles: ["Engineer", "Consultant", "Developer"] },
  { name: "Wipro", hiring: 3200, roles: ["Developer", "Analyst", "Tester"] },
  { name: "Accenture", hiring: 2800, roles: ["Developer", "Analyst", "Manager"] },
  { name: "Google", hiring: 1200, roles: ["SDE", "ML Engineer", "Data Scientist"] },
  { name: "Microsoft", hiring: 950, roles: ["SDE", "Cloud Engineer", "AI Researcher"] },
];

const careerForecasts = [
  { year: 2026, webDev: 85, dataScience: 78, aiMl: 72, cloud: 68 },
  { year: 2027, webDev: 88, dataScience: 82, aiMl: 78, cloud: 74 },
  { year: 2028, webDev: 90, dataScience: 86, aiMl: 84, cloud: 80 },
  { year: 2029, webDev: 92, dataScience: 89, aiMl: 88, cloud: 85 },
  { year: 2030, webDev: 94, dataScience: 92, aiMl: 92, cloud: 90 },
];

export default function MarketInsights() {
  const router = useRouter();

  const yourPathFit = {
    currentRole: "Software Developer",
    matchScore: 92,
    demandForecast: "High Demand",
    growthRate: "+15% YoY",
    recommendedSkills: ["React", "Node.js", "TypeScript", "AWS"]
  };

  useEffect(() => {
    document.title = `Market Insights ✦ ${siteConfig.name}`;
  }, []);

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 sm:p-4 bg-white/20 rounded-full">
                    <Target size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Your Career Path Fit</p>
                    <h2 className="text-2xl sm:text-3xl font-bold">{yourPathFit.currentRole}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {yourPathFit.demandForecast}
                      </span>
                      <span>•</span>
                      <span>{yourPathFit.growthRate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center p-4 bg-white/10 rounded-lg min-w-[120px]">
                    <p className="text-3xl font-bold">{yourPathFit.matchScore}%</p>
                    <p className="text-xs text-white/70">Path Match Score</p>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-lg min-w-[120px]">
                    <p className="text-3xl font-bold">{yourPathFit.demandForecast === "High Demand" ? "9.2" : "8.5"}</p>
                    <p className="text-xs text-white/70">Job Availability Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={20} />
                  In-Demand Skills
                </CardTitle>
                <CardDescription>Top skills with highest job demand and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skills.map((skill, index) => {
                    const Icon = skill.icon;
                    return (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="text-primary" size={16} />
                            </div>
                            <h3 className="font-medium text-sm">{skill.name}</h3>
                          </div>
                          <Badge variant={skill.growth.startsWith("+") ? "default" : "secondary"} className="text-xs">
                            {skill.growth}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Demand</span>
                            <span className="font-medium">{skill.demand}%</span>
                          </div>
                          <Progress value={skill.demand} className="h-2" />
                          <p className="text-xs text-muted-foreground">{skill.salary}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Recommended Skills for You</CardTitle>
                <CardDescription>Based on your career path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {yourPathFit.recommendedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="text-amber-500" size={16} />
                      <span className="font-medium text-sm">{skill}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">High Value</Badge>
                  </div>
                ))}
                <Button className="w-full mt-4" size="sm">
                  View Learning Path
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-blue-500" size={20} />
                  Top Job Roles
                </CardTitle>
                <CardDescription>Most hiring roles in the current market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobRoles.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{role.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {role.openings.toLocaleString()} openings
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            {role.avgSalary}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <Badge variant={role.demand === "Very High" ? "default" : "secondary"} className="text-xs">
                          {role.demand}
                        </Badge>
                        <p className="text-xs text-green-600 mt-1">{role.growth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="text-purple-500" size={20} />
                  Top Hiring Companies
                </CardTitle>
                <CardDescription>Companies with most job openings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary text-sm">
                          {company.name.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{company.name}</h3>
                          <p className="text-xs text-muted-foreground">{company.hiring.toLocaleString()} hiring</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                        {company.roles.slice(0, 2).map((role, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-violet-500" size={20} />
                5-Year Career Demand Forecast
              </CardTitle>
              <CardDescription>Projected demand growth for different tech domains (Index: 100 = Current)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Year</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Code size={14} className="text-blue-500" />
                          Web Dev
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Database size={14} className="text-green-500" />
                          Data Science
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Brain size={14} className="text-purple-500" />
                          AI/ML
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Cloud size={14} className="text-cyan-500" />
                          Cloud
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {careerForecasts.map((forecast, index) => (
                      <motion.tr
                        key={forecast.year}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="py-3 px-4 font-medium">{forecast.year}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={forecast.webDev} className="h-2 w-16" />
                            <span className="text-sm font-medium">{forecast.webDev}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={forecast.dataScience} className="h-2 w-16" />
                            <span className="text-sm font-medium">{forecast.dataScience}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={forecast.aiMl} className="h-2 w-16" />
                            <span className="text-sm font-medium">{forecast.aiMl}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={forecast.cloud} className="h-2 w-16" />
                            <span className="text-sm font-medium">{forecast.cloud}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Star className="inline text-amber-500 mr-1" size={14} />
                  <strong>Insight:</strong> AI/ML is projected to have the fastest growth, reaching 92 index by 2030. 
                  Consider adding AI/ML skills to your learning path for maximum career opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Search size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Want personalized career advice?</h3>
                    <p className="text-sm text-white/80">Talk to our AI companion for tailored recommendations</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => router.push('/demo/ai-companion')}>
                  Chat with AI
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
