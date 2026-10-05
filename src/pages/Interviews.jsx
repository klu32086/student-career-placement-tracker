import { useMemo, useState } from 'react'
import { Plus, Video, MapPin, Phone, Pencil, Trash2, CalendarClock, CheckCircle2, ExternalLink, MessageSquareQuote } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { isUpcoming } from '../lib/metrics'
import { cn, fmtDateTime, fmtTime, dueLabel, toDateTimeInput } from '../lib/utils'
import { useForm } from '../lib/useForm'
import { Badge, ConfirmDialog, EmptyState, Field, Modal, PageHeader } from '../components/ui'

const TYPES = ['Online', 'On-site', 'Phone']
const STATUS = ['Scheduled', 'Completed', 'Cancelled']
const TONE = { Scheduled: 'blue', Completed: 'green', Cancelled: 'slate' }
const TypeIcon = ({ type, size = 14 }) => (type === 'Online' ? <Video size={size} /> : type === 'Phone' ? <Phone size={size} /> : <MapPin size={size} />)
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return toDateTimeInput(d) }

function InterviewModal({ item, onClose }) {
  const { data, add, update, toast } = useApp()
  const { f, bind } = useForm({ company: '', role: '', round: '', date: tomorrow(), type: 'Online', link: '', status: 'Scheduled', notes: '', feedback: '', ...item })
  const submit = (e) => {
    e.preventDefault()
    if (!f.company.trim() || !f.date) return toast('Company and date are required', 'error')
    if (item.id) { update('interviews', item.id, f, `Updated ${f.company} interview`); toast('Interview updated') }
    else { add('interviews', f, `Scheduled ${f.company} ${f.round || 'interview'}`); toast('Interview scheduled') }
    onClose()
  }
  return (
    <Modal onClose={onClose} title={item.id ? 'Edit interview' : 'Schedule interview'} size="lg"
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit" form="int-form">{item.id ? 'Save changes' : 'Schedule'}</button></>}>
      <form id="int-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Company *"><input className="input" list="companies" autoFocus {...bind('company')} /><datalist id="companies">{[...new Set(data.applications.map((a) => a.company))].map((c) => <option key={c} value={c} />)}</datalist></Field>
        <Field label="Role"><input className="input" {...bind('role')} /></Field>
        <Field label="Interview round"><input className="input" placeholder="e.g. Technical Round 1" {...bind('round')} /></Field>
        <Field label="Date & time *"><input type="datetime-local" className="input" {...bind('date')} /></Field>
        <Field label="Interview type"><select className="input" {...bind('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Status"><select className="input" {...bind('status')}>{STATUS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Meeting link" className="sm:col-span-2"><input type="url" className="input" placeholder="https://" {...bind('link')} /></Field>
        <Field label="Preparation notes" className="sm:col-span-2"><textarea rows={2} className="input" {...bind('notes')} /></Field>
        <Field label="Feedback" className="sm:col-span-2"><textarea rows={2} className="input" placeholder="How did it go? What to improve?" {...bind('feedback')} /></Field>
      </form>
    </Modal>
  )
}

export default function Interviews() {
  const { data, update, remove, toast } = useApp()
  const [tab, setTab] = useState('upcoming')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const upcoming = useMemo(() => data.interviews.filter(isUpcoming).sort((a, b) => new Date(a.date) - new Date(b.date)), [data.interviews])
  const list = useMemo(() => {
    const all = [...data.interviews].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (tab === 'upcoming') return upcoming
    if (tab === 'past') return all.filter((i) => !isUpcoming(i))
    return all
  }, [data.interviews, tab, upcoming])
  const next = upcoming[0]

  return (
    <>
      <PageHeader title="Interviews" subtitle="Rounds, meeting links and feedback in one place."
        actions={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Schedule interview</button>} />

      {next && (
        <section className="mb-6 rounded-2xl bg-brand-900 p-6 text-white dark:bg-[#0F2A2B] dark:ring-1 dark:ring-white/10">
          <div className="flex flex-wrap items-center gap-6">
            <div className="rounded-xl bg-saffron-500 px-4 py-3 text-center leading-tight text-brand-900">
              <span className="block text-xs font-medium">{new Date(next.date).toLocaleDateString('en', { month: 'short' })}</span>
              <span className="font-display text-4xl font-semibold">{new Date(next.date).getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-saffron-400">Next up · {dueLabel(next.date)} at {fmtTime(next.date)}</p>
              <h2 className="mt-0.5 text-2xl font-semibold text-white">{next.company}</h2>
              <p className="text-sm text-brand-100/80">{next.role} · {next.round}</p>
              {next.notes && <p className="mt-2 max-w-xl text-sm text-brand-100/70">{next.notes}</p>}
            </div>
            <div className="flex flex-col gap-2">
              {next.link && <a className="btn btn-accent" href={next.link} target="_blank" rel="noreferrer"><Video size={16} />Join meeting</a>}
              <button className="btn border border-white/20 text-white hover:bg-white/10" onClick={() => setEditing(next)}><Pencil size={15} />Edit details</button>
            </div>
          </div>
        </section>
      )}

      <div className="mb-4 flex gap-2">
        {[['upcoming', `Upcoming (${upcoming.length})`], ['past', 'Past'], ['all', 'All']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={cn('chip', tab === k && 'chip-active')}>{label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={CalendarClock} title={tab === 'upcoming' ? 'No upcoming interviews' : 'Nothing here yet'} text="Schedule an interview to see it here with a countdown and meeting link."
          action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Schedule interview</button>} />
      ) : (
        <ul className="space-y-3">
          {list.map((i) => (
            <li key={i.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-14 shrink-0 rounded-lg bg-slate-100 py-2 text-center leading-tight dark:bg-white/5">
                  <span className="block text-xs text-slate-500">{new Date(i.date).toLocaleDateString('en', { month: 'short' })}</span>
                  <span className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{new Date(i.date).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{i.company}</h3><Badge tone={TONE[i.status]}>{i.status}</Badge><Badge tone="indigo">{i.round || 'Interview'}</Badge></div>
                  <p className="mt-0.5 text-sm text-slate-500">{i.role}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><CalendarClock size={13} />{fmtDateTime(i.date)}</span>
                    <span className="flex items-center gap-1.5"><TypeIcon type={i.type} size={13} />{i.type}</span>
                    {i.link && <a href={i.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-300"><ExternalLink size={13} />Meeting link</a>}
                  </p>
                  {i.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{i.notes}</p>}
                  {i.feedback && <p className="mt-2 flex gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300"><MessageSquareQuote size={16} className="mt-0.5 shrink-0 text-saffron-600" />{i.feedback}</p>}
                </div>
                <div className="flex gap-1">
                  {i.status === 'Scheduled' && <button className="icon-btn hover:text-emerald-600" aria-label="Mark completed" onClick={() => { update('interviews', i.id, { status: 'Completed' }, `Completed ${i.company} ${i.round || 'interview'}`); toast('Marked as completed') }}><CheckCircle2 size={17} /></button>}
                  <button className="icon-btn" aria-label="Edit" onClick={() => setEditing(i)}><Pencil size={16} /></button>
                  <button className="icon-btn hover:text-red-600" aria-label="Delete" onClick={() => setDeleting(i)}><Trash2 size={16} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <InterviewModal key={editing.id || 'new'} item={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} title="Delete interview" text={deleting && `Delete the ${deleting.round || 'interview'} with ${deleting.company}?`}
        onConfirm={() => { remove('interviews', deleting.id, `Deleted ${deleting.company} interview`); toast('Interview deleted') }} onClose={() => setDeleting(null)} />
    </>
  )
}
