// Demo data. Dates are generated relative to "today" so the demo always looks live.
const pad = (n) => String(n).padStart(2, '0')
const dateStr = (n) => {
  const x = new Date(); x.setDate(x.getDate() + n)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}
const dtStr = (n, h, m = 0) => `${dateStr(n)}T${pad(h)}:${pad(m)}`
const iso = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString()
let seq = 0
const id = (p) => `${p}_${++seq}`

const DSA = {
  Arrays: 'two-sum:E best-time-to-buy-and-sell-stock:E product-of-array-except-self:M maximum-subarray:M 3sum:M merge-intervals:M trapping-rain-water:H',
  Strings: 'valid-anagram:E group-anagrams:M longest-substring-without-repeating-characters:M longest-palindromic-substring:M minimum-window-substring:H',
  'Linked Lists': 'reverse-linked-list:E merge-two-sorted-lists:E linked-list-cycle:E reorder-list:M merge-k-sorted-lists:H',
  'Stack & Queue': 'valid-parentheses:E min-stack:M daily-temperatures:M largest-rectangle-in-histogram:H',
  Trees: 'invert-binary-tree:E maximum-depth-of-binary-tree:E binary-tree-level-order-traversal:M validate-binary-search-tree:M lowest-common-ancestor-of-a-binary-tree:M binary-tree-maximum-path-sum:H',
  Graphs: 'number-of-islands:M clone-graph:M course-schedule:M rotting-oranges:M word-ladder:H',
  'Binary Search': 'binary-search:E search-in-rotated-sorted-array:M find-minimum-in-rotated-sorted-array:M koko-eating-bananas:M median-of-two-sorted-arrays:H',
  Greedy: 'assign-cookies:E jump-game:M gas-station:M non-overlapping-intervals:M',
  'Dynamic Programming': 'climbing-stairs:E house-robber:M coin-change:M longest-increasing-subsequence:M edit-distance:H',
  Backtracking: 'subsets:M permutations:M combination-sum:M n-queens:H',
}
const DIFF = { E: 'Easy', M: 'Medium', H: 'Hard' }
const title = (slug) => slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')

function makeDsa() {
  let i = 0
  const out = []
  Object.entries(DSA).forEach(([topic, list]) => {
    list.split(' ').forEach((tok) => {
      const [slug, d] = tok.split(':')
      const other = i % 11 === 4 ? 'GeeksforGeeks' : i % 13 === 6 ? 'Codeforces' : null
      out.push({
        id: id('dsa'), topic, title: title(slug), difficulty: DIFF[d],
        platform: other || 'LeetCode', link: other ? '' : `https://leetcode.com/problems/${slug}/`,
        solvedOn: dateStr(-((i * 5) % 21)),
      })
      i++
    })
  })
  return out
}

