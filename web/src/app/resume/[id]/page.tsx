"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe, Loader2, FileText, AlertCircle, User, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { apiService, ResumeResponse } from '@/lib/api';
import Navbar from "@/components/sections/navbar/default";
import Footer from "@/components/sections/footer/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>;

interface TemplateStyles {
  header: string;
  name: string;
  headline: string;
  contact: string;
  sectionTitle: string;
  sectionItem: string;
  skill: string;
  firstSectionPadding: string;
}

const getTemplateStyles = (template: string, primaryColor: string): TemplateStyles => {
  switch (template) {
    case 'pikachu':
      return {
        header: 'background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%); border-bottom: 4px solid ' + primaryColor + '; padding-bottom: 20px; margin-bottom: 20px;',
        name: 'font-size: 26pt; font-weight: bold; color: ' + primaryColor + '; letter-spacing: -0.5px; background: none;',
        headline: 'font-size: 12pt; color: #666; margin-top: 4px; font-weight: 500;',
        contact: 'font-size: 9pt; color: #888; margin-top: 8px;',
        sectionTitle: 'font-size: 12pt; font-weight: bold; color: ' + primaryColor + '; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid ' + primaryColor + '; padding-bottom: 4px; margin-bottom: 10px;',
        sectionItem: 'margin-bottom: 12pt;',
        skill: 'background: ' + primaryColor + '; color: white; padding: 3px 10px; border-radius: 12px; font-size: 8pt;',
        firstSectionPadding: '',
      };
    case 'chikorita':
      return {
        header: 'border-left: 6px solid ' + primaryColor + '; border-bottom: none; padding-left: 16px; padding-bottom: 0; margin-bottom: 16px;',
        name: 'font-size: 24pt; font-weight: 300; color: ' + primaryColor + ';',
        headline: 'font-size: 11pt; color: #555; margin-top: 4px; font-style: italic;',
        contact: 'font-size: 9pt; color: #777; margin-top: 6px;',
        sectionTitle: 'font-size: 11pt; font-weight: 600; color: ' + primaryColor + '; margin-bottom: 8px; padding-bottom: 0; border-bottom: none;',
        sectionItem: 'margin-bottom: 8pt; padding-left: 12px; border-left: 2px solid #eee;',
        skill: 'border: 1px solid ' + primaryColor + '; color: ' + primaryColor + '; padding: 2px 8px; font-size: 8pt;',
        firstSectionPadding: '',
      };
    case 'glalie':
      return {
        header: 'background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;',
        name: 'font-size: 28pt; font-weight: 800; color: #1e293b;',
        headline: 'font-size: 13pt; color: ' + primaryColor + '; margin-top: 6px; font-weight: 600;',
        contact: 'font-size: 9pt; color: #64748b; margin-top: 10px;',
        sectionTitle: 'font-size: 14pt; font-weight: 700; color: #334155; border-bottom: 3px solid ' + primaryColor + '; padding-bottom: 6px; margin-bottom: 12px;',
        sectionItem: 'margin-bottom: 14pt; background: #f8fafc; padding: 10px; border-radius: 4px;',
        skill: 'background: linear-gradient(135deg, ' + primaryColor + '20, ' + primaryColor + '40); color: ' + primaryColor + '; padding: 4px 10px; font-size: 9pt; font-weight: 500;',
        firstSectionPadding: 'padding-top: 16px;',
      };
    case 'leafish':
      return {
        header: 'display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: center; border-bottom: 2px solid ' + primaryColor + '; padding-bottom: 16px;',
        name: 'font-size: 20pt; font-weight: bold; color: ' + primaryColor + ';',
        headline: 'font-size: 10pt; color: #666; margin-top: 2px;',
        contact: 'font-size: 8pt; color: #888; margin-top: 4px;',
        sectionTitle: 'font-size: 10pt; font-weight: bold; color: ' + primaryColor + '; background: ' + primaryColor + '15; padding: 6px 12px; border-radius: 4px; display: inline-block; margin-bottom: 10px;',
        sectionItem: 'margin-bottom: 10pt;',
        skill: 'background: #f0fdf4; color: ' + primaryColor + '; padding: 2px 8px; font-size: 8pt; border-radius: 2px;',
        firstSectionPadding: 'padding-top: 8px;',
      };
    default:
      return {
        header: 'border-bottom: 3px solid ' + primaryColor + '; padding-bottom: 16px; margin-bottom: 16px;',
        name: 'font-size: 22pt; font-weight: bold;',
        headline: 'font-size: 11pt; color: ' + primaryColor + '; margin-top: 2px;',
        contact: 'font-size: 9pt; color: #666; margin-top: 6px;',
        sectionTitle: 'font-size: 11pt; font-weight: bold; color: ' + primaryColor + '; margin-bottom: 8pt; padding-bottom: 3pt; border-bottom: 1px solid #ddd;',
        sectionItem: 'margin-bottom: 10pt;',
        skill: 'background: ' + primaryColor + '15; padding: 2px 8px; border-radius: 3px; font-size: 8pt; color: ' + primaryColor + ';',
        firstSectionPadding: '',
      };
  }
};

