import { ResourceType, SourceType } from '@/types/database';
import { normalizeUrl } from '../url-helper';

export interface ExtractedLink {
  rawUrl: string;
  normalizedUrl: string;
  domain: string;
  title: string;
  contextDescription: string;
  resourceType: ResourceType;
  sourceType: SourceType;
  suggestedTags: string[];
  suggestedUseCases: string[];
}

/**
 * Intelligent categorization of links extracted from research documents,
 * bookmarks, notes, drive links, and tool lists.
 */
export function categorizeExtractedUrl(
  url: string,
  domain: string,
  surroundingContext: string
): {
  resourceType: ResourceType;
  sourceType: SourceType;
  tags: string[];
  useCases: string[];
} {
  const lowerDomain = domain.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const lowerCtx = surroundingContext.toLowerCase();

  const tags: string[] = [];
  const useCases: string[] = ['Research'];

  // 1. Google Drive & Cloud Document links
  if (
    lowerDomain === 'drive.google.com' ||
    lowerDomain === 'docs.google.com' ||
    lowerDomain === 'dropbox.com' ||
    lowerDomain === 'box.com' ||
    lowerDomain === 'notion.so' ||
    lowerDomain === 'notion.site'
  ) {
    tags.push('Document', 'Cloud Storage');
    useCases.push('Learn', 'Reference', 'Research');
    if (lowerUrl.includes('spreadsheets') || lowerUrl.includes('sheet')) {
      tags.push('Spreadsheet', 'Data');
      useCases.push('Productivity');
    } else if (lowerUrl.includes('presentation') || lowerUrl.includes('slides')) {
      tags.push('Presentation', 'Pitch');
      useCases.push('Present');
    } else if (lowerUrl.includes('document') || lowerUrl.includes('docs')) {
      tags.push('Notes', 'Doc');
      useCases.push('Documentation');
    } else if (lowerUrl.includes('drive')) {
      tags.push('Drive', 'Files');
    }
    return {
      resourceType: 'document',
      sourceType: 'document',
      tags,
      useCases,
    };
  }

  // 2. Code Repositories (GitHub, GitLab, Bitbucket)
  if (lowerDomain === 'github.com' || lowerDomain === 'gitlab.com' || lowerDomain === 'bitbucket.org') {
    tags.push('GitHub', 'Code', 'Developer Tools');
    useCases.push('Code', 'Build', 'Developer');
    if (lowerCtx.includes('agent') || lowerUrl.includes('agent')) tags.push('Agents');
    if (lowerCtx.includes('ai') || lowerUrl.includes('ai')) {
      tags.push('AI');
      useCases.push('AI');
    }
    return {
      resourceType: 'github',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 3. AI Tools & Platforms (Cline, Kilo, OpenAI, Anthropic, v0, Cursor, Triplo3D, etc.)
  const isAiIndicator =
    lowerDomain.includes('ai') ||
    lowerDomain.includes('bot') ||
    lowerDomain === 'cline.bot' ||
    lowerDomain.includes('kilo') ||
    lowerUrl.includes('gpt') ||
    lowerUrl.includes('claude') ||
    lowerUrl.includes('gemini') ||
    lowerUrl.includes('nemotron') ||
    lowerDomain === 'openai.com' ||
    lowerDomain === 'anthropic.com' ||
    lowerDomain === 'nvidia.com' ||
    lowerDomain === 'huggingface.co' ||
    lowerDomain === 'cohere.com' ||
    lowerDomain === 'midjourney.com' ||
    lowerDomain === 'replicate.com' ||
    lowerDomain === 'v0.dev' ||
    lowerDomain === 'cursor.com' ||
    lowerDomain === 'cursor.sh' ||
    lowerDomain.includes('triplo') ||
    lowerCtx.includes('ai tool') ||
    lowerCtx.includes('artificial intelligence') ||
    lowerCtx.includes('llm') ||
    lowerCtx.includes('coding agent') ||
    lowerCtx.includes('model');

  if (isAiIndicator) {
    tags.push('AI', 'Machine Learning');
    useCases.push('AI', 'Build', 'Automate', 'Productivity');
    if (lowerCtx.includes('coding') || lowerCtx.includes('dev') || lowerDomain.includes('cline') || lowerDomain.includes('cursor')) {
      tags.push('Coding', 'Developer Tools');
      useCases.push('Code', 'Developer');
    }
    return {
      resourceType: 'ai_tool',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 4. Design & UI Resources (Figma, Mobbin, DesignArena, Dribbble, Behance, Coolors, etc.)
  const isDesignIndicator =
    lowerDomain.includes('mobbin') ||
    lowerDomain.includes('designarena') ||
    lowerDomain === 'figma.com' ||
    lowerDomain.includes('dribbble.com') ||
    lowerDomain.includes('behance.net') ||
    lowerDomain.includes('coolors.co') ||
    lowerDomain.includes('font') ||
    lowerCtx.includes('design') ||
    lowerCtx.includes('ui') ||
    lowerCtx.includes('ux') ||
    lowerCtx.includes('inspiration');

  if (isDesignIndicator) {
    tags.push('Design', 'UI/UX', 'Inspiration');
    useCases.push('Design', 'Research', 'Reference');
    return {
      resourceType: 'web_app',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 5. Developer Tools & Infrastructure (Ninite, Vercel, Supabase, Docker, Postman, Railway, etc.)
  const isDevTool =
    lowerDomain.includes('ninite') ||
    lowerDomain.includes('vercel') ||
    lowerDomain.includes('supabase') ||
    lowerDomain.includes('firebase') ||
    lowerDomain.includes('cloudflare') ||
    lowerDomain.includes('railway') ||
    lowerDomain.includes('render.com') ||
    lowerDomain.includes('npm') ||
    lowerDomain.includes('pypi') ||
    lowerDomain.includes('docker') ||
    lowerDomain.includes('postman') ||
    lowerDomain.includes('stackblitz') ||
    lowerDomain.includes('codesandbox') ||
    lowerCtx.includes('developer tool') ||
    lowerCtx.includes('installer') ||
    lowerCtx.includes('sdk') ||
    lowerCtx.includes('api') ||
    lowerCtx.includes('database');

  if (isDevTool) {
    tags.push('Developer Tools', 'Infrastructure');
    useCases.push('Developer', 'Build', 'Deploy', 'Code');
    return {
      resourceType: 'developer_tool',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 6. Documentation & Official Docs
  const isDoc =
    lowerDomain.startsWith('docs.') ||
    lowerUrl.includes('/docs') ||
    lowerUrl.includes('/documentation') ||
    lowerUrl.includes('/reference') ||
    lowerUrl.includes('/manual');

  if (isDoc) {
    tags.push('Documentation', 'API Reference');
    useCases.push('Documentation', 'Reference', 'Learn');
    return {
      resourceType: 'article',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 7. Tutorials & Learning (Skilljar, Coursera, FirstPrompt, Tutorials, Guides, etc.)
  const isLearning =
    lowerDomain.includes('skilljar') ||
    lowerDomain.includes('firstprompt') ||
    lowerDomain.includes('coursera') ||
    lowerDomain.includes('udemy') ||
    lowerDomain.includes('egghead') ||
    lowerUrl.includes('/tutorial') ||
    lowerUrl.includes('/learn') ||
    lowerUrl.includes('/course') ||
    lowerUrl.includes('/guide') ||
    lowerCtx.includes('tutorial') ||
    lowerCtx.includes('course') ||
    lowerCtx.includes('learning');

  if (isLearning) {
    tags.push('Learning', 'Tutorial', 'Education');
    useCases.push('Learn', 'Research', 'Reference');
    return {
      resourceType: 'tutorial',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 8. PDF & Academic Papers
  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('/pdf/') || lowerDomain === 'arxiv.org' || lowerDomain.includes('sciencedirect')) {
    tags.push('Research', 'Paper', 'Academic');
    useCases.push('Learn', 'Research', 'Reference');
    return {
      resourceType: 'pdf',
      sourceType: 'document',
      tags,
      useCases,
    };
  }

  // 9. Web Applications & Productivity Tools (Moda, Linear, Notion, Slack, Canva, etc.)
  const isAppIndicator =
    lowerDomain.includes('app.') ||
    lowerDomain.endsWith('.app') ||
    lowerDomain.includes('moda.app') ||
    lowerDomain === 'linear.app' ||
    lowerDomain === 'canva.com' ||
    lowerDomain === 'miro.com' ||
    lowerDomain === 'airtable.com' ||
    lowerDomain === 'slack.com' ||
    lowerDomain === 'discord.com' ||
    lowerCtx.includes('app') ||
    lowerCtx.includes('application') ||
    lowerCtx.includes('software');

  if (isAppIndicator) {
    tags.push('App', 'Productivity');
    useCases.push('Productivity', 'Build', 'Freelancing');
    return {
      resourceType: 'web_app',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 10. Video content
  if (lowerDomain === 'youtube.com' || lowerDomain === 'youtu.be' || lowerDomain === 'vimeo.com') {
    tags.push('Video', 'Tutorial');
    useCases.push('Learn', 'Reference');
    return {
      resourceType: 'video',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // 11. Social Posts & Community
  if (lowerDomain === 'x.com' || lowerDomain === 'twitter.com' || lowerDomain === 'linkedin.com') {
    tags.push('Social', 'Industry');
    useCases.push('Research', 'Marketing');
    return {
      resourceType: 'social_post',
      sourceType: 'social',
      tags,
      useCases,
    };
  }

  // 12. Articles & Blogs
  if (
    lowerDomain === 'medium.com' ||
    lowerDomain === 'substack.com' ||
    lowerDomain === 'dev.to' ||
    lowerUrl.includes('/blog/') ||
    lowerUrl.includes('/article/')
  ) {
    tags.push('Article', 'Reading');
    useCases.push('Learn', 'Research', 'Reference');
    return {
      resourceType: 'article',
      sourceType: 'web',
      tags,
      useCases,
    };
  }

  // Fallback to Website
  tags.push('Web', 'Resource');
  useCases.push('Research', 'Reference');
  return {
    resourceType: 'website',
    sourceType: 'web',
    tags,
    useCases,
  };
}

/**
 * Scan arbitrary document text (e.g. from an uploaded txt, md, or pdf file)
 * and extract embedded URLs with their surrounding labels/headings.
 */
export function extractLinksFromText(rawText: string): ExtractedLink[] {
  if (!rawText || rawText.trim().length === 0) return [];

  // Match standard HTTP/HTTPS URLs
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`\[\]()]+[^\s<>"'{}|\\^`\[\]().,;:?!])/gi;
  // Match Markdown links: [Label](url)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;

  const lines = rawText.split('\n');
  const seenUrls = new Set<string>();
  const results: ExtractedLink[] = [];

  // 1. First pass: extract Markdown links with exact label
  let mdMatch;
  while ((mdMatch = mdLinkRegex.exec(rawText)) !== null) {
    const rawLabel = mdMatch[1].trim();
    const rawUrl = mdMatch[2].trim();
    const { url, domain, isValid } = normalizeUrl(rawUrl);

    if (isValid && !seenUrls.has(url)) {
      seenUrls.add(url);
      const cat = categorizeExtractedUrl(url, domain, rawLabel);
      results.push({
        rawUrl,
        normalizedUrl: url,
        domain,
        title: rawLabel || cleanDomainTitle(domain),
        contextDescription: `Extracted from document note: "${rawLabel}"`,
        resourceType: cat.resourceType,
        sourceType: cat.sourceType,
        suggestedTags: cat.tags,
        suggestedUseCases: cat.useCases,
      });
    }
  }

  // 2. Second pass: scan line-by-line for plaintext URLs
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let match;
    while ((match = urlRegex.exec(line)) !== null) {
      const candidateUrl = match[1];
      const { url, domain, isValid } = normalizeUrl(candidateUrl);

      if (!isValid || seenUrls.has(url)) continue;
      seenUrls.add(url);

      // Context gathering: look at current line without URL, or preceding line
      const lineWithoutUrl = line.replace(candidateUrl, '').replace(/[-*•:]+/g, ' ').trim();
      const prevLine = i > 0 ? lines[i - 1].replace(/[-*•:]+/g, ' ').trim() : '';
      const context = lineWithoutUrl || prevLine || '';

      // Derive title from context line or domain
      let rawTitleCandidate = '';
      if (lineWithoutUrl && lineWithoutUrl.length >= 2 && lineWithoutUrl.length <= 80) {
        rawTitleCandidate = lineWithoutUrl;
      } else if (prevLine && prevLine.length >= 2 && prevLine.length <= 80 && !prevLine.includes('http')) {
        rawTitleCandidate = prevLine;
      }

      // Strip leading list numbering or bullets (e.g. "1. ", "• ", "- ")
      let title = rawTitleCandidate
        .replace(/^[\d]+[\.\)\-\:]\s*/, '')
        .replace(/^[-*•>#]+\s*/, '')
        .trim();

      if (!title || title.length < 2) {
        title = cleanDomainTitle(domain, url);
      }

      const cat = categorizeExtractedUrl(url, domain, `${line} ${prevLine}`);

      results.push({
        rawUrl: candidateUrl,
        normalizedUrl: url,
        domain,
        title,
        contextDescription: context ? `Document context: "${context}"` : `Indexed link from ${domain}`,
        resourceType: cat.resourceType,
        sourceType: cat.sourceType,
        suggestedTags: cat.tags,
        suggestedUseCases: cat.useCases,
      });
    }
  }

  return results;
}

function cleanDomainTitle(domain: string, fullUrl?: string): string {
  // If drive or docs, try to get document type
  if (domain === 'drive.google.com') return 'Google Drive Folder / Resource';
  if (domain === 'docs.google.com') return 'Google Docs Resource';

  // If github.com/user/repo, format repo name
  if (domain === 'github.com' && fullUrl) {
    try {
      const parts = new URL(fullUrl).pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
    } catch {}
  }

  // Standard domain cleanup (e.g. app.slack.com -> Slack App)
  const base = domain.replace(/\.(com|org|io|ai|net|dev|app|co)$/i, '');
  const clean = base.replace(/^(app|web|www)\./i, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
