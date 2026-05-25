"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  User, Briefcase, GraduationCap, Award, Languages, Heart, Plus, Trash2, Download,
  Settings, Monitor, Palette, Type, Layout, FileText, Link2, Eye, Image, X,
  Mail, Phone, MapPin, Globe
} from 'lucide-react';

const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;

const svgToString = (element: React.ReactElement): string => {
  return ReactDOMServer.renderToStaticMarkup(element);
};
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';

interface URL {
  label: string;
  href: string;
}

interface Basics {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  url: URL;
  picture: string;
  summary: string;
}

interface Profile {
  id: string;
  network: string;
  username: string;
  url: URL;
  visible: boolean;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary: string;
  visible: boolean;
}

interface Education {
  id: string;
  institution: string;
  studyType: string;
  area: string;
  startDate: string;
  endDate: string;
  current: boolean;
  visible: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  visible: boolean;
}

interface Language {
  id: string;
  name: string;
  description: string;
  visible: boolean;
}

interface Certification {
  id: string;
  name: string;
  date: string;
  issuer: string;
  url: URL;
  visible: boolean;
}

interface Interest {
  id: string;
  name: string;
  visible: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  url: URL;
  visible: boolean;
}

interface Metadata {
  template: string;
  theme: { primary: string; text: string; background: string };
  typography: {
    font: { family: string; subset: string; variants: string[] };
    fontSize: number;
    lineHeight: number;
  };
  page: { margin: number; format: string };
}

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

interface ResumeData {
  id: string;
  title: string;
  basics: Basics;
  sections: {
    summary: { id: string; name: string; visible: boolean; content: string };
    profiles: { id: string; name: string; visible: boolean; items: Profile[] };
    experience: { id: string; name: string; visible: boolean; items: Experience[] };
    education: { id: string; name: string; visible: boolean; items: Education[] };
    skills: { id: string; name: string; visible: boolean; items: Skill[] };
    languages: { id: string; name: string; visible: boolean; items: Language[] };
    certifications: { id: string; name: string; visible: boolean; items: Certification[] };
    interests: { id: string; name: string; visible: boolean; items: Interest[] };
    projects: { id: string; name: string; visible: boolean; items: Project[] };
  };
  metadata: Metadata;
}

const defaultResume: ResumeData = {
  id: 'resume-1',
  title: 'My Resume',
  basics: {
    name: '', headline: '', email: '', phone: '', location: '',
    url: { label: '', href: '' }, picture: '', summary: ''
  },
  sections: {
    summary: { id: 'summary', name: 'Summary', visible: true, content: '' },
    profiles: { id: 'profiles', name: 'Profiles', visible: true, items: [] },
    experience: { id: 'experience', name: 'Experience', visible: true, items: [] },
    education: { id: 'education', name: 'Education', visible: true, items: [] },
    skills: { id: 'skills', name: 'Skills', visible: true, items: [] },
    languages: { id: 'languages', name: 'Languages', visible: true, items: [] },
    certifications: { id: 'certifications', name: 'Certifications', visible: true, items: [] },
    interests: { id: 'interests', name: 'Interests', visible: true, items: [] },
    projects: { id: 'projects', name: 'Projects', visible: true, items: [] },
  },
  metadata: {
    template: 'onyx',
    theme: { primary: '#6366f1', text: '#1f2937', background: '#ffffff' },
    typography: { font: { family: 'Inter', subset: 'latin', variants: ['400'] }, fontSize: 11, lineHeight: 1.5 },
    page: { margin: 40, format: 'a4' },
  },
};

interface ResumeContextType {
  resume: ResumeData;
  setValue: (path: string, value: unknown) => void;
  addItem: (section: string, item: unknown) => void;
  updateItem: (section: string, id: string, field: string, value: unknown) => void;
  removeItem: (section: string, id: string) => void;
}

const ResumeContext = React.createContext<ResumeContextType | null>(null);

const useResume = () => {
  const context = React.useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within ResumeProvider');
  return context;
};

