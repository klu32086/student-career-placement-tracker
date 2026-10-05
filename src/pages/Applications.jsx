import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, LayoutGrid, Table2, Pencil, Trash2, ExternalLink, MapPin, IndianRupee, CalendarDays, Briefcase, GripVertical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { STATUSES, STATUS_TONE, STATUS_COLOR } from '../lib/metrics'
import { cn, fmtDate, daysUntil, dueLabel } from '../lib/utils'
import { useForm } from '../lib/useForm'
import { Badge, ConfirmDialog, EmptyState, Field, Modal, PageHeader } from '../components/ui'

const EMPTY = { company: '', role: '', location: '', package: '', appliedOn: '', deadline: '', link: '', notes: '', status: 'Interested' }

function ApplicationModal({ item, onClose }) {
  const { add, update, toast } = useApp()
  const { f, bind } = useForm({ ...EMPTY, ...item })
  const submit = (e) => {
    e.preventDefault()
    if (!f.company.trim() || !f.role.trim()) return toast('Company and role are required', 'error')
    if (item.id) { update('applications', item.id, f, `Updated application: ${f.company}`); toast('Application updated') }
    else { add('applications', f, f.status === 'Interested' ? `Saved ${f.company} as interested` : `Applied to ${f.company}`); toast('Application added') }
    onClose()
  }
  return (
    <Modal onClose={onClose} title={item.id ? 'Edit application' : 'Add application'} size="lg"
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit" form="app-form">{item.id ? 'Save changes' : 'Add application'}</button></>}>
      <form id="app-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Company *"><input className="input" autoFocus {...bind('company')} /></Field>
        <Field label="Job role *"><input className="input" {...bind('role')} /></Field>
        <Field label="Location"><input className="input" {...bind('location')} /></Field>
        <Field label="Package"><input className="input" placeholder="e.g. 18 LPA" {...bind('package')} /></Field>
        <Field label="Application date"><input type="date" className="input" {...bind('appliedOn')} /></Field>
        <Field label="Deadline"><input type="date" className="input" {...bind('deadline')} /></Field>
        <Field label="Job link" className="sm:col-span-2"><input type="url" className="input" placeholder="https://" {...bind('link')} /></Field>
        <Field label="Status" className="sm:col-span-2"><select className="input" {...bind('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Notes" className="sm:col-span-2"><textarea rows={3} className="input" {...bind('notes')} /></Field>
      </form>
    </Modal>
  )
}

function Card({ a, onEdit, onDelete, onMove }) {
  const n = daysUntil(a.deadline)
  const open = !['Selected', 'Rejected'].includes(a.status)
  return (
    <div draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', a.id); e.dataTransfer.effectAllowed = 'move' }}
      className="card group cursor-grab p-3.5 transition hover:border-brand-300 hover:shadow-md active:cursor-grabbing dark:hover:border-brand-500/40">
      <div className="flex items-start gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 font-display font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{a.company[0]}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{a.company}</p><p className="truncate text-xs text-slate-500">{a.role}</p></div>
        <GripVertical size={14} className="mt-1 text-slate-300 opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-500">
        {a.location && <p className="flex items-center gap-1.5"><MapPin size={12} />{a.location}</p>}
        {a.package && <p className="flex items-center gap-1.5"><IndianRupee size={12} />{a.package}</p>}
        {a.deadline && <p className="flex items-center gap-1.5"><CalendarDays size={12} />{fmtDate(a.deadline)}{open && n !== null && <Badge className="ml-1" tone={n < 0 ? 'red' : n <= 3 ? 'amber' : 'slate'}>{dueLabel(a.deadline)}</Badge>}</p>}
      </div>
      <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2.5 dark:border-white/5">
        <select aria-label="Move to stage" value={a.status} onChange={(e) => onMove(a, e.target.value)} className="min-w-0 flex-1 rounded-md bg-transparent py-1 text-xs text-slate-500 focus:outline-none">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="icon-btn h-7 w-7" aria-label="Open job link"><ExternalLink size={14} /></a>}
        <button className="icon-btn h-7 w-7" onClick={() => onEdit(a)} aria-label="Edit"><Pencil size={14} /></button>
        <button className="icon-btn h-7 w-7 hover:text-red-600" onClick={() => onDelete(a)} aria-label="Delete"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

export default function Applications() {
  const { data, update, remove, toast } = useApp()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [view, setView] = useState('board')
  const [status, setStatus] = useState('All')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [over, setOver] = useState(null)

  const list = useMemo(() => data.applications.filter((a) => {
    const hit = `${a.company} ${a.role} ${a.location}`.toLowerCase().includes(q.toLowerCase())
    return hit && (view === 'board' || status === 'All' || a.status === status)
  }), [data.applications, q, status, view])

  const move = (a, s) => {
    if (a.status === s) return
    update('applications', a.id, { status: s, ...(s === 'Applied' && !a.appliedOn ? { appliedOn: new Date().toISOString().slice(0, 10) } : {}) }, `Moved ${a.company} to ${s}`)
    toast(`${a.company} moved to ${s}`)
  }
  const drop = (e, s) => {
    e.preventDefault(); setOver(null)
    const a = data.applications.find((x) => x.id === e.dataTransfer.getData('text/plain'))
    if (a) move(a, s)
  }

  return (
    <>
      <PageHeader title="Applications" subtitle="Track every company from first interest to offer."
        actions={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Add application</button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Filter by company, role or location" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {view === 'table' && (
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        )}
        <div className="ml-auto flex rounded-lg border border-slate-200 p-0.5 dark:border-white/10">
          {[['board', LayoutGrid, 'Board'], ['table', Table2, 'Table']].map(([k, Icon, label]) => (
            <button key={k} onClick={() => setView(k)} className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition', view === k ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white')}><Icon size={15} />{label}</button>
          ))}
        </div>
      </div>

      {data.applications.length === 0 ? (
        <EmptyState icon={Briefcase} title="No applications yet" text="Add the first company you are interested in and move it through the pipeline." action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Add application</button>} />
      ) : view === 'board' ? (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {STATUSES.map((s) => {
            const items = list.filter((a) => a.status === s)
            return (
              <div key={s} onDragOver={(e) => { e.preventDefault(); setOver(s) }} onDragLeave={() => setOver(null)} onDrop={(e) => drop(e, s)}
                className={cn('w-72 shrink-0 rounded-xl bg-slate-100/70 p-3 transition dark:bg-white/[.03]', over === s && 'ring-2 ring-brand-500')}>
                <div className="mb-3 flex items-center gap-2 px-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} /><h3 className="text-sm font-semibold">{s}</h3><span className="ml-auto rounded-full bg-white px-2 text-xs font-medium text-slate-500 dark:bg-white/10">{items.length}</span></div>
                <div className="space-y-2.5">
                  {items.map((a) => <Card key={a.id} a={a} onEdit={setEditing} onDelete={setDeleting} onMove={move} />)}
                  {items.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400 dark:border-white/10">Drop a card here</p>}
                </div>
              </div>
            )
          })}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Search} title="No matching applications" text="Try a different search or status filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-white/10"><tr>{['Company', 'Location', 'Package', 'Applied', 'Deadline', 'Status', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {list.map((a) => (
                <tr key={a.id} className="transition hover:bg-slate-50 dark:hover:bg-white/[.03]">
                  <td className="px-4 py-3"><p className="font-semibold text-slate-900 dark:text-white">{a.company}</p><p className="text-xs text-slate-500">{a.role}</p></td>
                  <td className="px-4 py-3">{a.location || '—'}</td><td className="px-4 py-3">{a.package || '—'}</td>
                  <td className="px-4 py-3">{fmtDate(a.appliedOn)}</td><td className="px-4 py-3">{fmtDate(a.deadline)}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="icon-btn" aria-label="Open job link"><ExternalLink size={15} /></a>}
                    <button className="icon-btn" onClick={() => setEditing(a)} aria-label="Edit"><Pencil size={15} /></button>
                    <button className="icon-btn hover:text-red-600" onClick={() => setDeleting(a)} aria-label="Delete"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ApplicationModal key={editing.id || 'new'} item={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} title="Delete application" text={deleting && `Remove ${deleting.company} (${deleting.role}) from your tracker? This cannot be undone.`}
        onConfirm={() => { remove('applications', deleting.id, `Deleted application: ${deleting.company}`); toast('Application deleted') }} onClose={() => setDeleting(null)} />
    </>
  )
}
