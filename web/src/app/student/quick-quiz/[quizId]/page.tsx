"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Clock,
    Target,
    Zap,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    Award,
    Sparkles,
    Palette,
    TrendingUp,
    Play,
    AlertTriangle
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface Question {
    id: number;
    question: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
}

interface QuizData {
    id: number;
    title: string;
    description: string;
    questions: number;
    duration: string;
    difficulty: string;
    icon: React.ReactNode;
}

const quizCategories: QuizData[] = [
    {
        id: 1,
        title: "Web Development",
        description: "Test your knowledge of HTML, CSS, JavaScript",
        questions: 10,
        duration: "5 min",
        difficulty: "Beginner",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: 2,
        title: "Programming Basics",
        description: "Core programming concepts and logic",
        questions: 8,
        duration: "4 min",
        difficulty: "Beginner",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: 3,
        title: "Problem Solving",
        description: "Critical thinking and analytical skills",
        questions: 12,
        duration: "6 min",
        difficulty: "Intermediate",
        icon: <Zap className="w-6 h-6" />
    },
    {
        id: 4,
        title: "Digital Marketing",
        description: "SEO, social media, and marketing fundamentals",
        questions: 10,
        duration: "5 min",
        difficulty: "Beginner",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: 5,
        title: "Graphic Design",
        description: "Design principles, tools, and creativity",
        questions: 8,
        duration: "4 min",
        difficulty: "Beginner",
        icon: <Brain className="w-6 h-6" />
    },
    {
        id: 6,
        title: "Data Science",
        description: "Statistics, data analysis, and visualization",
        questions: 15,
        duration: "8 min",
        difficulty: "Intermediate",
        icon: <Target className="w-6 h-6" />
    },
    {
        id: 7,
        title: "Cloud Computing",
        description: "AWS, Azure, and cloud fundamentals",
        questions: 12,
        duration: "6 min",
        difficulty: "Advanced",
        icon: <Zap className="w-6 h-6" />
    },
    {
        id: 8,
        title: "Cybersecurity Basics",
        description: "Network security and threat prevention",
        questions: 10,
        duration: "5 min",
        difficulty: "Beginner",
        icon: <Target className="w-6 h-6" />
    }
];