const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resume, setResume] = useState<ResumeData>(defaultResume);

  const setValue = (path: string, value: unknown) => {
    setResume(prev => {
      const newResume = { ...prev };
      const keys = path.split('.');
      let obj: Record<string, unknown> = newResume as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return newResume;
    });
  };

  const addItem = (section: string, item: unknown) => {
    setResume(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section as keyof typeof prev.sections],
          items: [...(prev.sections[section as keyof typeof prev.sections] as { items: unknown[] }).items, item],
        },
      },
    }));
  };

  const updateItem = (section: string, id: string, field: string, value: unknown) => {
    setResume(prev => {
      const sec = prev.sections[section as keyof typeof prev.sections] as { items: { id: string }[] };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...sec,
            items: sec.items.map(item => {
              if (item.id !== id) return item;
              if (field.includes('.')) {
                const [parent, child] = field.split('.');
                const parentObj = (item as Record<string, unknown>)[parent] as Record<string, unknown>;
                return { ...item, [parent]: { ...parentObj, [child]: value } };
              }
              return { ...item, [field]: value };
            }),
          },
        },
      };
    });
  };

  const removeItem = (section: string, id: string) => {
    setResume(prev => {
      const sec = prev.sections[section as keyof typeof prev.sections] as { items: { id: string }[] };
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...sec,
            items: sec.items.filter(item => item.id !== id),
          },
        },
      };
    });
  };

  return (
    <ResumeContext.Provider value={{ resume, setValue, addItem, updateItem, removeItem }}>
      {children}
    </ResumeContext.Provider>
  );
};

const sectionList = [
  { id: 'basics', name: 'Personal', icon: User },
  { id: 'summary', name: 'Summary', icon: FileText },
  { id: 'profiles', name: 'Profiles', icon: Link2 },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'skills', name: 'Skills', icon: Award },
  { id: 'languages', name: 'Languages', icon: Languages },
  { id: 'certifications', name: 'Certifications', icon: Award },
  { id: 'interests', name: 'Interests', icon: Heart },
  { id: 'projects', name: 'Projects', icon: Briefcase },
  { id: 'settings', name: 'Settings', icon: Settings },
];

const AlertBox: React.FC = () => {
  const router = useRouter();
  return (
    <div className="bg-muted border rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Get started today with a free account to autofill from profile, access an advanced builder, save & share resumes.</span>
        <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={() => router.push('/auth')}>
          Get Started
        </Button>
      </div>
    </div>
  );
};

const BasicsEditor: React.FC = () => {
  const { resume, setValue } = useResume();
  const { basics } = resume;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setValue('basics.picture', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User size={18} />
        <h3 className="font-semibold">Personal Details</h3>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
          {basics.picture ? <img src={basics.picture} alt="Profile" className="w-full h-full object-cover" /> : <Image size={24} className="text-gray-400" />}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {basics.picture && <Button variant="ghost" size="sm" onClick={() => setValue('basics.picture', '')}><X size={14} /></Button>}
      </div>
      <div className="grid gap-3">
        <div><Label className="text-xs">Full Name</Label><Input value={basics.name} onChange={(e) => setValue('basics.name', e.target.value)} placeholder="John Doe" className="h-8" /></div>
        <div><Label className="text-xs">Headline</Label><Input value={basics.headline} onChange={(e) => setValue('basics.headline', e.target.value)} placeholder="Software Engineer" className="h-8" /></div>
        
          <div className="relative"><Label className="text-xs">Email</Label><div className="relative"><Mail size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input type="email" value={basics.email} onChange={(e) => setValue('basics.email', e.target.value)} placeholder="john@example.com" className="h-8 pl-8" /></div></div>
          <div className="relative"><Label className="text-xs">Phone</Label><div className="relative"><Phone size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={basics.phone} onChange={(e) => setValue('basics.phone', e.target.value)} placeholder="+1 234 567 8900" className="h-8 pl-8" /></div></div>
        
          <div className="relative"><Label className="text-xs">Location</Label><div className="relative"><MapPin size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={basics.location} onChange={(e) => setValue('basics.location', e.target.value)} placeholder="New York, NY" className="h-8 pl-8" /></div></div>
          <div className="relative"><Label className="text-xs">Website</Label><div className="relative"><Globe size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={basics.url.href} onChange={(e) => setValue('basics.url.href', e.target.value)} placeholder="https://example.com" className="h-8 pl-8" /></div></div>
        </div>
    </div>
  );
};

