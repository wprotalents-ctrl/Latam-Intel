export type Language = 'EN' | 'ES' | 'PT';

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
  content: {
    EN: BriefingContent;
    ES: BriefingContent;
    PT: BriefingContent;
  };
}
