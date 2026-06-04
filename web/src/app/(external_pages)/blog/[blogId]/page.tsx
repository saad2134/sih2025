import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  Calendar, Clock, User, ArrowLeft, ArrowRight, Tag, Mail,
  BrainCircuit, TrendingUp, GraduationCap, Compass, ShieldCheck, Rocket,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const mediaIcons: Record<string, React.ElementType> = {
  "how-ai-is-transforming-career-guidance-in-india": BrainCircuit,
  "top-10-in-demand-skills-for-2026": TrendingUp,
  "from-classroom-to-career-bridging-the-skills-gap": GraduationCap,
  "building-your-personal-learning-roadmap-with-ai": Rocket,
  "micro-credentials-the-future-of-skill-verification": ShieldCheck,
  "shikshadisha-at-sudhee-cbit-hackathon-2026": Compass,
};

const blogPosts = [
  {
    id: "how-ai-is-transforming-career-guidance-in-india",
    title: "How AI is Transforming Career Guidance in India",
    excerpt: "Discover how artificial intelligence is reshaping the way students and professionals navigate their career paths, making personalized guidance accessible to everyone.",
    author: "ShikshaDisha Team",
    date: "May 20, 2026",
    readTime: "5 min read",
    category: "AI & Technology",
    tags: ["AI", "Career Guidance", "Machine Learning"],
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    mediaLabel: "AI",
    content: [
      "Artificial intelligence is revolutionizing the career guidance landscape in India, offering personalized insights that were once only available through expensive career counselors. With millions of students entering the workforce each year, the need for scalable, intelligent guidance has never been greater.",
      "ShikshaDisha leverages state-of-the-art machine learning algorithms to analyze a learner's academic background, skill set, and career aspirations. By cross-referencing this data with real-time labor market trends, the platform delivers tailored recommendations that evolve as the user progresses.",
      "The impact has been significant. Users report a 40% faster time-to-decision on career paths, and 75% feel more confident about their skill development choices. As AI continues to mature, the potential to democratize career guidance across India's diverse population is immense.",
      "Future developments include integration with employer data for direct job matching, AI-powered mock interviews, and real-time skill gap analysis that adapts to changing industry demands. The era of one-size-fits-all career advice is coming to an end.",
    ],
  },
  {
    id: "top-10-in-demand-skills-for-2026",
    title: "Top 10 In-Demand Skills for 2026",
    excerpt: "Stay ahead of the curve with our curated list of the most sought-after skills in today's job market, backed by real-time labor market data and industry insights.",
    author: "ShikshaDisha Team",
    date: "May 15, 2026",
    readTime: "7 min read",
    category: "Career Advice",
    tags: ["Skills", "Job Market", "Trends"],
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    mediaLabel: "Trends",
    content: [
      "The job market in 2026 is more dynamic than ever. Based on our analysis of labor market data and industry projections, here are the top 10 skills that employers are actively seeking across India's fastest-growing sectors.",
      "1. Artificial Intelligence & Machine Learning — AI continues to dominate as companies across every sector invest in automation and intelligent systems. Proficiency in frameworks like TensorFlow and PyTorch is highly valued.",
      "2. Data Science & Analytics — The ability to derive actionable insights from data remains one of the most sought-after skills. SQL, Python, and visualization tools are essential.",
      "3. Cloud Computing — AWS, Azure, and GCP certifications open doors to roles in infrastructure, DevOps, and solution architecture.",
      "4. Full-Stack Web Development — Companies need developers who can work across the entire stack, from React frontends to Node.js backends.",
      "5. Cybersecurity — With increasing digital threats, skilled professionals in ethical hacking, penetration testing, and security compliance are in high demand.",
      "6. Digital Marketing — SEO, content strategy, and social media management remain critical as businesses compete for online attention.",
      "7. UI/UX Design — Products live and die by their user experience. Skills in Figma, prototyping, and user research are invaluable.",
      "8. Project Management — Agile and Scrum methodologies are standard across industries, making certified project managers essential.",
      "9. Soft Skills — Communication, problem-solving, and adaptability consistently rank as top requirements across job postings.",
      "10. Blockchain — Beyond cryptocurrency, blockchain technology is finding applications in supply chain, healthcare, and finance.",
    ],
  },
  {
    id: "from-classroom-to-career-bridging-the-skills-gap",
    title: "From Classroom to Career: Bridging the Skills Gap",
    excerpt: "Explore the disconnect between academic education and industry requirements, and learn how targeted upskilling can bridge the gap effectively.",
    author: "ShikshaDisha Team",
    date: "May 10, 2026",
    readTime: "6 min read",
    category: "Education",
    tags: ["Skills Gap", "Education", "Upskilling"],
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    mediaLabel: "Education",
    content: [
      "India produces millions of graduates every year, yet a significant percentage remain unemployable due to the widening gap between academic curricula and industry requirements. This disconnect has become one of the most pressing challenges in the education sector.",
      "Traditional education systems often struggle to keep pace with rapidly evolving industry demands. While universities focus on theoretical foundations, employers increasingly seek practical, hands-on experience with modern tools and technologies.",
      "The solution lies in targeted upskilling — identifying specific skill gaps and addressing them through focused learning paths. Platforms like ShikshaDisha are designed to bridge this gap by analyzing individual profiles and recommending precise upskilling opportunities.",
      "Key strategies for bridging the skills gap include: embracing micro-credentials for continuous learning, participating in internships and project-based learning, leveraging AI-powered career guidance tools, and maintaining a growth mindset focused on lifelong learning.",
      "By taking a proactive approach to skill development, students can transform their academic knowledge into career-ready capabilities, ensuring they graduate not just with a degree, but with employable skills.",
    ],
  },
  {
    id: "building-your-personal-learning-roadmap-with-ai",
    title: "Building Your Personal Learning Roadmap with AI",
    excerpt: "Learn how ShikshaDisha's AI engine creates customized learning pathways tailored to your unique background, goals, and schedule.",
    author: "ShikshaDisha Team",
    date: "May 5, 2026",
    readTime: "4 min read",
    category: "Product Updates",
    tags: ["Product", "AI", "Learning Paths"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    mediaLabel: "Product",
    content: [
      "One of the most powerful features of ShikshaDisha is our AI-powered personal learning roadmap. Unlike static course recommendations, our system creates a dynamic, adaptive pathway that evolves with your progress and changing goals.",
      "The process begins with a comprehensive profile assessment. Our AI analyzes your academic background, existing skills, career aspirations, available time, and preferred learning style. This multi-dimensional analysis forms the foundation of your personalized roadmap.",
      "Based on your profile, the system identifies skill gaps and prioritizes them based on relevance to your target career. It then curates a sequence of courses, projects, and assessments designed to build skills in the most efficient order.",
      "What makes our approach unique is the adaptive engine. As you complete modules and demonstrate proficiency, the roadmap adjusts automatically — accelerating through areas where you excel and providing additional resources where you need more practice.",
    ],
  },
  {
    id: "micro-credentials-the-future-of-skill-verification",
    title: "Micro-Credentials: The Future of Skill Verification",
    excerpt: "Why micro-credentials are becoming the gold standard for skill verification and how they can boost your employability in a competitive job market.",
    author: "ShikshaDisha Team",
    date: "April 28, 2026",
    readTime: "5 min read",
    category: "Career Advice",
    tags: ["Micro-Credentials", "Certification", "Employability"],
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10",
    mediaLabel: "Credentials",
    content: [
      "Micro-credentials are transforming the way skills are verified and recognized in the job market. These focused, bite-sized certifications validate specific competencies and are increasingly preferred by employers over traditional degrees for certain roles.",
      "Unlike traditional degrees that require years of commitment, micro-credentials can be earned in weeks or months. They offer a flexible, affordable way to demonstrate expertise in specific areas — from Python programming to digital marketing strategy.",
      "For employers, micro-credentials provide a more granular view of a candidate's capabilities. Instead of relying solely on a degree title, hiring managers can see exactly what skills a candidate has mastered and how recently they were validated.",
      "ShikshaDisha supports micro-credentialing by offering certificates for course completions, with Pro and Premium users receiving unlimited certificates. These credentials are designed to be shareable on LinkedIn and other professional platforms.",
      "As the job market continues to evolve, micro-credentials will play an increasingly important role in skill verification, making continuous learning both accessible and rewarding.",
    ],
  },
  {
    id: "shikshadisha-at-sudhee-cbit-hackathon-2026",
    title: "ShikshaDisha at SUDHEE CBIT Hackathon 2026",
    excerpt: "A behind-the-scenes look at our journey building ShikshaDisha during the SUDHEE CBIT Hackathon and how it evolved into a full-fledged platform.",
    author: "ShikshaDisha Team",
    date: "April 20, 2026",
    readTime: "8 min read",
    category: "Community",
    tags: ["Hackathon", "DevBandits", "SUDHEE"],
    gradient: "from-violet-500/20 to-indigo-500/20",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    mediaLabel: "Community",
    content: [
      "ShikshaDisha started as a passion project during the SUDHEE CBIT Hackathon 2026, where the DevBandits team came together with a shared vision: make career guidance accessible and personalized for every Indian learner.",
      "Over the course of the hackathon, the team built the initial prototype — a basic AI-powered recommendation engine that could analyze student profiles and suggest relevant courses. The response from mentors and judges was overwhelmingly positive.",
      "What set ShikshaDisha apart was its focus on bridging the gap between academic learning and industry requirements. The hackathon prototype demonstrated that AI could effectively identify skill gaps and recommend targeted learning paths.",
      "After the hackathon, the team decided to continue developing the platform. Features like labor market integration, real-time skill gap analysis, and personalized roadmaps were added, transforming the prototype into a production-ready platform.",
      "Today, ShikshaDisha serves hundreds of active users and continues to evolve. The journey from hackathon project to functional platform is a testament to what dedicated teams can achieve when they identify a real problem and work tirelessly to solve it.",
    ],
  },
];

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    blogId: post.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId } = await params;
  const post = blogPosts.find((p) => p.id === blogId);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} ✦ ${siteConfig.name}`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ blogId: string }> }) {
  const { blogId } = await params;
  const post = blogPosts.find((p) => p.id === blogId);
  if (!post) notFound();

  const MediaIcon = mediaIcons[post.id];

  return (
    <>
      <main className="min-h-screen w-full relative overflow-hidden bg-background text-foreground">
        <Navbar />

        <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />

        <div className="max-w-container mx-auto px-6 py-24 pt-32 md:pt-36 flex flex-col items-center gap-12 sm:gap-16">

          {/* Hero Media */}
          <div className={`relative w-full max-w-4xl h-56 sm:h-72 rounded-2xl bg-linear-to-br ${post.gradient} flex items-center justify-center overflow-hidden`}>
            {/* Back link overlay */}
            <Link
              href="/blog"
              className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground bg-background/70 border border-border/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl hover:bg-background/90 hover:border-primary/30 transition-all duration-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Back to Blog
            </Link>
            {MediaIcon && <MediaIcon className={`w-20 h-20 sm:w-28 sm:h-28 ${post.iconColor} opacity-30`} />}
            <span className={`absolute bottom-4 left-5 text-xs font-bold uppercase tracking-widest ${post.iconColor} opacity-40`}>
              {post.mediaLabel}
            </span>
          </div>

          {/* Header section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl -mt-6">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${post.bgColor} ${post.iconColor}`}>
              <Tag className="w-3 h-3" />
              {post.category}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>

          {/* Article Content */}
          <article className="w-full max-w-3xl space-y-6 text-base sm:text-lg leading-relaxed text-foreground/90">
            <div className={`w-full h-1 rounded-full bg-linear-to-r ${post.gradient} mb-6`} />
            {post.content.map((paragraph, idx) => (
              <p key={idx}>
                {paragraph}
              </p>
            ))}
          </article>

          {/* Tags */}
          <div className="w-full max-w-3xl flex flex-wrap gap-2">
            {post.tags.map((tag, ti) => (
              <span key={ti} className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md border border-border/40">
                #{tag}
              </span>
            ))}
          </div>

          {/* Call to action Card */}
          <div className="w-full max-w-3xl border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors duration-300">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Enjoyed this post?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                Discover more articles and insights from the ShikshaDisha team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium shadow-md shadow-primary/10">
                <Link href="/blog" className="flex items-center gap-2">
                  More Posts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>

        <Footer />
      </main>
    </>
  );
}