const SummaryEditor: React.FC = () => {
  const { resume, setValue } = useResume();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><FileText size={18} /><h3 className="font-semibold">Summary</h3></div>
      <Textarea value={resume.sections.summary.content} onChange={(e) => setValue('sections.summary.content', e.target.value)} placeholder="Professional summary..." rows={5} />
    </div>
  );
};

interface SectionEditorProps {
  section: string; title: string; items: { id: string }[]; defaultItem: object; renderItem: (item: { id: string }) => React.ReactNode;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, title, items, defaultItem, renderItem }) => {
  const { addItem, removeItem } = useResume();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <Button size="sm" variant="outline" onClick={() => addItem(section, { id: Date.now().toString(), ...defaultItem, visible: true })}><Plus size={14} className="mr-1" /> Add</Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-3 border rounded-lg space-y-3">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => removeItem(section, item.id)}><Trash2 size={14} className="text-red-500" /></Button></div>
            {renderItem(item)}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No {title.toLowerCase()} added yet.</p>}
      </div>
    </div>
  );
};

const ProfilesEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { profiles } = resume.sections;
  return (
    <SectionEditor section="profiles" title="Profiles" items={profiles.items as { id: string }[]} defaultItem={{ network: '', username: '', url: { label: '', href: '' } }}
      renderItem={(item) => {
        const p = profiles.items.find(x => x.id === item.id) as Profile | undefined;
        if (!p) return null;
        return (
          <div className="grid gap-2">
            <Input value={p.network} onChange={(e) => updateItem('profiles', item.id, 'network', e.target.value)} placeholder="Network (eg: LinkedIn)" className="h-8" />
            <Input value={p.username} onChange={(e) => updateItem('profiles', item.id, 'username', e.target.value)} placeholder="Username" className="h-8" />
            <Input value={p.url.href} onChange={(e) => updateItem('profiles', item.id, 'url.href', e.target.value)} placeholder="Profile URL" className="h-8" />
          </div>
        );
      }}
    />
  );
};

const ExperienceEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { experience } = resume.sections;
  return (
    <SectionEditor section="experience" title="Experience" items={experience.items as { id: string }[]} defaultItem={{ company: '', position: '', location: '', startDate: '', endDate: '', current: false, summary: '' }}
      renderItem={(item) => {
        const exp = experience.items.find(x => x.id === item.id) as Experience | undefined;
        if (!exp) return null;
        return (
          <div className="space-y-2">
            <Input value={exp.company} onChange={(e) => updateItem('experience', item.id, 'company', e.target.value)} placeholder="Company" className="h-8" />
            <Input value={exp.position} onChange={(e) => updateItem('experience', item.id, 'position', e.target.value)} placeholder="Position" className="h-8" />
            <Input value={exp.location} onChange={(e) => updateItem('experience', item.id, 'location', e.target.value)} placeholder="Location" className="h-8" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="month" value={exp.startDate} onChange={(e) => updateItem('experience', item.id, 'startDate', e.target.value)} className="h-8" />
              <Input type="month" value={exp.endDate} onChange={(e) => updateItem('experience', item.id, 'endDate', e.target.value)} className="h-8" disabled={exp.current} />
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={exp.current} onChange={(e) => updateItem('experience', item.id, 'current', e.target.checked)} /><Label className="text-xs">Current</Label></div>
            <Textarea value={exp.summary} onChange={(e) => updateItem('experience', item.id, 'summary', e.target.value)} placeholder="Description..." rows={2} />
          </div>
        );
      }}
    />
  );
};

const EducationEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { education } = resume.sections;
  return (
    <SectionEditor section="education" title="Education" items={education.items as { id: string }[]} defaultItem={{ institution: '', studyType: '', area: '', startDate: '', endDate: '', current: false }}
      renderItem={(item) => {
        const edu = education.items.find(x => x.id === item.id) as Education | undefined;
        if (!edu) return null;
        return (
          <div className="space-y-2">
            <Input value={edu.institution} onChange={(e) => updateItem('education', item.id, 'institution', e.target.value)} placeholder="Institution" className="h-8" />
            <Input value={edu.studyType} onChange={(e) => updateItem('education', item.id, 'studyType', e.target.value)} placeholder="Degree" className="h-8" />
            <Input value={edu.area} onChange={(e) => updateItem('education', item.id, 'area', e.target.value)} placeholder="Field of Study" className="h-8" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="month" value={edu.startDate} onChange={(e) => updateItem('education', item.id, 'startDate', e.target.value)} className="h-8" />
              <Input type="month" value={edu.endDate} onChange={(e) => updateItem('education', item.id, 'endDate', e.target.value)} className="h-8" disabled={edu.current} />
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={edu.current} onChange={(e) => updateItem('education', item.id, 'current', e.target.checked)} /><Label className="text-xs">Current</Label></div>
          </div>
        );
      }}
    />
  );
};

const SkillsEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { skills } = resume.sections;
  return (
    <SectionEditor section="skills" title="Skills" items={skills.items as { id: string }[]} defaultItem={{ name: '', level: 3 }}
      renderItem={(item) => {
        const skill = skills.items.find(x => x.id === item.id) as Skill | undefined;
        if (!skill) return null;
        return (
          <div className="space-y-2">
            <Input value={skill.name} onChange={(e) => updateItem('skills', item.id, 'name', e.target.value)} placeholder="Skill name" className="h-8" />
            <div><Label className="text-xs">Level: {skill.level}/5</Label><input type="range" min="1" max="5" value={skill.level} onChange={(e) => updateItem('skills', item.id, 'level', parseInt(e.target.value))} className="w-full" /></div>
          </div>
        );
      }}
    />
  );
};

const LanguagesEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { languages } = resume.sections;
  return (
    <SectionEditor section="languages" title="Languages" items={languages.items as { id: string }[]} defaultItem={{ name: '', description: '' }}
      renderItem={(item) => {
        const lang = languages.items.find(x => x.id === item.id) as Language | undefined;
        if (!lang) return null;
        return <div className="grid grid-cols-2 gap-2"><Input value={lang.name} onChange={(e) => updateItem('languages', item.id, 'name', e.target.value)} placeholder="Language" className="h-8" /><Input value={lang.description} onChange={(e) => updateItem('languages', item.id, 'description', e.target.value)} placeholder="Fluency" className="h-8" /></div>;
      }}
    />
  );
};

const CertificationsEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { certifications } = resume.sections;
  return (
    <SectionEditor section="certifications" title="Certifications" items={certifications.items as { id: string }[]} defaultItem={{ name: '', date: '', issuer: '', url: { label: '', href: '' } }}
      renderItem={(item) => {
        const cert = certifications.items.find(x => x.id === item.id) as Certification | undefined;
        if (!cert) return null;
        return <div className="space-y-2"><Input value={cert.name} onChange={(e) => updateItem('certifications', item.id, 'name', e.target.value)} placeholder="Name" className="h-8" /><Input value={cert.issuer} onChange={(e) => updateItem('certifications', item.id, 'issuer', e.target.value)} placeholder="Issuer" className="h-8" /><Input type="month" value={cert.date} onChange={(e) => updateItem('certifications', item.id, 'date', e.target.value)} className="h-8" /><Input value={cert.url.href} onChange={(e) => updateItem('certifications', item.id, 'url.href', e.target.value)} placeholder="Certificate URL" className="h-8" /></div>;
      }}
    />
  );
};

const InterestsEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { interests } = resume.sections;
  return (
    <SectionEditor section="interests" title="Interests" items={interests.items as { id: string }[]} defaultItem={{ name: '' }}
      renderItem={(item) => {
        const i = interests.items.find(x => x.id === item.id) as Interest | undefined;
        if (!i) return null;
        return <Input value={i.name} onChange={(e) => updateItem('interests', item.id, 'name', e.target.value)} placeholder="Interest" className="h-8" />;
      }}
    />
  );
};

