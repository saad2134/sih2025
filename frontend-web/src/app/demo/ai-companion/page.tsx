"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  ChevronLeft,
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Target,
  Calendar,
  MessageSquare,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Volume2
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickActions = [
  { label: "What's my progress?", icon: Target },
  { label: "Suggest next course", icon: BookOpen },
  { label: "Career advice", icon: TrendingUp },
  { label: "Learning tips", icon: Lightbulb },
];

export default function AICompanion() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<number>>(new Set());
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<{ status: string; loading: boolean }>({ status: 'checking', loading: true });
  const [chatHeight, setChatHeight] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Hi there! I'm your AI Learning Companion. I'm here to help guide you on your learning journey. Ask me anything about your courses, career path, or learning strategies!",
      timestamp: new Date(),
      suggestions: ["What's my progress?", "Suggest next course", "Career advice"]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.title = `AI Companion ✦ ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        const aiService = data.services?.find((s: { name: string }) => s.name.includes('AI Companion'));
        if (aiService) {
          setAiStatus({ status: aiService.status ? 'online' : 'offline', loading: false });
        } else {
          setAiStatus({ status: data.status === 'operational' ? 'online' : 'issues', loading: false });
        }
      } catch {
        setAiStatus({ status: 'offline', loading: false });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (aiStatus.loading) return "bg-yellow-500";
    return aiStatus.status === "online" ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = () => {
    if (aiStatus.loading) return "Checking...";
    return aiStatus.status === "online" ? "Online" : "Offline";
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newHeight = Math.max(1000, e.clientY - 100);
        setChatHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const generateResponse = (userInput: string): { content: string; suggestions: string[] } => {
    const inputLower = userInput.toLowerCase();
    
    if (inputLower.includes("progress") || inputLower.includes("how am i doing") || inputLower.includes("status")) {
      return {
        content: "You're doing great! Here's your current progress:\n\n• **Overall Progress**: 25% complete\n• **Courses Completed**: 2 out of 5\n• **Skills Gained**: 5 (HTML, CSS, JavaScript, Python Basics, Problem Solving)\n• **Current Streak**: 12 days 🔥\n• **Next Milestone**: Web Development Fundamentals (40% complete)\n\nYou're right on track to becoming job-ready in Software Development! Keep up the momentum!",
        suggestions: ["Suggest next course", "How can I improve?", "Show my career path"]
      };
    }
    
    if (inputLower.includes("course") || inputLower.includes("learn") || inputLower.includes("suggest")) {
      return {
        content: "Based on your profile and current progress, I recommend:\n\n1. **Complete Module 3 of Web Development** - You're 40% through and this will solidify your frontend skills\n\n2. **Python Programming** - After Web Dev, this will round out your programming abilities\n\n3. **Consider an Internship** - Once you complete the foundational courses, an internship will give you real-world experience\n\nWould you like me to enroll you in any of these?",
        suggestions: ["Enroll in Python", "Show career path", "Tell me more about internships"]
      };
    }
    
    if (inputLower.includes("career") || inputLower.includes("job") || inputLower.includes("future")) {
      return {
        content: "Great question! Based on your profile and current market trends:\n\n**Your Target Role**: Software Developer\n\n**Career Path Summary**:\n• Current: Web Development Fundamentals (In Progress)\n• Next: Python Programming → Frontend Internship → Full-Stack Certification\n• Expected Timeline: 9-12 months to job-ready\n\n**Market Outlook**:\n• Web Developers are in HIGH demand (+15% growth)\n• Average Starting Salary: ₹6-12 LPA\n• Top hiring companies: Tech Startups, IT Services, Product Companies\n\nWould you like detailed information about any specific aspect?",
        suggestions: ["Show my career map", "What skills are most valued?", "Salary details"]
      };
    }
    
    if (inputLower.includes("tip") || inputLower.includes("advice") || inputLower.includes("improve")) {
      return {
        content: "Here are some proven learning strategies to help you succeed:\n\n1. **Consistency over intensity** - 1-2 hours daily is better than 5 hours once a week\n\n2. **Practice coding daily** - Even 30 minutes of hands-on coding makes a huge difference\n\n3. **Build projects** - Apply what you learn by building small projects\n\n4. **Join communities** - Engage with other learners on Discord or forums\n\n5. **Take notes** - Writing things down improves retention by 40%\n\nWould you like me to create a personalized study schedule for you?",
        suggestions: ["Create study schedule", "Show my streak", "Recommend resources"]
      };
    }
    
    return {
      content: "I'm here to help you succeed in your learning journey! Here are some things I can assist you with:\n\n• **Course recommendations** based on your goals\n• **Progress tracking** and motivation\n• **Career guidance** and job market insights\n• **Learning tips** and study strategies\n• **Answering questions** about your curriculum\n\nJust ask me anything!",
      suggestions: ["What's my progress?", "Suggest next course", "Career advice", "Learning tips"]
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length,
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: messages.length + 1,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(handleSend, 100);
  };

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id: number) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        newSet.delete(id);
      }
      return newSet;
    });
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleDislike = (id: number) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        newSet.delete(id);
      }
      return newSet;
    });
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleReadAloud = (content: string, id: number) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onend = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRetry = (userMessage: Message, lastAssistantMessage: Message) => {
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const newMessage: Message = {
        id: lastAssistantMessage.id + 1,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev.slice(0, -1), newMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card style={{ minHeight: `${chatHeight}px` }} className="flex flex-col overflow-hidden border-violet-200 dark:border-violet-800 w-full max-w-none">
            <CardHeader className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                    <Bot className="text-white" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-violet-700 dark:text-violet-300">Shiksha AI</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${getStatusColor()}`}></span>
                      <span className="text-muted-foreground">{getStatusText()}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-muted-foreground">{aiStatus.status === "online" ? "Ready to Help!" : "Demo Mode"}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 text-xs font-medium">
                    <Sparkles size={12} className="mr-1" />
                    AI Powered
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-violet-100 dark:bg-violet-900/30"
                      }`}>
                        {message.role === "user" ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} className="text-violet-600 dark:text-violet-400" />
                        )}
                      </div>
                      <div className={`rounded-2xl p-3 sm:p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {message.role === "user" ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkBreaks, remarkGfm]}
                              components={{
                                ol: ({ children }) => <ol className="list-decimal list-outside my-3 ml-5 space-y-1">{children}</ol>,
                                ul: ({ children }) => <ul className="list-disc list-outside my-3 ml-5 space-y-1">{children}</ul>,
                                li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                                p: ({ children }) => <p className="my-2">{children}</p>,
                              }}
                            >{message.content}</ReactMarkdown>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className={`flex items-center gap-1 text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            <MessageSquare size={10} />
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleLike(message.id)}
                                className={`p-1 rounded hover:bg-muted-foreground/20 transition-colors ${likedMessages.has(message.id) ? "text-green-500" : "text-muted-foreground"}`}
                                title="Like"
                              >
                                <ThumbsUp size={12} />
                              </button>
                              <button
                                onClick={() => handleDislike(message.id)}
                                className={`p-1 rounded hover:bg-muted-foreground/20 transition-colors ${dislikedMessages.has(message.id) ? "text-red-500" : "text-muted-foreground"}`}
                                title="Dislike"
                              >
                                <ThumbsDown size={12} />
                              </button>
                              <button
                                onClick={() => handleReadAloud(message.content, message.id)}
                                className={`p-1 rounded hover:bg-muted-foreground/20 transition-colors ${speakingId === message.id ? "text-blue-500" : "text-muted-foreground"}`}
                                title="Read aloud"
                              >
                                <Volume2 size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  const userMsg = messages.find(m => m.role === "user" && m.id < message.id);
                                  if (userMsg) handleRetry(userMsg, message);
                                }}
                                className="p-1 rounded hover:bg-muted-foreground/20 transition-colors text-muted-foreground"
                                title="Try again"
                              >
                                <RefreshCw size={12} />
                              </button>
                              <button
                                onClick={() => handleCopy(message.content, message.id)}
                                className="p-1 rounded hover:bg-muted-foreground/20 transition-colors text-muted-foreground"
                                title="Copy"
                              >
                                {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Bot size={16} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="bg-muted rounded-2xl p-4 flex items-center gap-2">
                      <Loader2 className="animate-spin text-violet-500" size={16} />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            

            <div className="p-4 border-t space-y-3">
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 justify-start">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(action.label)}
                      className="text-xs gap-2"
                    >
                      <action.icon size={12} />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
              
              {messages.length > 1 && messages[messages.length - 1].suggestions && (
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs gap-2"
                    >
                      <Sparkles size={10} className="text-violet-500" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything about your learning journey..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
