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
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Target,
  MessageSquare,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Volume2,
  Plus,
  MessageCircle,
  Trash2,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

const quickActions = [
  { label: "What's my progress?", icon: Target },
  { label: "Suggest next course", icon: BookOpen },
  { label: "Career advice", icon: TrendingUp },
  { label: "Learning tips", icon: Lightbulb },
];

const parseLoadedChats = (dataStr: string): ChatSession[] => {
  try {
    const parsed = JSON.parse(dataStr);
    if (Array.isArray(parsed)) {
      return parsed.map((chat: any) => ({
        ...chat,
        lastUpdated: new Date(chat.lastUpdated),
        messages: (chat.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  } catch (e) {
    console.error("Error parsing chats", e);
  }
  return [];
};

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
  const [activeChatId, setActiveChatId] = useState<string>("default");
  const [isMounted, setIsMounted] = useState(false);
  
  const [recentChats, setRecentChats] = useState<ChatSession[]>([
    {
      id: "default",
      title: "Learning Journey",
      messages: [
        {
          id: 0,
          role: "assistant",
          content: "Hi there! I'm your AI Learning Companion. I'm here to help guide you on your learning journey. Ask me anything about your courses, career path, or learning strategies!",
          timestamp: new Date(),
          suggestions: ["What's my progress?", "Suggest next course", "Career advice"]
        }
      ],
      lastUpdated: new Date()
    },
    {
      id: "chat-1",
      title: "Course Recommendations",
      messages: [
        { id: 0, role: "assistant", content: "What courses are you interested in?", timestamp: new Date() },
        { id: 1, role: "user", content: "I want to learn web development", timestamp: new Date() },
        { id: 2, role: "assistant", content: "Great choice! I recommend starting with HTML, CSS, and JavaScript.", timestamp: new Date() }
      ],
      lastUpdated: new Date(Date.now() - 3600000)
    },
    {
      id: "chat-2",
      title: "Career Guidance",
      messages: [
        { id: 0, role: "assistant", content: "How can I help with your career today?", timestamp: new Date() },
        { id: 1, role: "user", content: "What jobs can I get as a developer?", timestamp: new Date() }
      ],
      lastUpdated: new Date(Date.now() - 86400000)
    },
    {
      id: "chat-3",
      title: "Study Tips",
      messages: [
        { id: 0, role: "user", content: "Give me some study tips", timestamp: new Date() },
        { id: 1, role: "assistant", content: "Here are some effective study strategies...", timestamp: new Date() }
      ],
      lastUpdated: new Date(Date.now() - 172800000)
    }
  ]);
  
  const activeChat = recentChats.find(c => c.id === activeChatId) || recentChats[0];
  const messages = activeChat.messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    document.title = `AI Companion ✦ ${siteConfig.name}`;
    
    // Load chats from localStorage
    const savedChats = localStorage.getItem("demo_ai_recent_chats");
    const savedActiveId = localStorage.getItem("demo_ai_active_chat_id");
    
    let loadedChats: ChatSession[] = [];
    if (savedChats) {
      loadedChats = parseLoadedChats(savedChats);
    }
    
    if (loadedChats.length > 0) {
      setRecentChats(loadedChats);
      if (savedActiveId && loadedChats.some(c => c.id === savedActiveId)) {
        setActiveChatId(savedActiveId);
      } else {
        setActiveChatId(loadedChats[0].id);
      }
    }
    
    setIsMounted(true);
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
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: messages.length,
      role: "user",
      content: input,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    
    setRecentChats(prev => {
      const next = prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: updatedMessages, lastUpdated: new Date() }
          : chat
      );
      localStorage.setItem("demo_ai_recent_chats", JSON.stringify(next));
      return next;
    });
    
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const assistantMessage: Message = {
        id: messages.length + 1,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      setRecentChats(prev => {
        const next = prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, messages: finalMessages, lastUpdated: new Date() }
            : chat
        );
        localStorage.setItem("demo_ai_recent_chats", JSON.stringify(next));
        return next;
      });
      setIsTyping(false);
    }, 1000);
  };

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: `Conversation ${recentChats.length + 1}`,
      messages: [
        {
          id: 0,
          role: "assistant",
          content: "Hi there! I'm your AI Learning Companion. Ask me anything about your courses, target career, or learning styles!",
          timestamp: new Date(),
          suggestions: ["What's my progress?", "Suggest next course", "Career advice"]
        }
      ],
      lastUpdated: new Date()
    };
    setRecentChats(prev => {
      const next = [newChat, ...prev];
      localStorage.setItem("demo_ai_recent_chats", JSON.stringify(next));
      return next;
    });
    setActiveChatId(newChat.id);
    localStorage.setItem("demo_ai_active_chat_id", newChat.id);
  };

  const switchChat = (chatId: string) => {
    setActiveChatId(chatId);
    localStorage.setItem("demo_ai_active_chat_id", chatId);
    setInput("");
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatId === "default") return;
    
    const newChats = recentChats.filter(c => c.id !== chatId);
    setRecentChats(newChats);
    localStorage.setItem("demo_ai_recent_chats", JSON.stringify(newChats));
    
    if (activeChatId === chatId) {
      const nextActiveId = newChats[0]?.id || "default";
      setActiveChatId(nextActiveId);
      localStorage.setItem("demo_ai_active_chat_id", nextActiveId);
    }
  };

  const formatChatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
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
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleDislike = (id: number) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
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
      setRecentChats(prev => {
        const next = prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, messages: [...chat.messages.slice(0, -1), newMessage], lastUpdated: new Date() }
            : chat
        );
        localStorage.setItem("demo_ai_recent_chats", JSON.stringify(next));
        return next;
      });
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-full h-full flex flex-col flex-1 min-h-0">
        {!isMounted ? (
          <div className="flex gap-4 flex-1 h-full min-h-0">
            {/* Sidebar skeleton */}
            <Card className="w-72 shrink-0 flex flex-col overflow-hidden border-violet-200 dark:border-violet-800 hidden md:flex bg-card/45 backdrop-blur-md h-full">
              <CardHeader className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex-1 p-2 space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-12 w-full mt-4" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
            
            {/* Main chat skeleton */}
            <Card style={{ flex: 1 }} className="flex flex-col overflow-hidden border-violet-200 dark:border-violet-800 bg-card/65 backdrop-blur-md h-full">
              <CardHeader className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 space-y-4">
                <div className="flex justify-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-16 w-96 rounded-2xl" />
                </div>
                <div className="flex justify-end gap-3">
                  <Skeleton className="h-12 w-64 rounded-2xl" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </CardContent>
              <div className="p-4 border-t space-y-3 bg-muted/20">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col h-full min-h-0"
          >
            <div className="flex gap-4 flex-1 h-full min-h-0">
              <Card className="w-72 shrink-0 flex flex-col overflow-hidden border-violet-200 dark:border-violet-800 hidden md:flex bg-card/45 backdrop-blur-md h-full">
                <CardHeader className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                      <MessageCircle size={18} />
                      Recent Chats
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                    onClick={createNewChat}
                  >
                    <Plus size={16} />
                    New Chat
                  </Button>
                  <div className="mt-2 space-y-1">
                    {recentChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => switchChat(chat.id)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          activeChatId === chat.id
                            ? "bg-violet-100/50 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-800"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            activeChatId === chat.id 
                              ? "text-violet-750 dark:text-violet-300" 
                              : "text-foreground"
                          }`}>
                            {chat.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock size={10} />
                            {formatChatTime(chat.lastUpdated)}
                          </div>
                        </div>
                        {chat.id !== "default" && (
                          <button
                            onClick={(e) => deleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card style={{ flex: 1 }} className="flex flex-col overflow-hidden border-violet-200 dark:border-violet-800 bg-card/65 backdrop-blur-md h-full">
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="md:hidden"
                        onClick={createNewChat}
                      >
                        <Plus size={16} />
                      </Button>
                      <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 text-xs font-medium">
                        <Sparkles size={12} className="mr-1" />
                        AI Powered
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  <AnimatePresence>
                    {messages.map((message) => (
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
                          <div className={`rounded-2xl p-3 sm:p-4 ${message.role === "user" ? "bg-primary text-primary-foreground text-white" : "bg-muted"}`}>
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
                            <div className="flex items-center justify-between mt-2 gap-4">
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
    
                <div className="p-4 border-t space-y-3 bg-muted/20">
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
                      disabled={isTyping}
                    />
                    <Button id="send-msg-btn" onClick={handleSend} disabled={!input.trim() || isTyping}>
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