const ProjectsEditor: React.FC = () => {
  const { resume, updateItem } = useResume();
  const { projects } = resume.sections;
  return (
    <SectionEditor section="projects" title="Projects" items={projects.items as { id: string }[]} defaultItem={{ name: '', description: '', url: { label: '', href: '' } }}
      renderItem={(item) => {
        const proj = projects.items.find(x => x.id === item.id) as Project | undefined;
        if (!proj) return null;
        return <div className="space-y-2"><Input value={proj.name} onChange={(e) => updateItem('projects', item.id, 'name', e.target.value)} placeholder="Project Name" className="h-8" /><Textarea value={proj.description} onChange={(e) => updateItem('projects', item.id, 'description', e.target.value)} placeholder="Description" rows={2} /><Input value={proj.url.href} onChange={(e) => updateItem('projects', item.id, 'url.href', e.target.value)} placeholder="Project URL" className="h-8" /></div>;
      }}
    />
  );
};

const SettingsPanel: React.FC = () => {
  const { resume, setValue } = useResume();
  const { metadata } = resume;
  const templates = [{ id: 'onyx', name: 'Onyx' }, { id: 'pikachu', name: 'Pikachu' }, { id: 'chikorita', name: 'Chikorita' }, { id: 'leafish', name: 'Leafish' }, { id: 'glalie', name: 'Glalie' }];
  const fonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
  const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Monitor size={18} /><h3 className="font-semibold">Template</h3></div>
      <div className="flex flex-wrap gap-2">{templates.map((t) => <button key={t.id} onClick={() => setValue('metadata.template', t.id)} className={`px-3 py-2 border rounded text-xs whitespace-nowrap ${metadata.template === t.id ? 'border-primary bg-primary/10' : ''}`}>{t.name}</button>)}</div>
      <Separator />
      <div className="flex items-center gap-2"><Palette size={18} /><h3 className="font-semibold">Colors</h3></div>
      <div className="flex flex-wrap gap-2">{colors.map((c) => <button key={c} onClick={() => setValue('metadata.theme.primary', c)} className={`w-8 h-8 rounded-full border-2 ${metadata.theme.primary === c ? 'border-foreground' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
      <Separator />
      <div className="flex items-center gap-2"><Type size={18} /><h3 className="font-semibold">Typography</h3></div>
      <div className="space-y-3">
        <div><Label className="text-xs">Font</Label><select value={metadata.typography.font.family} onChange={(e) => setValue('metadata.typography.font.family', e.target.value)} className="w-full h-8 px-2 rounded-md border bg-background text-sm">{fonts.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
        <div><Label className="text-xs">Size: {metadata.typography.fontSize}px</Label><input type="range" min="8" max="14" value={metadata.typography.fontSize} onChange={(e) => setValue('metadata.typography.fontSize', parseInt(e.target.value))} className="w-full" /></div>
        <div><Label className="text-xs">Line Height: {metadata.typography.lineHeight}</Label><input type="range" min="1" max="2" step="0.1" value={metadata.typography.lineHeight} onChange={(e) => setValue('metadata.typography.lineHeight', parseFloat(e.target.value))} className="w-full" /></div>
      </div>
      <Separator />
      <div className="flex items-center gap-2"><Layout size={18} /><h3 className="font-semibold">Page</h3></div>
      <div><Label className="text-xs">Margin: {metadata.page.margin}px</Label><input type="range" min="20" max="60" value={metadata.page.margin} onChange={(e) => setValue('metadata.page.margin', parseInt(e.target.value))} className="w-full" /></div>
    </div>
  );
};

const ResumePreview: React.FC = () => {
  const { resume } = useResume();
  const printRef = useRef<HTMLDivElement>(null);
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

  const handleExport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const primaryColor = metadata.theme.primary;
    const fontFamily = metadata.typography.font.family;
    const template = metadata.template;
    const { basics, sections } = resume;
    const tpl = getTemplateStyles(template, primaryColor);

    const renderExperience = () => {
      if (!sections.experience.items.length) return '';
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.experience.name}</div>
          ${sections.experience.items.map(exp => `
            <div style="${tpl.sectionItem}">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 10pt;">${exp.position}</div>
                  <div style="font-size: 9pt; color: #666;">${exp.company}${exp.location ? ', ' + exp.location : ''}</div>
                </div>
                <div style="font-size: 8pt; color: #999;">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</div>
              </div>
              ${exp.summary ? `<div style="font-size: 9pt; color: #666; margin-top: 4pt;">${exp.summary}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderEducation = () => {
      if (!sections.education.items.length) return '';
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.education.name}</div>
          ${sections.education.items.map(edu => `
            <div style="${tpl.sectionItem}">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 10pt;">${edu.studyType} in ${edu.area}</div>
                  <div style="font-size: 9pt; color: #666;">${edu.institution}</div>
                </div>
                <div style="font-size: 8pt; color: #999;">${edu.startDate || ''} - ${edu.current ? 'Present' : edu.endDate || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderSkills = () => {
      if (!sections.skills.items.length) return '';
      const getStars = (level: number) => '★'.repeat(level) + '☆'.repeat(5 - level);
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.skills.name}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${sections.skills.items.map(skill => `<span style="${tpl.skill}">${skill.name} ${getStars(skill.level)}</span>`).join('')}
          </div>
        </div>
      `;
    };

    const renderProjects = () => {
      if (!sections.projects.items.length) return '';
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.projects.name}</div>
          ${sections.projects.items.map(proj => `
            <div style="${tpl.sectionItem}">
              <div style="font-weight: 600; font-size: 10pt;">${proj.name}${proj.url.href ? ` <a href="${proj.url.href}" target="_blank" style="font-size:8pt;color:${primaryColor};">🔗</a>` : ''}</div>
              ${proj.description ? `<div style="font-size: 9pt; color: #666;">${proj.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderCertifications = () => {
      if (!sections.certifications.items.length) return '';
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.certifications.name}</div>
          ${sections.certifications.items.map(cert => `
            <div style="${tpl.sectionItem}">
              <div style="display: flex; justify-content: space-between;">
                <div style="font-weight: 600; font-size: 10pt;">${cert.name}${cert.url?.href ? ` <a href="${cert.url.href}" target="_blank" style="font-size:8pt;color:${primaryColor};">🔗</a>` : ''}</div>
                <div style="font-size: 8pt; color: #999;">${cert.date || ''}</div>
              </div>
              <div style="font-size: 9pt; color: #666;">${cert.issuer}</div>
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderLanguages = () => {
      if (!sections.languages.items.length) return '';
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.languages.name}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${sections.languages.items.map(lang => `<span style="${tpl.skill}">${lang.name} (${lang.description})</span>`).join('')}
          </div>
        </div>
      `;
    };

    const renderInterests = () => {
      if (!sections.interests.items.length) return '';
      return `
        <div style="margin-bottom: 14pt;">
          <div style="${tpl.sectionTitle}">${sections.interests.name}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${sections.interests.items.map(i => `<span style="${tpl.skill}">${i.name}</span>`).join('')}
          </div>
        </div>
      `;
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${basics.name || 'Resume'}</title>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: '${fontFamily}', sans-serif; font-size: ${metadata.typography.fontSize}pt; line-height: ${metadata.typography.lineHeight}; color: ${metadata.theme.text}; background: white; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    @page { size: A4; margin: 0; }
  </style>
</head>
<body>
  <div style="width: 210mm; min-height: 297mm; padding: ${metadata.page.margin}px; margin: 0 auto;">
    ${(basics.name || basics.headline || basics.email) ? `
      <div style="${tpl.header}">
        ${basics.picture ? `<img src="${basics.picture}" alt="Photo" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; border: 2px solid ${primaryColor};" />` : ''}
        <div style="flex: 1;">
          ${basics.name ? `<div style="${tpl.name}">${basics.name}</div>` : ''}
          ${basics.headline ? `<div style="${tpl.headline}">${basics.headline}</div>` : ''}
          <div style="${tpl.contact} display: flex; flex-wrap: wrap; gap: 20px; font-size: 10pt;">
            ${basics.email ? `<a href="mailto:${basics.email}" style="display:flex;align-items:center;gap:3px;font-size:10pt;color:${primaryColor};text-decoration:none;">${svgToString(<IconMail />)}${basics.email}</a>` : ''}
            ${basics.phone ? `<a href="tel:${basics.phone}" style="display:flex;align-items:center;gap:3px;font-size:10pt;color:${primaryColor};text-decoration:none;">${svgToString(<IconPhone />)}${basics.phone}</a>` : ''}
            ${basics.location ? `<span style="display:flex;align-items:center;gap:3px;font-size:10pt;color:${primaryColor};">${svgToString(<IconMapPin />)}${basics.location}</span>` : ''}
            ${basics.url.href ? `<a href="${basics.url.href}" target="_blank" style="display:flex;align-items:center;gap:3px;font-size:10pt;color:${primaryColor};text-decoration:none;">${svgToString(<IconGlobe />)}${basics.url.href}</a>` : ''}
          </div>
        </div>
      </div>
    ` : ''}
    ${sections.profiles.items.length ? `
      <div style="margin-bottom: 14pt; ${tpl.firstSectionPadding}">
        <div style="${tpl.sectionTitle}">${sections.profiles.name}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${sections.profiles.items.map(profile => `<a href="${profile.url.href}" target="_blank" style="font-size: 9pt; color: ${primaryColor};">${profile.network}</a>`).join('')}
        </div>
      </div>
    ` : ''}
    ${sections.summary.content ? `
      <div style="margin-bottom: 14pt; ${sections.profiles.items.length ? '' : tpl.firstSectionPadding}">
        <div style="${tpl.sectionTitle}">${sections.summary.name}</div>
        <div style="font-size: 9pt; color: #666;">${sections.summary.content}</div>
      </div>
    ` : ''}
    ${renderExperience()}
    ${renderEducation()}
    ${renderSkills()}
    ${renderProjects()}
    ${renderCertifications()}
    ${renderLanguages()}
    ${renderInterests()}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b bg-background flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-sm">Preview</h3>
        <Button size="sm" onClick={handleExport}><Download size={14} className="mr-1" /> Download PDF</Button>
      </div>
      <div className="flex-1 overflow-auto p-4 pb-8 bg-gray-100">
        <div ref={printRef} className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: metadata.typography.font.family, fontSize: `${metadata.typography.fontSize}pt`, lineHeight: metadata.typography.lineHeight, color: metadata.theme.text, padding: `${metadata.page.margin}px` }}>
          {(basics.name || basics.headline || basics.email) && (
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', ...headerStyle }}>
              {basics.picture && <img src={basics.picture} alt="Photo" className="w-16 rounded-lg object-cover border-2" style={{ borderColor: primaryColor, alignSelf: 'center' }} />}
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
          {sections.profiles.items.length > 0 && <div className="mb-4" style={getFirstSectionStyle()}><div style={getSectionTitleStyle()}>{sections.profiles.name}</div><div className="flex flex-wrap gap-2">{sections.profiles.items.map((profile: Profile) => <a key={profile.id} href={profile.url.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: primaryColor, textDecoration: 'none' }}>{profile.network}</a>)}</div></div>}
          {sections.summary.content && <div className="mb-4" style={hasFirstSection ? {} : getFirstSectionStyle()}><div style={getSectionTitleStyle()}>{sections.summary.name}</div><div className="text-sm text-gray-600">{sections.summary.content}</div></div>}
          {sections.experience.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.experience.name}</div>{sections.experience.items.map(exp => <div key={exp.id} className="mb-3"><div className="flex justify-between"><div><div className="font-semibold text-sm">{exp.position}</div><div className="text-xs text-gray-500">{exp.company}{exp.location && `, ${exp.location}`}</div></div><div className="text-xs text-gray-400">{exp.startDate || ''} - {exp.current ? 'Present' : exp.endDate || ''}</div></div>{exp.summary && <div className="text-xs text-gray-600 mt-1">{exp.summary}</div>}</div>)}</div>}
          {sections.education.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.education.name}</div>{sections.education.items.map(edu => <div key={edu.id} className="mb-2"><div className="flex justify-between"><div><div className="font-semibold text-sm">{edu.studyType} in {edu.area}</div><div className="text-xs text-gray-500">{edu.institution}</div></div><div className="text-xs text-gray-400">{edu.startDate || ''} - {edu.current ? 'Present' : edu.endDate || ''}</div></div></div>)}</div>}
          {sections.skills.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.skills.name}</div><div className="flex flex-wrap gap-1">{sections.skills.items.map(skill => <span key={skill.id} style={getSkillStyle()}>{skill.name} {'★'.repeat(skill.level)}{'☆'.repeat(5-skill.level)}</span>)}</div></div>}
          {sections.projects.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.projects.name}</div>{sections.projects.items.map(proj => <div key={proj.id} className="mb-2"><div className="font-semibold text-sm">{proj.name}{proj.url.href && <a href={proj.url.href} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-primary">🔗</a>}</div>{proj.description && <div className="text-xs text-gray-600">{proj.description}</div>}</div>)}</div>}
          {sections.certifications.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.certifications.name}</div>{sections.certifications.items.map(cert => <div key={cert.id} className="mb-2"><div className="flex justify-between"><div className="font-semibold text-sm">{cert.name}{cert.url.href && <a href={cert.url.href} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-primary">🔗</a>}</div><div className="text-xs text-gray-400">{cert.date || ''}</div></div><div className="text-xs text-gray-500">{cert.issuer}</div></div>)}</div>}
          {sections.languages.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.languages.name}</div><div className="flex flex-wrap gap-1">{sections.languages.items.map(lang => <span key={lang.id} style={getSkillStyle()}>{lang.name} ({lang.description})</span>)}</div></div>}
          {sections.interests.items.length > 0 && <div className="mb-4"><div style={getSectionTitleStyle()}>{sections.interests.name}</div><div className="flex flex-wrap gap-1">{sections.interests.items.map(i => <span key={i.id} style={getSkillStyle()}>{i.name}</span>)}</div></div>}
          {!basics.name && sections.experience.items.length === 0 && sections.education.items.length === 0 && sections.skills.items.length === 0 && <div className="text-center text-gray-400 py-20">Start filling in your information to see the preview</div>}
        </div>
      </div>
    </div>
  );
};

const ResumeCVBuilderPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('basics');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  useEffect(() => { document.title = `Resume/CV Builder ✦ ${siteConfig.name}`; }, []);

  const renderEditor = () => {
    if (activeSection === 'settings') return <SettingsPanel />;
    switch (activeSection) {
      case 'basics': return <BasicsEditor />;
      case 'summary': return <SummaryEditor />;
      case 'profiles': return <ProfilesEditor />;
      case 'experience': return <ExperienceEditor />;
      case 'education': return <EducationEditor />;
      case 'skills': return <SkillsEditor />;
      case 'languages': return <LanguagesEditor />;
      case 'certifications': return <CertificationsEditor />;
      case 'interests': return <InterestsEditor />;
      case 'projects': return <ProjectsEditor />;
      default: return <BasicsEditor />;
    }
  };

  return (
    <ResumeProvider>
      <div className="h-screen flex flex-col pb-8">
        <div className="p-4 pb-2">
          <div className="max-w-7xl mx-auto">
            <AlertBox />
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <div className="max-w-7xl mx-auto h-full">
            <div className="h-full flex flex-col lg:flex-row">
              <div className="lg:hidden flex border-b">
                <button onClick={() => setMobileView('editor')} className={`flex-1 py-2 text-sm font-medium ${mobileView === 'editor' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}><Settings size={14} className="inline mr-1" /> Editor</button>
                <button onClick={() => setMobileView('preview')} className={`flex-1 py-2 text-sm font-medium ${mobileView === 'preview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}><Eye size={14} className="inline mr-1" /> Preview</button>
              </div>
              <div className="lg:hidden flex-1 overflow-auto">
                {mobileView === 'editor' ? (
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {sectionList.map(section => {
                        const Icon = section.icon;
                        return <button key={section.id} onClick={() => setActiveSection(section.id)} className={`px-2 py-1.5 text-xs rounded ${activeSection === section.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Icon size={12} className="inline mr-1" />{section.name}</button>;
                      })}
                    </div>
                    <Card><CardContent className="p-4">{renderEditor()}</CardContent></Card>
                  </div>
                ) : <ResumePreview />}
              </div>
              <div className="hidden lg:flex flex-1 min-h-0">
                <div className="w-40 border-r  overflow-y-auto shrink-0">
                  <div className="p-2">
                    {sectionList.map(section => {
                      const Icon = section.icon;
                      return <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 ${activeSection === section.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Icon size={16} /><span className="truncate">{section.name}</span></button>;
                    })}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4"><Card><CardContent className="p-4">{renderEditor()}</CardContent></Card></div>
                <div className="border-l shrink-0"><ResumePreview /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResumeProvider>
  );
};

export default ResumeCVBuilderPage;
