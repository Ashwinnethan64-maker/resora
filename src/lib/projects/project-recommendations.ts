import { ResourceModel, ProjectModel, ProjectRecommendationModel } from '@/types/database';

/**
 * Deterministic, explainable recommendation engine for Project Workspaces.
 * Analyzes the user's existing global library against project goals, technologies,
 * constraints, and topics, generating plain-English "Why this matches" reasoning.
 */
export function calculateProjectRecommendations(
  project: ProjectModel,
  allResources: ResourceModel[],
  dismissedIds: string[] = []
): ProjectRecommendationModel[] {
  const currentResourceIds = new Set(project.resource_ids || []);
  const dismissedSet = new Set(dismissedIds);

  // Candidates: resources not already in project and not dismissed
  const candidates = allResources.filter(
    (r) => !r.is_archived && !currentResourceIds.has(r.id) && !dismissedSet.has(r.id)
  );

  const rawKeywords: (string | undefined)[] = [
    ...(project.technologies || []),
    ...(project.keywords || []),
    project.name,
    project.project_type,
    ...(project.objective ? project.objective.split(/\s+/) : []),
  ];

  const projectKeywords: string[] = rawKeywords
    .filter((k): k is string => typeof k === 'string' && k.trim().length > 2)
    .map((k) => k.toLowerCase().trim());

  const scoredResults: ProjectRecommendationModel[] = [];

  for (const resource of candidates) {
    let score = 0;
    const reasons: string[] = [];

    const resTitle = resource.title.toLowerCase();
    const resDesc = (resource.description || '').toLowerCase();
    const resContent = (resource.content || '').toLowerCase();
    const resTags = (resource.tags || []).map((t) => t.toLowerCase());
    const resUseCases = (resource.use_cases || []).map((u) => u.toLowerCase());

    // 1. Direct Technology Match
    if (project.technologies && project.technologies.length > 0) {
      for (const tech of project.technologies) {
        const t = tech.toLowerCase();
        if (
          resTitle.includes(t) ||
          resTags.includes(t) ||
          resDesc.includes(t)
        ) {
          score += 15;
          reasons.push(`Matches your planned technology: "${tech}".`);
          break;
        }
      }
    }

    // 2. Project Type & Use Case Alignment
    if (project.project_type === 'hackathon') {
      if (resTags.includes('hackathon') || resUseCases.includes('hackathon') || resTitle.includes('hackathon')) {
        score += 12;
        reasons.push('Specifically designed for hackathons and rapid prototyping.');
      }
      if (resource.resource_type === 'developer_tool' || resource.resource_type === 'ai_tool') {
        score += 6;
        reasons.push('High-velocity developer tool ideal for quick sprint iterations.');
      }
    } else if (project.project_type === 'research') {
      if (resource.resource_type === 'pdf' || resTags.includes('research') || resTags.includes('paper')) {
        score += 14;
        reasons.push('Primary academic whitepaper / PDF relevant to research review.');
      }
    } else if (project.project_type === 'software_project' || project.project_type === 'startup') {
      if (
        resTags.some((t) => ['backend', 'database', 'auth', 'api', 'architecture', 'saas'].includes(t)) ||
        resUseCases.includes('build')
      ) {
        score += 10;
        reasons.push('Provides production architecture or backend infrastructure.');
      }
    }

    // 3. Keyword / Topic Overlap with Project Objective
    let matchedKeywordsCount = 0;
    for (const kw of projectKeywords) {
      if (kw.length < 3) continue;
      if (resTitle.includes(kw) || resTags.includes(kw) || resDesc.includes(kw)) {
        matchedKeywordsCount++;
        score += 4;
      }
    }

    if (matchedKeywordsCount >= 2) {
      reasons.push(`Shares ${matchedKeywordsCount} key thematic topics with your project objective.`);
    }

    // 4. Resource Quality Signals
    if (resource.is_favorite) {
      score += 5;
      reasons.push('Marked as a personal favorite in your library.');
    }

    if (resource.page_count && resource.page_count > 0) {
      score += 4;
      reasons.push(`Includes ${resource.page_count} pages of indexed reference text.`);
    }

    // Keep only if there is meaningful relevance
    if (score >= 10 && reasons.length > 0) {
      let relevance: 'Highly relevant' | 'Relevant' | 'Possibly useful' = 'Possibly useful';
      if (score >= 25) {
        relevance = 'Highly relevant';
      } else if (score >= 15) {
        relevance = 'Relevant';
      }

      scoredResults.push({
        resource,
        relevance,
        score,
        reasons: reasons.slice(0, 3), // Top 3 most pertinent explanations
      });
    }
  }

  // Sort descending by calculated score
  return scoredResults.sort((a, b) => b.score - a.score);
}