const quizQuestions: Record<number, Question[]> = {
    1: [
        {
            id: 1,
            question: "What does HTML stand for?",
            options: [
                { id: "a", text: "Hyper Text Markup Language" },
                { id: "b", text: "High Tech Modern Language" },
                { id: "c", text: "Home Tool Markup Language" },
                { id: "d", text: "Hyperlinks and Text Markup Language" }
            ],
            correctAnswer: "a",
            explanation: "HTML stands for Hyper Text Markup Language, the standard language for creating web pages."
        },
        {
            id: 2,
            question: "Which CSS property is used to change the text color?",
            options: [
                { id: "a", text: "text-color" },
                { id: "b", text: "font-color" },
                { id: "c", text: "color" },
                { id: "d", text: "text-style" }
            ],
            correctAnswer: "c",
            explanation: "The 'color' property in CSS is used to set the text color of an element."
        },
        {
            id: 3,
            question: "What is the correct way to declare a JavaScript variable?",
            options: [
                { id: "a", text: "variable x = 5" },
                { id: "b", text: "var x = 5" },
                { id: "c", text: "v x = 5" },
                { id: "d", text: "int x = 5" }
            ],
            correctAnswer: "b",
            explanation: "In JavaScript, you can declare variables using 'var', 'let', or 'const' keywords."
        },
        {
            id: 4,
            question: "Which HTML tag is used for the largest heading?",
            options: [
                { id: "a", text: "<heading>" },
                { id: "b", text: "<h6>" },
                { id: "c", text: "<h1>" },
                { id: "d", text: "<head>" }
            ],
            correctAnswer: "c",
            explanation: "The <h1> tag defines the largest heading in HTML. Headings range from <h1> to <h6>."
        },
        {
            id: 5,
            question: "What does CSS stand for?",
            options: [
                { id: "a", text: "Creative Style Sheets" },
                { id: "b", text: "Cascading Style Sheets" },
                { id: "c", text: "Computer Style Sheets" },
                { id: "d", text: "Colorful Style Sheets" }
            ],
            correctAnswer: "b",
            explanation: "CSS stands for Cascading Style Sheets, used to style and layout web pages."
        },
        {
            id: 6,
            question: "Which JavaScript method is used to select an element by its ID?",
            options: [
                { id: "a", text: "document.querySelector()" },
                { id: "b", text: "document.getElement()" },
                { id: "c", text: "document.getElementById()" },
                { id: "d", text: "document.selectById()" }
            ],
            correctAnswer: "c",
            explanation: "document.getElementById() is used to select an element by its unique ID."
        },
        {
            id: 7,
            question: "What is the correct way to add a comment in CSS?",
            options: [
                { id: "a", text: "// comment" },
                { id: "b", text: "/* comment */" },
                { id: "c", text: "<!-- comment -->" },
                { id: "d", text: "# comment" }
            ],
            correctAnswer: "b",
            explanation: "CSS comments use /* and */ to enclose the comment text."
        },
        {
            id: 8,
            question: "Which HTML attribute is used to define inline styles?",
            options: [
                { id: "a", text: "class" },
                { id: "b", text: "styles" },
                { id: "c", text: "style" },
                { id: "d", text: "font" }
            ],
            correctAnswer: "c",
            explanation: "The 'style' attribute is used to add inline CSS styles to an element."
        },
        {
            id: 9,
            question: "What is the default display value of a <div> element?",
            options: [
                { id: "a", text: "inline" },
                { id: "b", text: "block" },
                { id: "c", text: "inline-block" },
                { id: "d", text: "flex" }
            ],
            correctAnswer: "b",
            explanation: "The <div> element has a default display value of 'block', meaning it takes up the full width available."
        },
        {
            id: 10,
            question: "Which JavaScript keyword is used to define a constant?",
            options: [
                { id: "a", text: "var" },
                { id: "b", text: "let" },
                { id: "c", text: "const" },
                { id: "d", text: "constant" }
            ],
            correctAnswer: "c",
            explanation: "The 'const' keyword is used to declare a constant value that cannot be reassigned."
        }
    ],
    2: [
        {
            id: 1,
            question: "What is an algorithm?",
            options: [
                { id: "a", text: "A type of programming language" },
                { id: "b", text: "A step-by-step procedure to solve a problem" },
                { id: "c", text: "A computer hardware component" },
                { id: "d", text: "A type of database" }
            ],
            correctAnswer: "b",
            explanation: "An algorithm is a step-by-step procedure or set of rules to solve a specific problem."
        },
        {
            id: 2,
            question: "What is a loop in programming?",
            options: [
                { id: "a", text: "A way to store data" },
                { id: "b", text: "A function that repeats code" },
                { id: "c", text: "A type of variable" },
                { id: "d", text: "An error handling method" }
            ],
            correctAnswer: "b",
            explanation: "A loop is a control structure that repeats a block of code multiple times."
        },
        {
            id: 3,
            question: "What is a variable?",
            options: [
                { id: "a", text: "A fixed value that never changes" },
                { id: "b", text: "A container for storing data values" },
                { id: "c", text: "A type of function" },
                { id: "d", text: "A programming error" }
            ],
            correctAnswer: "b",
            explanation: "A variable is a named container that stores data which can be changed during program execution."
        },
        {
            id: 4,
            question: "What does a conditional statement do?",
            options: [
                { id: "a", text: "Loops through code" },
                { id: "b", text: "Executes code based on a condition" },
                { id: "c", text: "Stores data permanently" },
                { id: "d", text: "Deletes old code" }
            ],
            correctAnswer: "b",
            explanation: "A conditional statement executes different code based on whether a condition is true or false."
        },
        {
            id: 5,
            question: "What is a function?",
            options: [
                { id: "a", text: "A type of loop" },
                { id: "b", text: "A reusable block of code that performs a specific task" },
                { id: "c", text: "A way to store multiple values" },
                { id: "d", text: "A debugging tool" }
            ],
            correctAnswer: "b",
            explanation: "A function is a reusable block of code designed to perform a particular task."
        },
        {
            id: 6,
            question: "What is an array?",
            options: [
                { id: "a", text: "A single value storage" },
                { id: "b", text: "A collection of elements stored in order" },
                { id: "c", text: "A type of loop" },
                { id: "d", text: "A conditional statement" }
            ],
            correctAnswer: "b",
            explanation: "An array is a data structure that stores a collection of elements in a specific order."
        },
        {
            id: 7,
            question: "What is debugging?",
            options: [
                { id: "a", text: "Writing new code" },
                { id: "b", text: "Finding and fixing errors in code" },
                { id: "c", text: "Running a program" },
                { id: "d", text: "Deleting old files" }
            ],
            correctAnswer: "b",
            explanation: "Debugging is the process of finding and fixing errors (bugs) in computer programs."
        },
        {
            id: 8,
            question: "What is object-oriented programming?",
            options: [
                { id: "a", text: "Writing code without any structure" },
                { id: "b", text: "Programming using objects and classes" },
                { id: "c", text: "Writing code only for math calculations" },
                { id: "d", text: "Programming without variables" }
            ],
            correctAnswer: "b",
            explanation: "OOP is a programming paradigm based on objects containing data and methods."
        }
    ],
    3: [
        {
            id: 1,
            question: "If a train travels 100 km in 2 hours, what is its speed?",
            options: [
                { id: "a", text: "25 km/h" },
                { id: "b", text: "50 km/h" },
                { id: "c", text: "100 km/h" },
                { id: "d", text: "200 km/h" }
            ],
            correctAnswer: "b",
            explanation: "Speed = Distance/Time = 100km/2h = 50 km/h"
        },
        {
            id: 2,
            question: "What comes next in the sequence: 2, 6, 12, 20, ?",
            options: [
                { id: "a", text: "28" },
                { id: "b", text: "30" },
                { id: "c", text: "32" },
                { id: "d", text: "36" }
            ],
            correctAnswer: "b",
            explanation: "The pattern adds 4, 6, 8, 10... so 20 + 10 = 30"
        },
        {
            id: 3,
            question: "If 5 cats catch 5 mice in 5 minutes, how long would 100 cats take to catch 100 mice?",
            options: [
                { id: "a", text: "5 minutes" },
                { id: "b", text: "100 minutes" },
                { id: "c", text: "20 minutes" },
                { id: "d", text: "50 minutes" }
            ],
            correctAnswer: "a",
            explanation: "Each cat works independently, so 100 cats can catch 100 mice in 5 minutes."
        },
        {
            id: 4,
            question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
            options: [
                { id: "a", text: "0 degrees" },
                { id: "b", text: "7.5 degrees" },
                { id: "c", text: "15 degrees" },
                { id: "d", text: "30 degrees" }
            ],
            correctAnswer: "b",
            explanation: "At 3:15, the minute hand is at 90 degrees, hour hand is at 97.5 degrees. Difference = 7.5 degrees"
        },
        {
            id: 5,
            question: "If you have a 3L and a 5L jug, how can you measure exactly 4L of water?",
            options: [
                { id: "a", text: "Fill 5L, pour into 3L, remaining 2L + 2L more" },
                { id: "b", text: "Fill 3L twice and pour into 5L, remaining 1L" },
                { id: "c", text: "Fill both and mix" },
                { id: "d", text: "It is impossible" }
            ],
            correctAnswer: "a",
            explanation: "Fill 5L, pour into 3L (leaving 2L), empty 3L, pour 2L into 3L, fill 5L and pour 1L into 3L = 4L"
        }
    ],
    4: [
        {
            id: 1,
            question: "What does SEO stand for?",
            options: [
                { id: "a", text: "Search Engine Optimization" },
                { id: "b", text: "Social Media Engine Operation" },
                { id: "c", text: "Sales Email Outreach" },
                { id: "d", text: "System Error Output" }
            ],
            correctAnswer: "a",
            explanation: "SEO stands for Search Engine Optimization, the practice of improving website ranking in search results."
        },
        {
            id: 2,
            question: "Which social media platform is known for professional networking?",
            options: [
                { id: "a", text: "Instagram" },
                { id: "b", text: "LinkedIn" },
                { id: "c", text: "TikTok" },
                { id: "d", text: "Snapchat" }
            ],
            correctAnswer: "b",
            explanation: "LinkedIn is a professional networking platform used for career development and business connections."
        },
        {
            id: 3,
            question: "What is PPC in digital marketing?",
            options: [
                { id: "a", text: "Pay Per Click" },
                { id: "b", text: "Post Photo Content" },
                { id: "c", text: "Public Press Coverage" },
                { id: "d", text: "Product Price Calculation" }
            ],
            correctAnswer: "a",
            explanation: "PPC stands for Pay Per Click, an advertising model where advertisers pay for each click on their ads."
        },
        {
            id: 4,
            question: "What is a 'call to action' (CTA)?",
            options: [
                { id: "a", text: "A phone number for support" },
                { id: "b", text: "A prompt encouraging users to take a specific action" },
                { id: "c", text: "A type of email signature" },
                { id: "d", text: "A meeting request" }
            ],
            correctAnswer: "b",
            explanation: "A CTA is a prompt that encourages users to take a specific action like 'Buy Now' or 'Sign Up'."
        },
        {
            id: 5,
            question: "What is the 'conversion rate' in marketing?",
            options: [
                { id: "a", text: "Number of website visitors" },
                { id: "b", text: "Percentage of visitors who complete a desired action" },
                { id: "c", text: "Amount spent on ads" },
                { id: "d", text: "Time spent on website" }
            ],
            correctAnswer: "b",
            explanation: "Conversion rate measures the percentage of visitors who complete a desired action (purchase, signup, etc.)"
        }
    ],
    5: [
        {
            id: 1,
            question: "What is the color theory concept of primary colors?",
            options: [
                { id: "a", text: "Red, Blue, Green" },
                { id: "b", text: "Red, Yellow, Blue" },
                { id: "c", text: "Orange, Purple, Green" },
                { id: "d", text: "Black, White, Gray" }
            ],
            correctAnswer: "b",
            explanation: "The three primary colors are Red, Yellow, and Blue. They cannot be created by mixing other colors."
        },
        {
            id: 2,
            question: "What is the rule of thirds in design?",
            options: [
                { id: "a", text: "Divide design into three equal parts" },
                { id: "b", text: "Place important elements along grid lines and intersections" },
                { id: "c", text: "Use only three colors" },
                { id: "d", text: "Keep text to three lines maximum" }
            ],
            correctAnswer: "b",
            explanation: "The rule of thirds divides the canvas into a 3x3 grid. Important elements should be placed along lines or intersections."
        },
        {
            id: 3,
            question: "What is whitespace in design?",
            options: [
                { id: "a", text: "The white background color" },
                { id: "b", text: "Empty space between elements" },
                { id: "c", text: "A type of font" },
                { id: "d", text: "A design software" }
            ],
            correctAnswer: "b",
            explanation: "Whitespace (or negative space) is the empty space between design elements. It improves readability and visual hierarchy."
        },
        {
            id: 4,
            question: "What is a vector graphic?",
            options: [
                { id: "a", text: "A photo taken with a camera" },
                { id: "b", text: "An image made of mathematical paths that can scale infinitely" },
                { id: "c", text: "A type of video file" },
                { id: "d", text: "A scanned document" }
            ],
            correctAnswer: "b",
            explanation: "Vector graphics use mathematical equations to define shapes, allowing them to scale without losing quality."
        },
        {
            id: 5,
            question: "What is contrast in design?",
            options: [
                { id: "a", text: "Making everything the same" },
                { id: "b", text: "Using opposing elements to create visual interest" },
                { id: "c", text: "Copying other designs" },
                { id: "d", text: "Using only one color" }
            ],
            correctAnswer: "b",
            explanation: "Contrast uses opposing elements (light/dark, large/small) to create visual interest and emphasize important elements."
        }
    ],
    6: [
        {
            id: 1,
            question: "What is the mean of the dataset: 2, 4, 6, 8, 10?",
            options: [
                { id: "a", text: "4" },
                { id: "b", text: "5" },
                { id: "c", text: "6" },
                { id: "d", text: "8" }
            ],
            correctAnswer: "c",
            explanation: "Mean = (2+4+6+8+10)/5 = 30/5 = 6"
        },
        {
            id: 2,
            question: "What is the median of: 3, 7, 2, 9, 5?",
            options: [
                { id: "a", text: "3" },
                { id: "b", text: "5" },
                { id: "c", text: "7" },
                { id: "d", text: "9" }
            ],
            correctAnswer: "b",
            explanation: "First sort: 2,3,5,7,9. The middle value (median) is 5."
        },
        {
            id: 3,
            question: "What is a histogram?",
            options: [
                { id: "a", text: "A type of pie chart" },
                { id: "b", text: "A bar chart showing data distribution" },
                { id: "c", text: "A line graph" },
                { id: "d", text: "A map" }
            ],
            correctAnswer: "b",
            explanation: "A histogram is a bar chart that displays the distribution of numerical data."
        },
        {
            id: 4,
            question: "What does correlation measure?",
            options: [
                { id: "a", text: "The difference between two values" },
                { id: "b", text: "The strength and direction of relationship between two variables" },
                { id: "c", text: "The average of data" },
                { id: "d", text: "The total sum of values" }
            ],
            correctAnswer: "b",
            explanation: "Correlation measures how two variables are related to each other, ranging from -1 to +1."
        },
        {
            id: 5,
            question: "What is data visualization?",
            options: [
                { id: "a", text: "Storing data in databases" },
                { id: "b", text: "Representing data graphically" },
                { id: "c", text: "Deleting unnecessary data" },
                { id: "d", text: "Writing data reports" }
            ],
            correctAnswer: "b",
            explanation: "Data visualization is the graphical representation of information and data using charts, graphs, and maps."
        }
    ],
    7: [
        {
            id: 1,
            question: "What does IaaS stand for in cloud computing?",
            options: [
                { id: "a", text: "Internet as a Service" },
                { id: "b", text: "Infrastructure as a Service" },
                { id: "c", text: "Integration as a Service" },
                { id: "d", text: "Information as a Service" }
            ],
            correctAnswer: "b",
            explanation: "IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet."
        },
        {
            id: 2,
            question: "Which is a major cloud provider?",
            options: [
                { id: "a", text: "Amazon" },
                { id: "b", text: "AWS" },
                { id: "c", text: "Apple" },
                { id: "d", text: "Netflix" }
            ],
            correctAnswer: "b",
            explanation: "AWS (Amazon Web Services) is one of the major cloud computing platforms along with Azure and Google Cloud."
        },
        {
            id: 3,
            question: "What is a virtual machine?",
            options: [
                { id: "a", text: "A physical computer" },
                { id: "b", text: "Software that simulates a computer" },
                { id: "c", text: "A type of cloud storage" },
                { id: "d", text: "A network cable" }
            ],
            correctAnswer: "b",
            explanation: "A virtual machine is software that emulates a physical computer, allowing multiple OS to run on one machine."
        },
        {
            id: 4,
            question: "What is load balancing?",
            options: [
                { id: "a", text: "Weighing cargo" },
                { id: "b", text: "Distributing network traffic across multiple servers" },
                { id: "c", text: "Balancing your budget" },
                { id: "d", text: "Weight training" }
            ],
            correctAnswer: "b",
            explanation: "Load balancing distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed."
        },
        {
            id: 5,
            question: "What is containerization?",
            options: [
                { id: "a", text: "Shipping goods" },
                { id: "b", text: "Packaging software with its dependencies" },
                { id: "c", text: "Storing data in boxes" },
                { id: "d", text: "Building physical walls" }
            ],
            correctAnswer: "b",
            explanation: "Containerization packages software with all its dependencies, ensuring it runs consistently across different environments."
        }
    ],
    8: [
        {
            id: 1,
            question: "What is a firewall?",
            options: [
                { id: "a", text: "A type of virus" },
                { id: "b", text: "A security system that monitors network traffic" },
                { id: "c", text: "A password" },
                { id: "d", text: "A type of encryption" }
            ],
            correctAnswer: "b",
            explanation: "A firewall is a network security system that monitors and controls incoming and outgoing network traffic."
        },
        {
            id: 2,
            question: "What is phishing?",
            options: [
                { id: "a", text: "A type of fishing sport" },
                { id: "b", text: "A cyber attack using deceptive emails to steal information" },
                { id: "c", text: "A security software" },
                { id: "d", text: "A network protocol" }
            ],
            correctAnswer: "b",
            explanation: "Phishing is a cyber attack that uses disguised emails to trick recipients into revealing sensitive information."
        },
        {
            id: 3,
            question: "What is a strong password?",
            options: [
                { id: "a", text: "Your birthday" },
                { id: "b", text: "A mix of characters, numbers, and symbols" },
                { id: "c", text: "Your pet's name" },
                { id: "d", text: "The word 'password'" }
            ],
            correctAnswer: "b",
            explanation: "A strong password uses a combination of uppercase, lowercase, numbers, and special characters."
        },
        {
            id: 4,
            question: "What is two-factor authentication (2FA)?",
            options: [
                { id: "a", text: "Using two passwords" },
                { id: "b", text: "Verifying identity using two different methods" },
                { id: "c", text: "Logging in twice" },
                { id: "d", text: "Having two accounts" }
            ],
            correctAnswer: "b",
            explanation: "2FA requires two different forms of identification to verify your identity, adding an extra layer of security."
        },
        {
            id: 5,
            question: "What is malware?",
            options: [
                { id: "a", text: "A type of hardware" },
                { id: "b", text: "Malicious software designed to harm computers" },
                { id: "c", text: "A backup system" },
                { id: "d", text: "An operating system" }
            ],
            correctAnswer: "b",
            explanation: "Malware is malicious software designed to damage, disrupt, or gain unauthorized access to a computer system."
        }
    ]
};

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = parseInt(params.quizId as string);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResult, setShowResult] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [startTime] = useState(Date.now());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [idleWarning, setIdleWarning] = useState(false);
    const [idleWarningType, setIdleWarningType] = useState<'inactivity' | 'clicked-outside'>('inactivity');
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [kickedOut, setKickedOut] = useState(false);

    const quiz = quizCategories.find(q => q.id === quizId);
    const questions = quizQuestions[quizId] || [];

    useEffect(() => {
        if (quiz) {
            document.title = `${quiz.title} Quiz ✦ ${siteConfig.name}`;
        }
    }, [quiz]);

    useEffect(() => {
        if (showResult || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showResult, timeLeft]);

    useEffect(() => {
        if (!showResult && !quizStarted) return;

        const handleFullscreenChange = () => {
            const fullscreenElement = document.fullscreenElement;
            setIsFullscreen(!!fullscreenElement);
            
            if (!fullscreenElement && !showResult && quizStarted) {
                setShowExitWarning(true);
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!showResult && quizStarted) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
                return e.returnValue;
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [showResult, quizStarted]);

    useEffect(() => {
        if (!quizStarted || showResult) return;

        const handleActivity = () => {
            setLastActivity(Date.now());
            if (idleWarning) setIdleWarning(false);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIdleWarningType('clicked-outside');
                setIdleWarning(true);
            }
        };

        const handleWindowBlur = () => {
            setIdleWarningType('clicked-outside');
            setIdleWarning(true);
        };

        const handleWindowFocus = () => {
            if (idleWarning) {
                setLastActivity(Date.now());
                setIdleWarning(false);
            }
        };

        const checkIdle = setInterval(() => {
            const idleTime = Date.now() - lastActivity;
            if (idleTime > 15000 && !idleWarning) {
                setIdleWarningType('inactivity');
                setIdleWarning(true);
            }
            if (idleTime > 30000) {
                setIdleWarning(false);
                setKickedOut(true);
                setQuizStarted(false);
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
            }
        }, 1000);

        document.addEventListener('mousemove', handleActivity);
        document.addEventListener('keydown', handleActivity);
        document.addEventListener('click', handleActivity);
        document.addEventListener('scroll', handleActivity);
        document.addEventListener('touchstart', handleActivity);
        document.addEventListener('touchmove', handleActivity);
        document.addEventListener('touchend', handleActivity);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            clearInterval(checkIdle);
            document.removeEventListener('mousemove', handleActivity);
            document.removeEventListener('keydown', handleActivity);
            document.removeEventListener('click', handleActivity);
            document.removeEventListener('scroll', handleActivity);
            document.removeEventListener('touchstart', handleActivity);
            document.removeEventListener('touchmove', handleActivity);
document.removeEventListener('touchend', handleActivity);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        };
    }, [quizStarted, showResult, lastActivity, idleWarning]);

    useEffect(() => {
        if (quizStarted && !showResult && !isFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }, [quizStarted, showResult, isFullscreen]);

    const handleStartQuiz = () => {
        setKickedOut(false);
        setQuizStarted(true);
    };

    const handleExitWarningClose = () => {
        setShowExitWarning(false);
        if (!isFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    };

    const handleForcedExit = () => {
        setShowExitWarning(false);
        setIdleWarning(false);
        setLastActivity(Date.now());
        setQuizStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setSelectedAnswer(null);
        setShowResult(false);
        setShowExplanation(false);
        setTimeLeft(300);
        setTimeout(() => {
            document.documentElement.requestFullscreen().catch(() => {});
        }, 100);
    };

    const handleExitToQuizPage = () => {
        setShowExitWarning(false);
        router.push('/student/quick-quiz');
    };

    if (!quiz) {
        return (
            <div className="flex items-center justify-center items-center min-h-screen">
                <Card className="p-8">
                    <CardContent className="text-center">
                        <h2 className="text-xl font-bold mb-4">Quiz not found</h2>
                        <Button onClick={() => router.push('/student/quick-quiz')}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answerId: string) => {
        if (!showExplanation) {
            setSelectedAnswer(answerId);
        }
    };

    const handleCheckAnswer = () => {
        if (selectedAnswer) {
            setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: selectedAnswer }));
            setShowExplanation(true);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            handleFinish();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            const prevQuestionId = questions[currentQuestion - 1].id;
            setSelectedAnswer(answers[prevQuestionId] || null);
            setShowExplanation(!!answers[prevQuestionId]);
        }
    };

    const handleFinish = () => {
        const finalAnswers = { ...answers };
        if (selectedAnswer && !showExplanation) {
            finalAnswers[questions[currentQuestion].id] = selectedAnswer;
        }
        setAnswers(finalAnswers);
        setShowResult(true);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correct++;
            }
        });
        return Math.round((correct / questions.length) * 100);
    };

    if (showResult) {
        const score = calculateScore();
        const correctAnswers = Object.entries(answers).filter(([id, ans]) => 
            questions.find(q => q.id === parseInt(id))?.correctAnswer === ans
        ).length;
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="overflow-hidden">
                        <div className={`h-2 ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <CardContent className="p-8 text-center">
                            <div className="w-24 h-24 rounded-md mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 dark:from-purple-300/30 dark:to-purple-300/30">
                                <Award className={`w-12 h-12 ${score >= 70 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                            <p className="text-muted-foreground mb-6">{quiz.title}</p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-2xl font-bold text-violet-600">{score}%</p>
                                    <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-2xl font-bold text-green-600">{correctAnswers}/{questions.length}</p>
                                    <p className="text-xs text-muted-foreground">Correct</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-2xl font-bold text-amber-600">{formatTime(timeTaken)}</p>
                                    <p className="text-xs text-muted-foreground">Time</p>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <Button variant="outline" onClick={() => router.push('/student/quick-quiz')}>
                                    Back to Quizzes
                                </Button>
                                <Button onClick={() => {
                                    setCurrentQuestion(0);
                                    setAnswers({});
                                    setSelectedAnswer(null);
                                    setShowResult(false);
                                    setShowExplanation(false);
                                    setTimeLeft(300);
                                }}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>

                            <div className="mt-8 text-left">
                                <h3 className="font-semibold mb-4">Review Answers</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {questions.map((q, idx) => {
                                        const userAnswer = answers[q.id];
                                        const isCorrect = userAnswer === q.correctAnswer;
                                        return (
                                            <div key={q.id} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
                                                <div className="flex items-start gap-3">
                                                    {isCorrect ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium">Q{idx + 1}: {q.question}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Your answer: {q.options.find(o => o.id === userAnswer)?.text || 'No answer'}
                                                        </p>
                                                        {!isCorrect && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                Correct: {q.options.find(o => o.id === q.correctAnswer)?.text}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    if (!quizStarted) {
        return (
            <div className="h-screen w-full overflow-hidden flex items-center justify-center">
                <Card className="max-w-md w-full mx-4 my-8 relative">
                    <div className="absolute -top-12 left-0">
                    <Button 
                        variant="ghost" 
                        className="border"
                        onClick={() => router.push('/student/quick-quiz')}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    </div>
                    {kickedOut && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-red-700 dark:text-red-400">You were removed from the quiz</p>
                                    <p className="text-muted-foreground mt-1">
                                        This happened because you clicked outside the quiz window or were inactive for too long. Please stay on this page to complete the quiz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <CardHeader className="text-center">
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-violet-100 dark:bg-violet-900/30">
                            {quiz.icon}
                        </div>
                        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                        <CardDescription className="mt-2">{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Brain className="w-4 h-4" />
                                {quiz.questions} Questions
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {quiz.duration}
                            </div>
                            <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {quiz.difficulty}
                            </div>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-amber-700 dark:text-amber-400">Proctored Quiz</p>
                                    <p className="text-muted-foreground mt-1">
                                        Once started, you must complete the quiz. Exiting fullscreen will restart your progress. The quiz will go fullscreen automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" size="lg" onClick={handleStartQuiz}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Quiz
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
            {showExitWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="max-w-md w-full mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Quiz Interrupted
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                You exited fullscreen mode during the quiz. To maintain quiz integrity, your progress will be reset.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={handleForcedExit}>
                                    Restart Quiz
                                </Button>
                                <Button className="flex-1" onClick={handleExitToQuizPage}>
                                    Return to Quiz Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {idleWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm">
                    <Card className="max-w-md w-full mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                {idleWarningType === 'inactivity' ? 'No Activity Detected' : 'Do Not Click Outside'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                {idleWarningType === 'inactivity' 
                                    ? 'No mouse movement detected for 15 seconds. Please interact with the quiz to continue.'
                                    : 'You clicked outside the quiz window. Please stay on this page to complete the quiz.'
                                }
                            </p>
                            <p className="text-sm text-amber-600 font-medium">
                                {idleWarningType === 'inactivity'
                                    ? 'Quiz will restart in 15 seconds if no activity detected.'
                                    : 'Quiz will restart in 15 seconds if you click outside again.'
                                }
                            </p>
                            <Button className="w-full" onClick={() => setLastActivity(Date.now())}>
                                I'm Still Here
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" className="border" onClick={() => router.push('/student/quick-quiz')}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Exit Quiz
                    </Button>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={`font-mono ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="text-xs">
                                Question {currentQuestion + 1} of {questions.length}
                            </Badge>
                            <Badge className="bg-violet-500 text-xs">
                                {quiz.difficulty}
                            </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-lg font-semibold mb-6">{question.question}</h3>

                                <RadioGroup
                                    value={selectedAnswer || ""}
                                    onValueChange={handleAnswer}
                                    className="space-y-3"
                                >
                                    {question.options.map((option) => {
                                        const isSelected = selectedAnswer === option.id;
                                        const isCorrect = option.id === question.correctAnswer;
                                        let optionClass = "border-2";

                                        if (showExplanation) {
                                            if (isCorrect) {
                                                optionClass = "border-green-500 bg-green-50 dark:bg-green-900/20";
                                            } else if (isSelected && !isCorrect) {
                                                optionClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
                                            }
                                        } else if (isSelected) {
                                            optionClass = "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
                                        }

                                        return (
                                            <div
                                                key={option.id}
                                                className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${optionClass} hover:bg-muted/50`}
                                                onClick={() => !showExplanation && handleAnswer(option.id)}
                                            >
                                                <RadioGroupItem value={option.id} id={option.id} disabled={showExplanation} />
                                                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                                    {option.text}
                                                </Label>
                                                {showExplanation && isCorrect && (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                )}
                                                {showExplanation && isSelected && !isCorrect && (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </RadioGroup>

                                {showExplanation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-6 p-4 rounded-lg ${answers[question.id] === question.correctAnswer ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {answers[question.id] === question.correctAnswer ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Sparkles className="w-5 h-5 text-amber-500" />
                                            )}
                                            <span className="font-medium">
                                                {answers[question.id] === question.correctAnswer ? 'Correct!' : 'Explanation'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>

                            {!showExplanation ? (
                                <Button
                                    onClick={handleCheckAnswer}
                                    disabled={!selectedAnswer}
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <Button onClick={handleNext}>
                                    {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}