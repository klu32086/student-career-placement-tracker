import { toDateInput } from './utils'

export const STATUSES = ['Interested', 'Applied', 'Assessment', 'Shortlisted', 'Interview', 'Selected', 'Rejected']
export const STATUS_TONE = { Interested: 'slate', Applied: 'blue', Assessment: 'amber', Shortlisted: 'violet', Interview: 'indigo', Selected: 'green', Rejected: 'red' }
export const STATUS_COLOR = { Interested: '#94A3B8', Applied: '#38BDF8', Assessment: '#F5A524', Shortlisted: '#A78BFA', Interview: '#6366F1', Selected: '#22C55E', Rejected: '#E5604D' }
export const DSA_TOPICS = ['Arrays', 'Strings', 'Linked Lists', 'Stack & Queue', 'Trees', 'Graphs', 'Binary Search', 'Greedy', 'Dynamic Programming', 'Backtracking']
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
export const DIFF_COLOR = { Easy: '#3BAEA0', Medium: '#F5A524', Hard: '#E5604D' }
export const DIFF_TONE = { Easy: 'teal', Medium: 'amber', Hard: 'red' }
export const PLATFORMS = ['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'Other']
export const TASK_CATEGORIES = ['DSA', 'Aptitude', 'Coding', 'Projects', 'Resume', 'Job Applications', 'Interview Prep']
export const SKILL_CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Database', 'Cloud', 'AI / ML', 'Other']
export const PRIORITIES = ['High', 'Medium', 'Low']
export const PRIORITY_TONE = { High: 'red', Medium: 'amber', Low: 'slate' }
export const GOAL_STATUSES = ['Not started', 'In progress', 'On hold', 'Completed']
export const DSA_TARGET = 150
export const TOPIC_TARGET = 12

export const levelLabel = (v) => (v < 30 ? 'Beginner' : v < 60 ? 'Intermediate' : v < 85 ? 'Advanced' : 'Expert')
export const levelTone = (v) => (v < 30 ? 'slate' : v < 60 ? 'blue' : v < 85 ? 'teal' : 'green')
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)

export const isUpcoming = (i) => i.status === 'Scheduled' && new Date(i.date).getTime() >= Date.now()

export function computeMetrics(d) {
  const apps = d.applications
  const probs = d.dsaProblems
  const applied = apps.filter((a) => a.status !== 'Interested').length
  const doneTasks = d.tasks.filter((t) => t.done).length
  const p = d.profile
  const profileFields = ['name', 'college', 'degree', 'branch', 'cgpa', 'gradYear', 'github', 'linkedin', 'portfolio']
  const profilePct = profileFields.filter((k) => String(p[k] || '').trim()).length / profileFields.length
  const hasPrimary = d.resumes.some((r) => r.primary)
  const skillAvg = avg(d.skills.map((s) => s.level))

  const parts = [
    { key: 'dsa', label: 'DSA practice', weight: 0.3, value: Math.min(probs.length / DSA_TARGET, 1), hint: `${probs.length} of ${DSA_TARGET} problems` },
    { key: 'apps', label: 'Applications', weight: 0.2, value: Math.min(applied / 15, 1), hint: `${applied} of 15 sent` },
    { key: 'skills', label: 'Skills', weight: 0.2, value: skillAvg / 100, hint: `${Math.round(skillAvg)}% average proficiency` },
    { key: 'tasks', label: 'Daily habit', weight: 0.15, value: d.tasks.length ? doneTasks / d.tasks.length : 0, hint: `${doneTasks} of ${d.tasks.length} tasks done` },
    { key: 'profile', label: 'Resume & profile', weight: 0.15, value: (hasPrimary ? 0.6 : 0) + 0.4 * profilePct, hint: hasPrimary ? 'Primary resume set' : 'No primary resume' },
  ]
  const score = Math.round(100 * parts.reduce((s, x) => s + x.value * x.weight, 0))
  const weakest = [...parts].sort((a, b) => a.value - b.value)[0]

  const appsByStatus = STATUSES.map((s) => ({ status: s, count: apps.filter((a) => a.status === s).length }))
  const upcoming = d.interviews.filter(isUpcoming).sort((a, b) => new Date(a.date) - new Date(b.date))
  const byDifficulty = DIFFICULTIES.map((x) => ({ name: x, value: probs.filter((q) => q.difficulty === x).length }))
  const topics = DSA_TOPICS.map((t) => {
    const list = probs.filter((q) => q.topic === t)
    return {
      topic: t, total: list.length,
      Easy: list.filter((q) => q.difficulty === 'Easy').length,
      Medium: list.filter((q) => q.difficulty === 'Medium').length,
      Hard: list.filter((q) => q.difficulty === 'Hard').length,
      pct: Math.min(Math.round((list.length / TOPIC_TARGET) * 100), 100),
    }
  })
  const weekly = [...Array(7)].map((_, i) => {
    const x = new Date(); x.setDate(x.getDate() - (6 - i))
    const key = toDateInput(x)
    return { day: x.toLocaleDateString('en', { weekday: 'short' }), solved: probs.filter((q) => q.solvedOn === key).length }
  })
  return {
    score, parts, weakest, appsByStatus, upcoming, byDifficulty, topics, weekly,
    solved: probs.length,
    activeApps: apps.filter((a) => !['Selected', 'Rejected'].includes(a.status)).length,
    offers: apps.filter((a) => a.status === 'Selected').length,
  }
}
