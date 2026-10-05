import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, CalendarClock, Code2, Trophy, ArrowUpRight, Video, MapPin, Check, Clock } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell } from 'recharts'
import { useApp } from '../context/AppContext'
import { computeMetrics, STATUS_COLOR, levelLabel, PRIORITY_TONE } from '../lib/metrics'
import { fmtTime, fmtDate, dueLabel, daysUntil, timeAgo, toDateInput } from '../lib/utils'
import { Badge, CardHeader, ProgressBar, ProgressRing, Skeleton, chartTooltip, axisTick, EmptyState } from '../components/ui'

function Stat({ icon: Icon, label, value, sub, to, tone }) {
  return (
    <Link to={to} className="card group p-4 transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-500/40">
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}><Icon size={18} /></span>
        <ArrowUpRight size={16} className="text-slate-300 transition group-hover:text-brand-500" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
    </Link>
  )
}

function DashSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-64 lg:col-span-2" /><Skeleton className="h-64" /></div>
      <div className="grid gap-4 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
    </div>
  )
}

export default function Dashboard() {
  const { data, ready, update } = useApp()
  const m = useMemo(() => computeMetrics(data), [data])
  if (!ready) return <DashSkeleton />

  const first = data.profile.name.split(' ')[0]
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = toDateInput()
  const todayTasks = data.tasks.filter((t) => t.due <= today && (!t.done || t.due === today))
  const doneToday = todayTasks.filter((t) => t.done).length
  const closing = data.applications
    .filter((a) => !['Selected', 'Rejected'].includes(a.status) && daysUntil(a.deadline) !== null && daysUntil(a.deadline) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4)
  const topSkills = [...data.skills].sort((a, b) => b.level - a.level).slice(0, 5)
  const goals = data.goals.filter((g) => g.status !== 'Completed').slice(0, 3)
  const msg = m.score >= 75 ? 'You are placement-ready. Keep your interview practice sharp.' : m.score >= 50 ? `Solid progress. ${m.weakest.label} will move your score the most.` : `Getting started. Begin with ${m.weakest.label.toLowerCase()} to build momentum.`

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{greet}, {first}</h1>
        <p className="mt-1 text-sm text-slate-500">{m.upcoming.length ? `${m.upcoming.length} interview${m.upcoming.length > 1 ? 's' : ''} coming up, ${m.activeApps} applications in progress.` : `${m.activeApps} applications in progress.`}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Briefcase} label="Applications" value={data.applications.length} sub={`${m.activeApps} active`} to="/applications" tone="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" />
        <Stat icon={CalendarClock} label="Upcoming interviews" value={m.upcoming.length} sub={m.upcoming[0] ? `Next: ${m.upcoming[0].company}` : 'Nothing scheduled'} to="/interviews" tone="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" />
        <Stat icon={Code2} label="DSA problems solved" value={m.solved} sub={`${m.byDifficulty[2].value} hard`} to="/dsa" tone="bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" />
        <Stat icon={Trophy} label="Offers" value={m.offers} sub="Selected applications" to="/applications" tone="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-brand-900 p-6 text-white lg:col-span-2 dark:bg-[#0F2A2B] dark:ring-1 dark:ring-white/10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={m.score} size={168} stroke={14} color="#F5A524" track="text-white/10">
              <div className="text-center"><span className="font-display text-5xl font-semibold">{m.score}</span><span className="block text-xs text-brand-200/70">out of 100</span></div>
            </ProgressRing>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Placement readiness</h2>
              <p className="mt-1 max-w-md text-sm text-brand-100/80">{msg}</p>
              <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {m.parts.map((p) => (
                  <div key={p.key}>
                    <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{p.label}</span><span className="text-brand-200/70">{Math.round(p.value * 100)}%</span></div>
                    <ProgressBar value={p.value * 100} color="#F5A524" track="bg-white/10" height="h-1.5" />
                    <p className="mt-1 text-[11px] text-brand-200/60">{p.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <CardHeader title="Upcoming interviews" action={<Link to="/interviews" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">View all</Link>} />
          {m.upcoming.length === 0 ? <EmptyState icon={CalendarClock} title="No interviews scheduled" text="Add one from the Interviews page." /> : (
            <ul className="space-y-3">
              {m.upcoming.slice(0, 3).map((i, idx) => (
                <li key={i.id} className={`flex gap-3 rounded-lg p-3 ${idx === 0 ? 'bg-saffron-500/10 ring-1 ring-saffron-500/30' : 'bg-slate-50 dark:bg-white/5'}`}>
                  <div className="w-11 shrink-0 text-center leading-tight"><span className="block text-[11px] text-slate-500">{new Date(i.date).toLocaleDateString('en', { month: 'short' })}</span><span className="font-display text-xl font-semibold text-slate-900 dark:text-white">{new Date(i.date).getDate()}</span></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{i.company}</p>
                    <p className="truncate text-xs text-slate-500">{i.round} · {fmtTime(i.date)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">{i.type === 'Online' ? <Video size={12} /> : <MapPin size={12} />}{i.type} · {dueLabel(i.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <CardHeader title="Application pipeline" sub="Applications by stage" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.appsByStatus} margin={{ left: -24, right: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                <XAxis dataKey="status" tick={{ ...axisTick, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} tickFormatter={(s) => s.slice(0, 5)} />
                <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>{m.appsByStatus.map((e) => <Cell key={e.status} fill={STATUS_COLOR[e.status]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5">
          <CardHeader title="DSA activity" sub="Problems solved, last 7 days" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.weekly} margin={{ left: -24, right: 8 }}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1F9385" stopOpacity={0.45} /><stop offset="100%" stopColor="#1F9385" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="solved" stroke="#1F9385" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5">
          <CardHeader title="Topic coverage" sub="Progress toward 12 per topic" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={m.topics} outerRadius="70%">
                <PolarGrid stroke="rgba(148,163,184,.3)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={(t) => (t.length > 9 ? t.split(' ')[0] : t)} />
                <Tooltip {...chartTooltip} />
                <Radar dataKey="pct" name="Coverage %" stroke="#F5A524" fill="#F5A524" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <CardHeader title="Today's preparation" sub={`${doneToday} of ${todayTasks.length} done`} action={<Link to="/tasks" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">All tasks</Link>} />
          {todayTasks.length === 0 ? <EmptyState icon={Check} title="All clear for today" text="Add tasks on the Daily Tasks page." /> : (
            <ul className="space-y-1">
              {todayTasks.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <button onClick={() => update('tasks', t.id, { done: !t.done }, !t.done ? `Completed task: ${t.title}` : null)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-white/5">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${t.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 dark:border-white/20'}`}>{t.done && <Check size={13} strokeWidth={3} />}</span>
                    <span className={`flex-1 text-sm ${t.done ? 'text-slate-400 line-through' : ''}`}>{t.title}</span>
                    <Badge>{t.category}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <CardHeader title="Career goals" action={<Link to="/goals" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">Manage</Link>} />
          <ul className="space-y-4">
            {goals.map((g) => (
              <li key={g.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2"><span className="truncate text-sm font-medium text-slate-900 dark:text-white">{g.title}</span><Badge tone={PRIORITY_TONE[g.priority]}>{g.priority}</Badge></div>
                <ProgressBar value={g.progress} />
                <p className="mt-1 text-xs text-slate-500">{g.progress}% · due {fmtDate(g.deadline)}</p>
              </li>
            ))}
            {goals.length === 0 && <EmptyState title="No active goals" text="Set a goal to keep your search focused." />}
          </ul>
        </section>
        <section className="card p-5">
          <CardHeader title="Strongest skills" action={<Link to="/skills" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">All skills</Link>} />
          <ul className="space-y-3.5">
            {topSkills.map((s) => (
              <li key={s.id}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium text-slate-900 dark:text-white">{s.name}</span><span className="text-xs text-slate-500">{levelLabel(s.level)}</span></div>
                <ProgressBar value={s.level} color="#3BAEA0" />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <CardHeader title="Deadlines closing soon" sub="Open applications, nearest first" action={<Link to="/applications" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">Open board</Link>} />
          {closing.length === 0 ? <EmptyState icon={Clock} title="No upcoming deadlines" /> : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {closing.map((a) => {
                const n = daysUntil(a.deadline)
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 font-display font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{a.company[0]}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{a.company}</p><p className="truncate text-xs text-slate-500">{a.role} · {a.package}</p></div>
                    <Badge tone={n <= 2 ? 'red' : n <= 7 ? 'amber' : 'slate'}>{dueLabel(a.deadline)}</Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <CardHeader title="Recent activity" />
          <ul className="space-y-4">
            {data.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-saffron-500" />
                <div><p className="text-sm text-slate-700 dark:text-slate-300">{a.text}</p><p className="text-xs text-slate-400">{timeAgo(a.time)}</p></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
