'use client';

import { useEffect, useRef, useState } from 'react';
import { Section } from '@/components/ui/section';
import { Target, Clock, Zap, Brain, Search, ChevronDown, CheckCircle } from 'lucide-react';

const COURSE_CARDS = [
  { id: 1, title: 'Python Basics', relevance: 0.2, threshold: 0.10 },
  { id: 2, title: 'Web Dev', relevance: 0.3, threshold: 0.20 },
  { id: 3, title: 'Data Science', relevance: 0.4, threshold: 0.30 },
  { id: 4, title: 'Machine Learning', relevance: 0.5, threshold: 0.40 },
  { id: 5, title: 'Cloud Computing', relevance: 0.3, threshold: 0.50 },
  { id: 6, title: 'React JS', relevance: 0.6, threshold: 0.60 },
  { id: 7, title: 'AI Fundamentals', relevance: 0.7, threshold: 0.75 },
  { id: 8, title: 'Your Perfect Match', relevance: 1, threshold: 0.90, highlighted: true },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function LearningEfficiency() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const arcLengthRef = useRef(0);

  const targetProgressRef = useRef(0);
  const displayProgressRef = useRef(0);

  const relevanceRef = useRef<HTMLSpanElement>(null);
  const relevanceBarRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const savedRef = useRef<HTMLSpanElement>(null);
  const aiLevelRef = useRef<HTMLSpanElement>(null);
  const efficiencyTextRef = useRef<HTMLSpanElement>(null);
  const sliderHintRef = useRef<HTMLParagraphElement>(null);
  const courseGridRef = useRef<HTMLDivElement>(null);
  const completionBadgeRef = useRef<HTMLDivElement>(null);

  const [isLocked, setIsLocked] = useState(false);

  const SCROLL_SENSITIVITY = 0.003;
  const LERP_FACTOR = 0.08;

  useEffect(() => {
    const section = sectionRef.current;
    const slider = sliderRef.current;
    const arc = arcRef.current;
    if (!section || !slider || !arc) return;

    let locked = false;
    let touchStartY = 0;
    let rafId: number | null = null;
    let wheelAttached = false;

    const updateMetrics = (p: number) => {
      const fillPct = Math.round(p * 100);
      const relevance = Math.round(p * 35);
      const timeVal = Math.round(45 - p * 20);
      const saved = Math.round(p * 20);
      const aiLevel = Math.round(p * 10);
      const efficiency = Math.round(p * 100);

      slider.value = String(fillPct);
      slider.style.setProperty('--fill', `${fillPct}%`);

      const totalLength = arcLengthRef.current;
      if (totalLength) {
        arc.style.strokeDashoffset = String(totalLength - p * totalLength);
        const r = Math.round(124 + p * (34 - 124));
        const g = Math.round(58 + p * (197 - 58));
        const b = Math.round(237 + p * (94 - 237));
        arc.style.stroke = `rgb(${r},${g},${b})`;
      }

      if (relevanceRef.current) relevanceRef.current.textContent = `${relevance}%`;
      if (relevanceBarRef.current) relevanceBarRef.current.style.width = `${relevance}%`;
      if (timeRef.current) timeRef.current.textContent = `${timeVal}s`;
      if (savedRef.current) savedRef.current.textContent = `+${saved}s`;
      if (aiLevelRef.current) aiLevelRef.current.textContent = `${aiLevel}%`;
      if (efficiencyTextRef.current) efficiencyTextRef.current.textContent = `${efficiency}%`;

      if (sliderHintRef.current) {
        if (p <= 0) sliderHintRef.current.textContent = 'Scroll down to start';
        else if (p >= 1) sliderHintRef.current.textContent = 'Animation complete!';
        else sliderHintRef.current.textContent = 'Scroll to explore';
      }

      if (completionBadgeRef.current) {
        const show = p >= 0.99;
        completionBadgeRef.current.style.opacity = show ? '1' : '0';
        completionBadgeRef.current.style.transform = show ? 'scale(1)' : 'scale(0.8)';
      }

      if (courseGridRef.current) {
        const cards = courseGridRef.current.children;
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as HTMLElement;
          const course = COURSE_CARDS[i];
          if (!course) continue;
          const raw = (p - course.threshold) / 0.1;
          const opacity = clamp(raw, 0, 1);
          card.style.opacity = String(opacity);
          card.style.transform = opacity > 0.01 ? 'translateY(0)' : 'translateY(8px)';

          if (course.highlighted && p >= 0.90) {
            card.style.borderColor = '#7C3AED';
            card.style.backgroundColor = 'rgba(124, 58, 237, 0.12)';
            card.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.3)';
          } else {
            const high = course.relevance > 0.6;
            const mid = course.relevance > 0.4;
            card.style.borderColor = high ? 'rgba(34, 197, 94, 0.3)' : mid ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)';
            card.style.backgroundColor = high ? 'rgba(34, 197, 94, 0.08)' : mid ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)';
            card.style.boxShadow = 'none';
          }
        }
      }
    };

    const tick = () => {
      displayProgressRef.current += (targetProgressRef.current - displayProgressRef.current) * LERP_FACTOR;
      if (Math.abs(displayProgressRef.current - targetProgressRef.current) < 0.0001) {
        displayProgressRef.current = targetProgressRef.current;
      }
      updateMetrics(displayProgressRef.current);
      rafId = requestAnimationFrame(tick);
    };

    const startRaf = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tick);
    };

    const stopRaf = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const unlockScroll = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    const lockScroll = () => {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    };

    const unlock = () => {
      locked = false;
      setIsLocked(false);
      unlockScroll();
      stopRaf();
      detachWheel();
    };

    const handleWheel = (e: WheelEvent) => {
      if (!locked) return;
      const newProgress = clamp(targetProgressRef.current + e.deltaY * SCROLL_SENSITIVITY, 0, 1);
      const willUnlockDown = newProgress >= 1 && e.deltaY > 0;
      const willUnlockUp = newProgress <= 0 && e.deltaY < 0;

      if (willUnlockDown || willUnlockUp) {
        targetProgressRef.current = clamp(newProgress, 0, 1);
        unlock();
        return;
      }

      e.preventDefault();
      targetProgressRef.current = newProgress;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!locked) return;
      const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      let delta = 0;
      if (e.key === 'ArrowDown' || e.key === ' ') delta = 60;
      else if (e.key === 'ArrowUp') delta = -60;
      else if (e.key === 'PageDown') delta = 300;
      else if (e.key === 'PageUp') delta = -300;
      targetProgressRef.current = clamp(targetProgressRef.current + delta * SCROLL_SENSITIVITY, 0, 1);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!locked) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) < 2) return;
      touchStartY = e.touches[0].clientY;
      targetProgressRef.current = clamp(targetProgressRef.current + deltaY * SCROLL_SENSITIVITY, 0, 1);
    };

    const handleSliderInput = () => {
      if (!locked) return;
      targetProgressRef.current = parseFloat(slider.value) / 100;
    };

    const attachWheel = () => {
      if (wheelAttached) return;
      wheelAttached = true;
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      slider.addEventListener('input', handleSliderInput);
    };

    const detachWheel = () => {
      wheelAttached = false;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('input', handleSliderInput);
    };

    const onEntry = () => {
      locked = true;
      setIsLocked(true);
      lockScroll();
      startRaf();
      attachWheel();
    };

    const onExit = () => {
      if (locked) {
        locked = false;
        setIsLocked(false);
        unlockScroll();
      }
      stopRaf();
      detachWheel();
    };

    const totalLen = arc.getTotalLength();
    arc.style.strokeDasharray = String(totalLen);
    arc.style.strokeDashoffset = String(totalLen);
    arcLengthRef.current = totalLen;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onEntry();
        else onExit();
      },
      { threshold: 0.75 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      onExit();
    };
  }, []);

  return (
    <Section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div ref={sectionRef} className="relative z-10 min-h-screen flex flex-col px-4 md:px-8 lg:px-12">
        <div className="text-center mb-6 sm:mb-8 pt-8 sm:pt-12">
          <h2 className="scroll-m-20 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 leading-[1.3]">
            How Our AI Learns Your Style
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 sm:text-lg md:text-xl">
            Watch as our pathway engine analyzes your behavior and optimizes your learning journey in real-time!
          </p>
        </div>

        <div className="flex justify-center mb-4 animate-bounce">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex flex-col items-center mb-6">
          <p ref={sliderHintRef} className="text-lg text-muted-foreground mb-3">
            Scroll down to start
          </p>
          <div className="relative w-full max-w-md">
            <input
              ref={sliderRef}
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              className="w-full rounded-full cursor-pointer
                [--fill:0%]
                h-[6px] py-[10px] box-content
                appearance-none bg-transparent outline-none
                [&::-webkit-slider-container]:flex [&::-webkit-slider-container]:items-center
                [&::-webkit-slider-runnable-track]:h-[6px] [&::-webkit-slider-runnable-track]:rounded-full
                [&::-webkit-slider-runnable-track]:bg-transparent
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:h-[22px]
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7C3AED]
                [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(124,58,237,0.6)]
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:mt-[-8px]
                [&::-moz-range-track]:h-[6px] [&::-moz-range-track]:rounded-full
                [&::-moz-range-track]:bg-transparent
                [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:h-[22px]
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#7C3AED]
                [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(124,58,237,0.6)]
                [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #7C3AED var(--fill, 0%), #1E1E2E var(--fill, 0%))',
              }}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Start</span>
              <span>Complete</span>
            </div>
          </div>
        </div>

        <div
          ref={completionBadgeRef}
          className="flex justify-center mb-4"
          style={{ opacity: 0, transform: 'scale(0.8)' }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 text-green-500 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            Learning Profile Optimized
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Course Matching</span>
                </div>
                <div ref={courseGridRef} className="grid grid-cols-2 gap-2">
                  {COURSE_CARDS.map((course) => (
                    <div
                      key={course.id}
                      className="p-2 rounded-lg text-xs border"
                      style={{
                        opacity: 0,
                        transform: 'translateY(8px)',
                        borderColor: course.relevance > 0.6
                          ? 'rgba(34, 197, 94, 0.3)' : course.relevance > 0.4
                          ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                        backgroundColor: course.relevance > 0.6
                          ? 'rgba(34, 197, 94, 0.08)' : course.relevance > 0.4
                          ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      }}
                    >
                      <span className="font-medium">{course.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">Relevance</span>
                  </div>
                  <span ref={relevanceRef} className="text-2xl md:text-3xl font-bold text-primary">0%</span>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <div ref={relevanceBarRef} className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-muted-foreground">Time</span>
                  </div>
                  <span ref={timeRef} className="text-2xl md:text-3xl font-bold">45s</span>
                  <p className="text-[10px] text-muted-foreground mt-1">vs 45s avg</p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-muted-foreground">Saved</span>
                  </div>
                  <span ref={savedRef} className="text-2xl md:text-3xl font-bold text-green-500">+0s</span>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Brain className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs text-muted-foreground">AI Level</span>
                  </div>
                  <span ref={aiLevelRef} className="text-2xl md:text-3xl font-bold text-purple-500">0%</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  Efficiency Score
                </h3>
                <div className="relative h-32 md:h-36 flex items-center justify-center">
                  <svg viewBox="0 0 200 120" width="200" height="120" className="overflow-visible">
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#2D2D3A"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      ref={arcRef}
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="12"
                      strokeLinecap="round"
                      style={{ transition: 'none' }}
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-2">
                    <span ref={efficiencyTextRef} className="text-3xl md:text-4xl font-bold">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
