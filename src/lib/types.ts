export interface Project {
  name: string;
  slug: string;
  description: string;
  url: string;
  language: string;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  pushedAt: string;
  createdAt: string;
  featured: boolean;
  category: 'work' | 'personal' | 'experiment';
  displayName: string;
  org?: string;
  year?: string;
  metrics?: { label: string; value: string }[];
  longDescription?: string;
  highlights?: string[];
  order?: number;
}

export interface ChangelogEntry {
  id: string;
  type: 'push' | 'create' | 'release' | 'fork' | 'other';
  repo: string;
  repoSlug: string;
  repoUrl: string;
  message: string;
  timestamp: string;
  commits?: { sha: string; message: string; url: string }[];
  language?: string;
}

export interface Stats {
  totalRepos: number;
  totalStars: number;
  topLanguages: { name: string; percentage: number }[];
  lastPushRepo: string;
  lastPushTime: string;
  commitsThisMonth: number;
  activeReposThisMonth: number;
}

export interface ProjectOverride {
  featured?: boolean;
  category?: 'work' | 'personal' | 'experiment';
  displayName?: string;
  org?: string;
  year?: string;
  longDescription?: string;
  highlights?: string[];
  metrics?: { label: string; value: string }[];
  order?: number;
}
