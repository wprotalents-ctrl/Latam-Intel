export type Language = 'EN' | 'ES' | 'PT';
export type Category = 'JOBS' | 'AI_IMPACT' | 'RECRUITMENT' | 'HR' | 'TECH';

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
  category: Category;
  isPremium: boolean;
  content: {
    EN: BriefingContent;
    ES: BriefingContent;
    PT: BriefingContent;
  };
}
