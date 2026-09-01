import { parse } from 'yaml';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Project, ChangelogEntry, Stats, ProjectOverride } from './types';
import { fetchRepos, fetchEvents, fetchLanguages, type GHRepo, type GHEvent } from './github';
import { fallbackProjects, fallbackChangelog, fallbackStats } from '../data/fallback';

function loadOverrides(): Record<string, ProjectOverride> {
  try {
    const yamlPath = resolve(process.cwd(), 'src/data/project-overrides.yaml');
    const raw = readFileSync(yamlPath, 'utf-8');
    return (parse(raw) as Record<string, ProjectOverride>) || {};
  } catch {
    console.warn('Could not load project overrides');
    return {};
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const HIDDEN_REPOS = new Set([
  'Java',
  'Future_Sales_Prediction',
  'Sales-Prediction',
  'Road-Accident-Analysis',
  'Amul_Parlour-main',
]);

export async function getProjects(): Promise<Project[]> {
  const allRepos = await fetchRepos();

  if (allRepos.length === 0) {
    console.warn('GitHub API returned no repos — using fallback data');
    return fallbackProjects.filter(p => !HIDDEN_REPOS.has(p.name));
  }

  const repos = allRepos.filter(r => !HIDDEN_REPOS.has(r.name));
  const overrides = loadOverrides();

  const projects: Project[] = await Promise.all(
    repos.map(async (repo: GHRepo): Promise<Project> => {
      const override = overrides[repo.name] || {};
      const languages = await fetchLanguages(repo.name);

      return {
        name: repo.name,
        slug: slugify(repo.name),
        description: repo.description || '',
        url: repo.html_url,
        language: repo.language || '',
        languages,
        topics: repo.topics || [],
        stars: repo.stargazers_count,
        pushedAt: repo.pushed_at,
        createdAt: repo.created_at,
        featured: override.featured ?? false,
        category: override.category ?? 'personal',
        displayName: override.displayName ?? repo.name,
        org: override.org,
        year: override.year ?? new Date(repo.created_at).getFullYear().toString(),
        metrics: override.metrics,
        longDescription: override.longDescription,
        order: override.order ?? 999,
      };
    })
  );

  return projects.sort((a, b) => a.order! - b.order!);
}

export async function getChangelog(): Promise<ChangelogEntry[]> {
  const events = await fetchEvents();

  if (events.length === 0) {
    console.warn('GitHub API returned no events — using fallback data');
    return fallbackChangelog;
  }

  return events
    .filter((e: GHEvent) => {
      if (!['PushEvent', 'CreateEvent', 'ReleaseEvent'].includes(e.type)) return false;
      if (e.type === 'PushEvent' && (!e.payload.commits || e.payload.commits.length === 0)) return false;
      return true;
    })
    .map((e: GHEvent): ChangelogEntry => {
      const repoName = e.repo.name.replace(`vansh482/`, '');
      let type: ChangelogEntry['type'] = 'other';
      let message = '';
      let commits: ChangelogEntry['commits'] | undefined;

      if (e.type === 'PushEvent') {
        type = 'push';
        const pushCommits = e.payload.commits || [];
        const branch = (e.payload.ref || 'main').replace('refs/heads/', '');
        message = `${pushCommits.length} commit${pushCommits.length !== 1 ? 's' : ''} to ${branch}`;
        commits = pushCommits.map((c) => ({
          sha: c.sha.slice(0, 7),
          message: c.message.split('\n')[0],
          url: c.url,
        }));
      } else if (e.type === 'CreateEvent') {
        type = 'create';
        if (e.payload.ref_type === 'repository') {
          message = 'New repository';
        } else {
          message = `Created ${e.payload.ref_type} ${e.payload.ref || ''}`.trim();
        }
      } else if (e.type === 'ReleaseEvent') {
        type = 'release';
        message = e.payload.release?.tag_name
          ? `${e.payload.release.tag_name} — ${e.payload.release.name || ''}`
          : 'New release';
      }

      return {
        id: e.id,
        type,
        repo: repoName,
        repoSlug: slugify(repoName),
        repoUrl: `https://github.com/vansh482/${repoName}`,
        message,
        timestamp: e.created_at,
        commits,
      };
    });
}

export async function getStats(): Promise<Stats> {
  const repos = await fetchRepos();
  const events = await fetchEvents();

  if (repos.length === 0 && events.length === 0) {
    console.warn('GitHub API returned no data — using fallback stats');
    return fallbackStats;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const pushEvents = events.filter((e: GHEvent) => e.type === 'PushEvent');
  const recentPushes = pushEvents.filter(
    (e: GHEvent) => new Date(e.created_at) >= monthStart
  );

  const commitsThisMonth = recentPushes.reduce(
    (sum: number, e: GHEvent) => sum + (e.payload.commits?.length || 0),
    0
  );

  const activeRepoNames = new Set(
    recentPushes.map((e: GHEvent) => e.repo.name)
  );

  const langTotals: Record<string, number> = {};
  repos.forEach((r: GHRepo) => {
    if (r.language) {
      langTotals[r.language] = (langTotals[r.language] || 0) + 1;
    }
  });
  const totalLangCount = Object.values(langTotals).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(langTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalLangCount) * 100),
    }));

  const lastPush = pushEvents[0];
  const lastPushRepo = lastPush
    ? lastPush.repo.name.replace('vansh482/', '')
    : 'unknown';
  const lastPushTime = lastPush ? timeAgo(lastPush.created_at) : 'recently';

  return {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum: number, r: GHRepo) => sum + r.stargazers_count, 0),
    topLanguages,
    lastPushRepo,
    lastPushTime,
    commitsThisMonth,
    activeReposThisMonth: activeRepoNames.size,
  };
}

export { timeAgo, slugify };