export default function SharedResumePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        setLoading(true);
        const res = await apiService.getSharedResume(id);
        if (res.success && res.data) {
          setResume(res.data);
          document.title = `${res.data.title} - Shared Resume`;
        } else {
          setError(res.error?.message || "This resume is not publicly shared or does not exist");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load shared resume");
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading shared resume...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
        <Navbar />
        <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />
        <div className="flex flex-col items-center justify-center p-8 border border-border/80 rounded-lg bg-card text-center max-w-md shadow-lg backdrop-blur-md mt-32 mb-32">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="font-semibold text-lg mb-2 text-foreground">Access Denied</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "This resume is not publicly shared or does not exist"}
          </p>
          <Button asChild>
            <a href="/">Go Back Home</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const { basics, sections, metadata } = resume;
  const primaryColor = metadata.theme.primary;
  const template = metadata.template;
  const tpl = getTemplateStyles(template, primaryColor);

  const kebabToCamel = (str: string) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  const parseStyles = (styleString: string) => {
    const style: Record<string, string> = {};
    styleString.split(';').forEach(s => {
      const [key, value] = s.split(':').map(s => s.trim());
      if (key && value) style[kebabToCamel(key)] = value;
    });
    return style;
  };

  const parseNameStyle = () => parseStyles(tpl.name);
  const parseHeadlineStyle = () => parseStyles(tpl.headline);
  const parseContactStyle = () => {
    const style = parseStyles(tpl.contact);
    (style as Record<string, unknown>).display = 'flex';
    (style as Record<string, unknown>).flexWrap = 'wrap';
    (style as Record<string, unknown>).gap = '16px';
    return style as React.CSSProperties;
  };

  const headerStyle = parseStyles(tpl.header);
  const getSkillStyle = () => parseStyles(tpl.skill);
  const getSectionTitleStyle = () => parseStyles(tpl.sectionTitle);
  const getFirstSectionStyle = () => parseStyles(tpl.firstSectionPadding);

  const hasFirstSection = sections.profiles.items.length > 0 || sections.summary.content;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Decorative background glow */}
      <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />

      {/* Main content grid */}
      <main className="flex-1 mx-auto max-w-7xl px-6 pt-32 pb-24 md:px-12 md:pt-40 w-full animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Creator and Platform info */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">

            {/* Creator details */}
            <Card className="bg-card/50 backdrop-blur-md border border-border/80 shadow-md">
              <CardHeader className="flex flex-row items-center space-x-4 p-5 pb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {basics.picture ? (
                    <img src={basics.picture} alt={basics.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{basics.name || "Anonymous Creator"}</CardTitle>
                  <CardDescription className="text-xs font-semibold text-muted-foreground">{basics.headline || "Professional"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3.5 border-t border-border/40 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Created: {formatDate(resume.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Updated: {formatDate(resume.updated_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Platform badge */}
            <Card className="bg-card/50 backdrop-blur-md border border-border/80 shadow-md p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">Created on ShikshaDisha</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                This resume was built & formatted, using ShikshaDisha's Resume Builder.
              </p>
              <Button asChild variant="secondary" className="w-full h-9 rounded-lg text-xs font-medium">
                <a href="/auth" className="flex items-center justify-center gap-1.5">
                  Build Your Own
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </Button>
            </Card>

          </div>

          {/* Right Column: Title and PDF preview */}
          <div className="lg:col-span-8 space-y-6">

            {/* Header info */}
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
                {resume.title}
              </h1>
              <p className="text-sm text-muted-foreground font-medium flex items-center justify-center lg:justify-start gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                Publicly Shared Resume
              </p>
            </div>

            {/* Document sheet */}
            <div className="bg-card/30 backdrop-blur-md border border-border/60 p-4 sm:p-6 rounded-2xl shadow-xl flex justify-center overflow-auto">
              <div className="bg-white shadow-lg border border-gray-200 overflow-x-auto p-8 rounded select-none text-black text-left shrink-0" style={{ width: '210mm', minHeight: '297mm', fontFamily: metadata.typography.font.family, fontSize: `${metadata.typography.fontSize}pt`, lineHeight: metadata.typography.lineHeight, color: metadata.theme.text, padding: `${metadata.page.margin}px` }}>
                {(basics.name || basics.headline || basics.email) && (
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', ...headerStyle }}>
                    {basics.picture && <img src={basics.picture} alt="Photo" className="w-16 h-16 rounded-lg object-cover border-2" style={{ borderColor: primaryColor, alignSelf: 'center' }} />}
                    <div className="flex-1" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                      {basics.name && <div style={parseNameStyle()}>{basics.name}</div>}
                      {basics.headline && <div style={parseHeadlineStyle()}>{basics.headline}</div>}
                      <div style={parseContactStyle()}>
                        {basics.email && <a href={`mailto:${basics.email}`} style={{ fontSize: '11px', color: primaryColor, textDecoration: 'none' }}><Mail size={12} className="inline mr-1" />{basics.email}</a>}
                        {basics.phone && <a href={`tel:${basics.phone}`} style={{ fontSize: '11px', color: primaryColor, textDecoration: 'none' }}><Phone size={12} className="inline mr-1" />{basics.phone}</a>}
                        {basics.location && <span style={{ fontSize: '11px', color: primaryColor }}><MapPin size={12} className="inline mr-1" />{basics.location}</span>}
                        {basics.url.href && <a href={basics.url.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: primaryColor, textDecoration: 'none' }}><Globe size={12} className="inline mr-1" />{basics.url.href}</a>}
                      </div>
                    </div>
                  </div>
                )}
                {sections.profiles.items.length > 0 && <div className="mb-4" style={getFirstSectionStyle()}><div style={getSectionTitleStyle()}>{sections.profiles.name}</div><div className="flex flex-wrap gap-2">{sections.profiles.items.map((profile: any) => <a key={profile.id} href={profile.url.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: primaryColor, textDecoration: 'none' }}>{profile.network}</a>)}</div></div>}
                {sections.summary.content && <div className="mb-4" style={hasFirstSection ? {} : getFirstSectionStyle()}><div style={getSectionTitleStyle()}>{sections.summary.name}</div><div className="text-sm text-gray-600">{sections.summary.content}</div></div>}
                {sections.experience.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.experience.name}</div>{sections.experience.items.map((exp: any) => <div key={exp.id} className="mb-3"><div className="flex justify-between"><div><div className="font-semibold text-sm">{exp.position}</div><div className="text-xs text-gray-500">{exp.company}{exp.location && `, ${exp.location}`}</div></div><div className="text-xs text-gray-400">{exp.startDate || ''} - {exp.current ? 'Present' : exp.endDate || ''}</div></div>{exp.summary && <div className="text-xs text-gray-600 mt-1">{exp.summary}</div>}</div>)}</div>}
                {sections.education.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.education.name}</div>{sections.education.items.map((edu: any) => <div key={edu.id} className="mb-2"><div className="flex justify-between"><div><div className="font-semibold text-sm">{edu.studyType} in {edu.area}</div><div className="text-xs text-gray-500">{edu.institution}</div></div><div className="text-xs text-gray-400">{edu.startDate || ''} - {edu.current ? 'Present' : edu.endDate || ''}</div></div></div>)}</div>}
                {sections.skills.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.skills.name}</div><div className="flex flex-wrap gap-1">{sections.skills.items.map((skill: any) => <span key={skill.id} style={getSkillStyle()}>{skill.name} {'★'.repeat(skill.level)}{'☆'.repeat(5 - skill.level)}</span>)}</div></div>}
                {sections.projects.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.projects.name}</div>{sections.projects.items.map((proj: any) => <div key={proj.id} className="mb-2"><div className="font-semibold text-sm">{proj.name}{proj.url.href && <a href={proj.url.href} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-primary">🔗</a>}</div>{proj.description && <div className="text-xs text-gray-600">{proj.description}</div>}</div>)}</div>}
                {sections.certifications.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.certifications.name}</div>{sections.certifications.items.map((cert: any) => <div key={cert.id} className="mb-2"><div className="flex justify-between"><div className="font-semibold text-sm">{cert.name}{cert.url.href && <a href={cert.url.href} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-primary">🔗</a>}</div><div className="text-xs text-gray-400">{cert.date || ''}</div></div><div className="text-xs text-gray-500">{cert.issuer}</div></div>)}</div>}
                {sections.languages.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.languages.name}</div><div className="flex flex-wrap gap-1">{sections.languages.items.map((lang: any) => <span key={lang.id} style={getSkillStyle()}>{lang.name} ({lang.description})</span>)}</div></div>}
                {sections.interests.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.interests.name}</div><div className="flex flex-wrap gap-1">{sections.interests.items.map((i: any) => <span key={i.id} style={getSkillStyle()}>{i.name}</span>)}</div></div>}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
