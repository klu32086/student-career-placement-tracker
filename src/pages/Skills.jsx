import { useState } from 'react'
import { Plus, Pencil, Trash2, Layers, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SKILL_CATEGORIES, levelLabel, levelTone } from '../lib/metrics'
import { useForm } from '../lib/useForm'
import { Badge, ConfirmDialog, EmptyState, Field, Modal, PageHeader, ProgressRing } from '../components/ui'

const ringColor = (v) => (v < 30 ? '#94A3B8' : v < 60 ? '#38BDF8' : v < 85 ? '#1F9385' : '#22C55E')

function SkillModal({ item, onClose }) {
  const { add, update, toast } = useApp()
  const { f, setF, bind } = useForm({ name: '', category: 'Languages', level: 50, ...item })
  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return toast('Skill name is required', 'error')
    const rec = { ...f, level: Number(f.level) }
    if (item.id) { update('skills', item.id, rec, `Updated ${f.name} to ${levelLabel(rec.level)}`); toast('Skill updated') }
    else { add('skills', rec, `Added skill: ${f.name}`); toast('Skill added') }
    onClose()
  }
  return (
    <Modal onClose={onClose} title={item.id ? 'Edit skill' : 'Add skill'}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit" form="skill-form">{item.id ? 'Save changes' : 'Add skill'}</button></>}>
      <form id="skill-form" onSubmit={submit} className="space-y-4">
        <Field label="Skill name *"><input className="input" autoFocus {...bind('name')} /></Field>
        <Field label="Category"><select className="input" {...bind('category')}>{SKILL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label={`Proficiency: ${f.level}% (${levelLabel(Number(f.level))})`}>
          <input type="range" min="0" max="100" step="5" className="w-full accent-brand-600" value={f.level} onChange={(e) => setF((s) => ({ ...s, level: e.target.value }))} />
          <div className="mt-1 flex justify-between text-xs text-slate-400"><span>Beginner</span><span>Intermediate</span><span>Advanced</span><span>Expert</span></div>
        </Field>
      </form>
    </Modal>
  )
}

export default function Skills() {
  const { data, remove, toast } = useApp()
  const [cat, setCat] = useState('All')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const skills = [...data.skills].sort((a, b) => b.level - a.level)
  const shown = skills.filter((s) => cat === 'All' || s.category === cat)
  const avg = skills.length ? Math.round(skills.reduce((s, x) => s + x.level, 0) / skills.length) : 0
  const cats = ['All', ...new Set(data.skills.map((s) => s.category))]
  const weakest = [...skills].reverse().slice(0, 2)

  return (
    <>
      <PageHeader title="Skills" subtitle="Rate your proficiency and see where to invest next."
        actions={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Add skill</button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <ProgressRing value={avg} size={72} stroke={8}><span className="text-sm font-semibold text-slate-900 dark:text-white">{avg}%</span></ProgressRing>
          <div><p className="text-sm text-slate-500">Average proficiency</p><p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{levelLabel(avg)}</p></div>
        </div>
        <div className="card p-5"><p className="text-sm text-slate-500">Advanced or expert</p><p className="mt-1 font-display text-3xl font-semibold text-slate-900 dark:text-white">{skills.filter((s) => s.level >= 60).length}<span className="text-base font-normal text-slate-400"> / {skills.length}</span></p></div>
        <div className="card p-5"><p className="flex items-center gap-1.5 text-sm text-slate-500"><TrendingUp size={14} />Worth investing in</p><p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{weakest.map((w) => w.name).join(' and ') || '—'}</p><p className="text-xs text-slate-500">Your two lowest-rated skills</p></div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? 'chip-active' : ''}`}>{c}</button>)}</div>

      {shown.length === 0 ? <EmptyState icon={Layers} title="No skills yet" text="Add the technologies you know and rate how comfortable you are." action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Add skill</button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((s) => (
            <div key={s.id} className="card group relative p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute right-3 top-3 flex opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button className="icon-btn h-7 w-7" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}><Pencil size={14} /></button>
                <button className="icon-btn h-7 w-7 hover:text-red-600" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}><Trash2 size={14} /></button>
              </div>
              <ProgressRing value={s.level} size={84} stroke={8} color={ringColor(s.level)}><span className="font-display text-lg font-semibold text-slate-900 dark:text-white">{s.level}</span></ProgressRing>
              <h3 className="mt-3 text-base font-semibold">{s.name}</h3>
              <div className="mt-1.5 flex items-center gap-2"><Badge tone={levelTone(s.level)}>{levelLabel(s.level)}</Badge><span className="text-xs text-slate-500">{s.category}</span></div>
            </div>
          ))}
        </div>
      )}

      {editing && <SkillModal key={editing.id || 'new'} item={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} title="Delete skill" text={deleting && `Remove ${deleting.name} from your skills?`}
        onConfirm={() => { remove('skills', deleting.id, `Removed skill: ${deleting.name}`); toast('Skill removed') }} onClose={() => setDeleting(null)} />
    </>
  )
}
