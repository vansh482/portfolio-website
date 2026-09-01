const GITHUB_USER = 'vansh482';
const API_BASE = 'https://api.github.com';

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'vansh-portfolio-builder',
  };
  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      console.warn(`GitHub API ${res.status} for ${path}`);
      return [] as unknown as T;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.warn(`GitHub API error for ${path}:`, err);
    return [] as unknown as T;
  }
}

interface GHRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  pushed_at: string;
  created_at: string;
  fork: boolean;
}

interface GHEvent {
  id: string;
  type: string;
  repo: { name: string; url: string };
  payload: {
    commits?: { sha: string; message: string; url: string }[];
    ref_type?: string;
    ref?: string;
    release?: { tag_name: string; name: string; body: string };
  };
  created_at: string;
}

export async function fetchRepos(): Promise<GHRepo[]> {
  const repos = await apiFetch<GHRepo[]>(
    `/users/${GITHUB_USER}/repos?sort=pushed&per_page=100&type=owner`
  );
  return Array.isArray(repos) ? repos.filter((r) => !r.fork) : [];
}

export async function fetchEvents(): Promise<GHEvent[]> {
  const events = await apiFetch<GHEvent[]>(
    `/users/${GITHUB_USER}/events?per_page=100`
  );
  return Array.isArray(events) ? events : [];
}

export async function fetchLanguages(repo: string): Promise<Record<string, number>> {
  const langs = await apiFetch<Record<string, number>>(
    `/repos/${GITHUB_USER}/${repo}/languages`
  );
  return langs && typeof langs === 'object' ? langs : {};
}

export { type GHRepo, type GHEvent };
