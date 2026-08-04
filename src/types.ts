export type Language = 'EN' | 'ES' | 'PT';
export type Category = 'Workforce Daily' | 'TechJobs' | 'AI Impact' | 'Recruitment' | 'HR';

export interface BriefingContent {
  title: string;
  sections: {
    heading: string;
    paragraphs: string[];
    soWhat: string;
  }[];
}

export interface Briefing {
  id: string;
  date: string;
  region: string;
  category: string;
  isPremium: boolean;
  content: {
    EN: BriefingContent;
    ES: BriefingContent;
    PT: BriefingContent;
  };
}

export interface IntelligenceBrief {
  id: string;
  category: Category;
  country_code: 'BR' | 'MX' | 'CO' | 'AR' | 'CL';
  is_hiring_signal: boolean;
  subject_line: string;
  free_teaser: string;
  paid_analysis: string;
  slack_hook: string;
  target_persona: 'Hiring Manager' | 'Candidate' | 'Analyst';
  createdAt?: any;
}