export function makeSeed() {
  seq = 0
  return {
    profile: {
      name: 'Ananya Reddy', college: 'Andhra Institute of Engineering & Technology', degree: 'B.Tech',
      branch: 'Computer Science & Engineering', cgpa: '8.6', gradYear: '2027',
      github: 'https://github.com/ananya-reddy', linkedin: 'https://linkedin.com/in/ananya-reddy',
      portfolio: 'https://ananya.dev', skills: ['React', 'Java', 'Python', 'SQL', 'Data Structures', 'REST APIs'],
    },
    applications: [
      { id: id('app'), company: 'Microsoft', role: 'Software Engineer Intern', location: 'Hyderabad', package: '55 LPA', appliedOn: dateStr(-12), deadline: dateStr(4), link: 'https://careers.microsoft.com', notes: 'Referred by senior from alumni network.', status: 'Interview' },
      { id: id('app'), company: 'Amazon', role: 'SDE Intern', location: 'Bengaluru', package: '45 LPA', appliedOn: dateStr(-9), deadline: dateStr(2), link: 'https://amazon.jobs', notes: 'OA cleared. Prepare leadership principles.', status: 'Shortlisted' },
      { id: id('app'), company: 'Atlassian', role: 'Frontend Engineer', location: 'Remote', package: '38 LPA', appliedOn: dateStr(-6), deadline: dateStr(9), link: 'https://atlassian.com/company/careers', notes: '', status: 'Assessment' },
      { id: id('app'), company: 'Razorpay', role: 'Backend Engineer', location: 'Bengaluru', package: '28 LPA', appliedOn: dateStr(-14), deadline: dateStr(-2), link: 'https://razorpay.com/jobs', notes: 'Strong system design round.', status: 'Selected' },
      { id: id('app'), company: 'Zoho', role: 'Member Technical Staff', location: 'Chennai', package: '9 LPA', appliedOn: dateStr(-20), deadline: dateStr(-8), link: 'https://zoho.com/careers', notes: 'Drive on campus.', status: 'Selected' },
      { id: id('app'), company: 'Swiggy', role: 'SDE 1', location: 'Bengaluru', package: '32 LPA', appliedOn: dateStr(-10), deadline: dateStr(-3), link: 'https://careers.swiggy.com', notes: 'Rejected after coding round.', status: 'Rejected' },
      { id: id('app'), company: 'Freshworks', role: 'Software Engineer', location: 'Chennai', package: '18 LPA', appliedOn: dateStr(-3), deadline: dateStr(6), link: 'https://freshworks.com/company/careers', notes: '', status: 'Applied' },
      { id: id('app'), company: 'Adobe', role: 'Computer Scientist Intern', location: 'Noida', package: '50 LPA', appliedOn: '', deadline: dateStr(12), link: 'https://adobe.com/careers', notes: 'Update resume with new project first.', status: 'Interested' },
      { id: id('app'), company: 'Infosys', role: 'Specialist Programmer', location: 'Pune', package: '9.5 LPA', appliedOn: dateStr(-2), deadline: dateStr(15), link: 'https://infosys.com/careers', notes: '', status: 'Applied' },
      { id: id('app'), company: 'Google', role: 'STEP Intern', location: 'Bengaluru', package: '60 LPA', appliedOn: '', deadline: dateStr(20), link: 'https://careers.google.com', notes: 'Needs referral + strong DSA.', status: 'Interested' },
    ],
    interviews: [
      { id: id('int'), company: 'Microsoft', role: 'Software Engineer Intern', round: 'Technical Round 2', date: dtStr(1, 10), type: 'Online', link: 'https://teams.microsoft.com/l/meetup-join/demo', status: 'Scheduled', notes: 'Focus on trees, graphs and low-level design.', feedback: '' },
      { id: id('int'), company: 'Amazon', role: 'SDE Intern', round: 'Bar Raiser', date: dtStr(3, 14, 30), type: 'Online', link: 'https://chime.aws/demo', status: 'Scheduled', notes: 'Revise leadership principles with STAR stories.', feedback: '' },
      { id: id('int'), company: 'Atlassian', role: 'Frontend Engineer', round: 'Pair Programming', date: dtStr(6, 11), type: 'On-site', link: '', status: 'Scheduled', notes: 'Bring laptop. Practice React + accessibility.', feedback: '' },
      { id: id('int'), company: 'Razorpay', role: 'Backend Engineer', round: 'System Design', date: dtStr(-5, 15), type: 'Online', link: '', status: 'Completed', notes: '', feedback: 'Good schema design. Needed more depth on caching and rate limiting.' },
      { id: id('int'), company: 'Zoho', role: 'Member Technical Staff', round: 'HR', date: dtStr(-12, 11), type: 'On-site', link: '', status: 'Completed', notes: '', feedback: 'Clear communicator. Offer rolled out within a week.' },
    ],
    dsaProblems: makeDsa(),
    skills: [
      { id: id('sk'), name: 'Java', category: 'Languages', level: 78 },
      { id: id('sk'), name: 'Python', category: 'Languages', level: 72 },
      { id: id('sk'), name: 'C/C++', category: 'Languages', level: 65 },
      { id: id('sk'), name: 'JavaScript', category: 'Languages', level: 84 },
      { id: id('sk'), name: 'React', category: 'Frontend', level: 76 },
      { id: id('sk'), name: 'Node.js', category: 'Backend', level: 58 },
      { id: id('sk'), name: 'SQL', category: 'Database', level: 70 },
      { id: id('sk'), name: 'MongoDB', category: 'Database', level: 52 },
      { id: id('sk'), name: 'AWS', category: 'Cloud', level: 34 },
      { id: id('sk'), name: 'Machine Learning', category: 'AI / ML', level: 45 },
      { id: id('sk'), name: 'Deep Learning', category: 'AI / ML', level: 27 },
    ],
    goals: [
      { id: id('goal'), title: 'Land a 20+ LPA offer', description: 'Convert at least one product-company interview into an offer before campus season ends.', deadline: dateStr(60), priority: 'High', progress: 55, status: 'In progress' },
      { id: id('goal'), title: 'Solve 150 DSA problems', description: 'Cover all ten core topics with at least 12 problems each.', deadline: dateStr(45), priority: 'High', progress: 32, status: 'In progress' },
      { id: id('goal'), title: 'Ship the portfolio v2', description: 'Add three case studies and a blog section, deploy on Vercel.', deadline: dateStr(25), priority: 'Medium', progress: 70, status: 'In progress' },
      { id: id('goal'), title: 'Get AWS Cloud Practitioner certified', description: 'Complete the course and attempt the exam.', deadline: dateStr(90), priority: 'Low', progress: 10, status: 'Not started' },
    ],
    tasks: [
      { id: id('task'), title: 'Solve 2 graph problems (BFS / DFS)', category: 'DSA', due: dateStr(0), done: false },
      { id: id('task'), title: 'Aptitude: 20 quant questions', category: 'Aptitude', due: dateStr(0), done: true },
      { id: id('task'), title: 'Build resume-upload component', category: 'Projects', due: dateStr(0), done: false },
      { id: id('task'), title: 'Tailor resume for Amazon SDE role', category: 'Resume', due: dateStr(0), done: false },
      { id: id('task'), title: 'Apply to Adobe and Google internships', category: 'Job Applications', due: dateStr(0), done: false },
      { id: id('task'), title: 'Mock interview: behavioural questions', category: 'Interview Prep', due: dateStr(1), done: false },
      { id: id('task'), title: 'Solve LeetCode daily challenge', category: 'Coding', due: dateStr(0), done: true },
      { id: id('task'), title: 'Revise DBMS normalization notes', category: 'Interview Prep', due: dateStr(1), done: false },
    ],
    resumes: [
      { id: id('res'), name: 'Ananya_Reddy_SDE_Resume.pdf', label: 'SDE / Full-stack', size: 184320, type: 'application/pdf', uploadedAt: iso(60 * 24 * 6), primary: true, dataUrl: null, analysis: null },
      { id: id('res'), name: 'Ananya_Reddy_Data_ML.pdf', label: 'Data / ML roles', size: 171008, type: 'application/pdf', uploadedAt: iso(60 * 24 * 21), primary: false, dataUrl: null, analysis: null },
    ],
    activity: [
      { id: id('act'), type: 'application', text: 'Moved Amazon to Shortlisted', time: iso(45) },
      { id: id('act'), type: 'dsa', text: 'Solved Rotting Oranges (Medium)', time: iso(130) },
      { id: id('act'), type: 'task', text: 'Completed task: Aptitude: 20 quant questions', time: iso(60 * 5) },
      { id: id('act'), type: 'interview', text: 'Scheduled Microsoft technical round', time: iso(60 * 20) },
      { id: id('act'), type: 'application', text: 'Applied to Freshworks', time: iso(60 * 24 * 3) },
      { id: id('act'), type: 'goal', text: 'Updated goal: Ship the portfolio v2', time: iso(60 * 24 * 4) },
    ],
  }
}
