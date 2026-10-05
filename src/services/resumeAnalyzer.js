/**
 * Placeholder for the future AI Resume Analyzer.
 *
 * Planned flow: React -> POST /api/resumes/:id/analyze -> Express -> LLM -> MongoDB.
 * The Resumes page already renders `resume.analysis` if present:
 * { atsScore, keywordMatch, strengths[], gaps[], suggestions[] }.
 */
export async function analyzeResume(resume, { jobDescription = '' } = {}) {
  return { status: 'coming_soon', resumeId: resume.id, jobDescription, atsScore: null, keywordMatch: null, strengths: [], gaps: [], suggestions: [] }
}
