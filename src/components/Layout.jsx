import { useEffect, useMemo, useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, CalendarClock, Code2, Layers, Target, ListChecks, FileText, UserRound, Search, Sun, Moon, Bell, Menu, X, Compass, CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { computeMetrics } from '../lib/metrics'
import { cn, initials, daysUntil } from '../lib/utils'
import { ProgressRing } from './ui'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/dsa', label: 'DSA Tracker', icon: Code2 },
  { to: '/skills', label: 'Skills', icon: Layers },
  { to: '/goals', label: 'Career Goals', icon: Target },
  { to: '/tasks', label: 'Daily Tasks', icon: ListChecks },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

function Sidebar({ open, onClose }) {
  const { data } = useApp()
  const m = useMemo(() => computeMetrics(data), [data])
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 px-3 py-4 text-white transition-transform duration-200 dark:bg-[#0A1517] dark:border-r dark:border-white/5 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-2 pb-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-saffron-500 text-brand-900"><Compass size={20} strokeWidth={2.4} /></span>
            <span><span className="block font-display text-lg font-semibold leading-none">Placewise</span><span className="text-xs text-brand-200/70">Career & placement tracker</span></span>
          </Link>
          <button className="icon-btn text-white/70 lg:hidden" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn('group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-white/10 text-white' : 'text-brand-100/70 hover:bg-white/5 hover:text-white')}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-saffron-500" />}
                  <Icon size={18} />
                  <span className="flex-1">{label}</span>
                  {to === '/interviews' && m.upcoming.length > 0 && <span className="rounded-full bg-saffron-500 px-1.5 text-xs font-semibold text-brand-900">{m.upcoming.length}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-3 transition hover:bg-white/10">
          <ProgressRing value={m.score} size={48} stroke={5} color="#F5A524" track="text-white/15"><span className="text-xs font-semibold">{m.score}</span></ProgressRing>
          <span className="text-sm"><span className="block font-medium">Readiness</span><span className="text-xs text-brand-200/70">Focus: {m.weakest.label}</span></span>
        </Link>
      </aside>
    </>
  )
}

function Topbar({ onMenu }) {
  const { data, theme, toggleTheme } = useApp()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const soon = data.interviews.some((i) => i.status === 'Scheduled' && daysUntil(i.date) !== null && daysUntil(i.date) >= 0 && daysUntil(i.date) <= 2)
  const submit = (e) => { e.preventDefault(); nav(q.trim() ? `/applications?q=${encodeURIComponent(q.trim())}` : '/applications'); setQ('') }
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-paper/85 px-4 backdrop-blur dark:border-white/10 dark:bg-night/85 sm:px-6 lg:px-8">
      <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
      <form onSubmit={submit} className="relative max-w-md flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search companies or roles…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search applications" />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <Link to="/interviews" className="icon-btn relative" aria-label="Upcoming interviews"><Bell size={18} />{soon && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-saffron-500 ring-2 ring-paper dark:ring-night" />}</Link>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        <Link to="/profile" className="ml-2 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-slate-100 dark:hover:bg-white/5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">{initials(data.profile.name)}</span>
          <span className="hidden text-sm font-medium sm:block">{data.profile.name.split(' ')[0]}</span>
        </Link>
      </div>
    </header>
  )
}

function ToastHost() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex animate-toast items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          {t.type === 'error' ? <AlertCircle size={18} className="shrink-0 text-red-400" /> : <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss"><X size={14} className="opacity-60" /></button>
        </div>
      ))}
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={loc.pathname} className="animate-fade"><Outlet /></div>
        </main>
      </div>
      <ToastHost />
    </div>
  )
}
