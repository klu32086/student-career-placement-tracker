import { useState } from 'react'
import { Plus, Pencil, Trash2, Target, CalendarDays } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PRIORITIES, PRIORITY_TONE, GOAL_STATUSES } from '../lib/metrics'
import { cn, fmtDate, dueLabel, daysUntil } from '../lib/utils'
import { useForm } from '../lib/useForm'
import { Badge, ConfirmDialog, EmptyState, Field, Modal, PageHeader, ProgressBar } from '../components/ui'

const STATUS_TONE = { 'Not started': 'slate', 'In progress': 'blue', 'On hold': 'amber', Completed: 'green' }

function GoalModal({ item, onClose }) {
  const { add, update, toast } = useApp()
  const { f, setF, bind } = useForm({ title: '', description: '', deadline: '', priority: 'Medium', progress: 0, status: 'Not started', ...item })
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) return toast('Goal title is required', 'error')
    const progress = Number(f.progress)
    const status = progress >= 100 ? 'Completed' : f.status
    const rec = { ...f, progress, status }
    if (item.id) { update('goals', item.id, rec, `Updated goal: ${f.title}`); toast('Goal updated') }
    else { add('goals', rec, `Created goal: ${f.title}`); toast('Goal created') }
    onClose()
  }
  return (
    <Modal onClose={onClose} title={item.id ? 'Edit goal' : 'New career goal'} size="lg"
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit" form="goal-form">{item.id ? 'Save changes' : 'Create goal'}</button></>}>
      <form id="goal-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *" className="sm:col-span-2"><input className="input" autoFocus {...bind('title')} /></Field>
        <Field label="Description" className="sm:col-span-2"><textarea rows={3} className="input" {...bind('description')} /></Field>
        <Field label="Deadline"><input type="date" className="input" {...bind('deadline')} /></Field>
        <Field label="Priority"><select className="input" {...bind('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="Status"><select className="input" {...bind('status')}>{GOAL_STATUSES.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label={`Progress: ${f.progress}%`}><input type="range" min="0" max="100" step="5" className="mt-2 w-full accent-brand-600" value={f.progress} onChange={(e) => setF((s) => ({ ...s, progress: e.target.value }))} /></Field>
      </form>
    </Modal>
  )
}

export default function Goals() {
  const { data, remove, toast } = useApp()
  const [filter, setFilter] = useState('All')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const shown = data.goals.filter((g) => filter === 'All' || g.status === filter)

  return (
    <>
      <PageHeader title="Career goals" subtitle="Turn placement season into milestones you can finish."
        actions={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />New goal</button>} />
      <div className="mb-4 flex flex-wrap gap-2">{['All', ...GOAL_STATUSES].map((s) => <button key={s} onClick={() => setFilter(s)} className={cn('chip', filter === s && 'chip-active')}>{s}</button>)}</div>
      {shown.length === 0 ? <EmptyState icon={Target} title="No goals here" text="Create a goal with a deadline and track progress as you go." action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />New goal</button>} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((g) => {
            const n = daysUntil(g.deadline)
            return (
              <article key={g.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="text-base font-semibold">{g.title}</h3><div className="mt-1.5 flex flex-wrap gap-1.5"><Badge tone={PRIORITY_TONE[g.priority]}>{g.priority} priority</Badge><Badge tone={STATUS_TONE[g.status]}>{g.status}</Badge></div></div>
                  <div className="flex shrink-0"><button className="icon-btn" onClick={() => setEditing(g)} aria-label="Edit"><Pencil size={15} /></button><button className="icon-btn hover:text-red-600" onClick={() => setDeleting(g)} aria-label="Delete"><Trash2 size={15} /></button></div>
                </div>
                {g.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{g.description}</p>}
                <div className="mt-4"><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">Progress</span><span className="text-slate-500">{g.progress}%</span></div><ProgressBar value={g.progress} color={g.progress >= 100 ? '#22C55E' : '#1F9385'} height="h-2.5" /></div>
                {g.deadline && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} />Due {fmtDate(g.deadline)}{g.status !== 'Completed' && n !== null && <span className={n < 0 ? 'text-red-600' : ''}> · {dueLabel(g.deadline)}</span>}</p>}
              </article>
            )
          })}
        </div>
      )}
      {editing && <GoalModal key={editing.id || 'new'} item={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} title="Delete goal" text={deleting && `Delete "${deleting.title}"?`} onConfirm={() => { remove('goals', deleting.id, `Deleted goal: ${deleting.title}`); toast('Goal deleted') }} onClose={() => setDeleting(null)} />
    </>
  )
}
