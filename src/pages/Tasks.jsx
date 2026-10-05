import { useMemo, useState } from 'react'
import { Plus, Check, Trash2, ListChecks } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TASK_CATEGORIES } from '../lib/metrics'
import { cn, toDateInput, fmtDate, daysUntil } from '../lib/utils'
import { Badge, EmptyState, PageHeader, ProgressRing } from '../components/ui'

const CAT_TONE = { DSA: 'teal', Aptitude: 'amber', Coding: 'indigo', Projects: 'violet', Resume: 'blue', 'Job Applications': 'green', 'Interview Prep': 'red' }

export default function Tasks() {
  const { data, add, update, remove, toast } = useApp()
  const [cat, setCat] = useState('All')
  const [title, setTitle] = useState('')
  const [newCat, setNewCat] = useState('DSA')
  const [due, setDue] = useState(toDateInput())

  const shown = useMemo(() => data.tasks.filter((t) => cat === 'All' || t.category === cat).sort((a, b) => (a.done - b.done) || a.due.localeCompare(b.due)), [data.tasks, cat])
  const pending = shown.filter((t) => !t.done)
  const done = shown.filter((t) => t.done)
  const total = data.tasks.length
  const pct = total ? Math.round((data.tasks.filter((t) => t.done).length / total) * 100) : 0

  const addTask = (e) => {
    e.preventDefault()
    if (!title.trim()) return toast('Enter a task title', 'error')
    add('tasks', { title: title.trim(), category: newCat, due, done: false })
    setTitle(''); toast('Task added')
  }
  const toggle = (t) => update('tasks', t.id, { done: !t.done }, !t.done ? `Completed task: ${t.title}` : null)

  const Row = ({ t }) => {
    const n = daysUntil(t.due)
    return (
      <li className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-white/5">
        <button onClick={() => toggle(t)} aria-label={t.done ? 'Mark as not done' : 'Mark as done'} className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-md border transition', t.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 hover:border-brand-500 dark:border-white/25')}>{t.done && <Check size={13} strokeWidth={3} />}</button>
        <span className={cn('flex-1 text-sm', t.done && 'text-slate-400 line-through')}>{t.title}</span>
        <Badge tone={CAT_TONE[t.category]}>{t.category}</Badge>
        <span className={cn('hidden w-24 text-right text-xs sm:block', !t.done && n < 0 ? 'text-red-600' : 'text-slate-400')}>{n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : fmtDate(t.due)}</span>
        <button className="icon-btn h-7 w-7 opacity-0 hover:text-red-600 focus:opacity-100 group-hover:opacity-100" onClick={() => { remove('tasks', t.id); toast('Task removed') }} aria-label="Delete task"><Trash2 size={14} /></button>
      </li>
    )
  }

  return (
    <>
      <PageHeader title="Daily tasks" subtitle="Small, repeatable preparation habits add up to an offer." />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <ProgressRing value={pct} size={88} stroke={9}><span className="font-display text-xl font-semibold text-slate-900 dark:text-white">{pct}%</span></ProgressRing>
          <div><p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{data.tasks.filter((t) => t.done).length} of {total} done</p><p className="text-sm text-slate-500">{pending.length} left in this view</p></div>
        </div>
        <form onSubmit={addTask} className="card p-5 lg:col-span-2">
          <p className="label">Add a task</p>
          <div className="flex flex-wrap gap-2">
            <input className="input min-w-[200px] flex-1" placeholder="e.g. Solve 3 tree problems" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Task title" />
            <select className="input w-auto" value={newCat} onChange={(e) => setNewCat(e.target.value)} aria-label="Category">{TASK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <input type="date" className="input w-auto" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
            <button className="btn btn-primary" type="submit"><Plus size={16} />Add</button>
          </div>
        </form>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">{['All', ...TASK_CATEGORIES].map((c) => <button key={c} onClick={() => setCat(c)} className={cn('chip', cat === c && 'chip-active')}>{c}</button>)}</div>

      {shown.length === 0 ? <EmptyState icon={ListChecks} title="No tasks in this category" text="Add a task above to plan your preparation." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="card p-3"><h3 className="px-3 pb-2 pt-2 text-sm font-semibold">To do <span className="font-normal text-slate-400">({pending.length})</span></h3>{pending.length ? <ul>{pending.map((t) => <Row key={t.id} t={t} />)}</ul> : <p className="px-3 pb-4 text-sm text-slate-400">Everything here is done.</p>}</section>
          <section className="card p-3"><h3 className="px-3 pb-2 pt-2 text-sm font-semibold">Completed <span className="font-normal text-slate-400">({done.length})</span></h3>{done.length ? <ul>{done.map((t) => <Row key={t.id} t={t} />)}</ul> : <p className="px-3 pb-4 text-sm text-slate-400">Completed tasks will appear here.</p>}</section>
        </div>
      )}
    </>
  )
}
