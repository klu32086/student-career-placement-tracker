import { useState } from 'react'
import { X, Download, RotateCcw, Github, Linkedin, Globe, GraduationCap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { initials, download } from '../lib/utils'
import { useForm } from '../lib/useForm'
import { ConfirmDialog, Field, PageHeader } from '../components/ui'

export default function Profile() {
  const { data, setProfile, resetDemo, toast } = useApp()
  const { f, setF, bind } = useForm(data.profile)
  const [skill, setSkill] = useState('')
  const [reset, setReset] = useState(false)

  const addSkill = () => {
    const s = skill.trim()
    if (!s || f.skills.some((x) => x.toLowerCase() === s.toLowerCase())) return setSkill('')
    setF((p) => ({ ...p, skills: [...p.skills, s] })); setSkill('')
  }
  const save = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return toast('Name is required', 'error')
    setProfile(f); toast('Profile saved')
  }
  const links = [[Github, f.github, 'GitHub'], [Linkedin, f.linkedin, 'LinkedIn'], [Globe, f.portfolio, 'Portfolio']].filter((l) => l[1])

  return (
    <>
      <PageHeader title="Profile" subtitle="This information will power resume analysis and job matching later." />
      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="card h-fit p-6 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-900 font-display text-2xl font-semibold text-saffron-400">{initials(f.name)}</span>
          <h2 className="mt-4 text-xl font-semibold">{f.name || 'Your name'}</h2>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500"><GraduationCap size={15} />{f.degree} · {f.branch}</p>
          <p className="text-sm text-slate-500">{f.college}</p>
          <div className="mt-4 flex justify-center gap-6 border-y border-slate-100 py-4 dark:border-white/5">
            <div><p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{f.cgpa || '—'}</p><p className="text-xs text-slate-500">CGPA</p></div>
            <div><p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{f.gradYear || '—'}</p><p className="text-xs text-slate-500">Graduating</p></div>
          </div>
          <div className="mt-4 flex justify-center gap-2">{links.map(([Icon, url, label]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="icon-btn border border-slate-200 dark:border-white/10" aria-label={label}><Icon size={16} /></a>)}</div>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={save} className="card p-6">
            <h3 className="mb-4 text-base font-semibold">Personal & academic details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><input className="input" {...bind('name')} /></Field>
              <Field label="College"><input className="input" {...bind('college')} /></Field>
              <Field label="Degree"><input className="input" {...bind('degree')} /></Field>
              <Field label="Branch"><input className="input" {...bind('branch')} /></Field>
              <Field label="CGPA"><input className="input" inputMode="decimal" {...bind('cgpa')} /></Field>
              <Field label="Graduation year"><input className="input" inputMode="numeric" {...bind('gradYear')} /></Field>
              <Field label="GitHub"><input type="url" className="input" placeholder="https://github.com/…" {...bind('github')} /></Field>
              <Field label="LinkedIn"><input type="url" className="input" placeholder="https://linkedin.com/in/…" {...bind('linkedin')} /></Field>
              <Field label="Portfolio" className="sm:col-span-2"><input type="url" className="input" placeholder="https://" {...bind('portfolio')} /></Field>
            </div>
            <div className="mt-5">
              <span className="label">Skills</span>
              <div className="flex flex-wrap gap-2">
                {f.skills.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{s}<button type="button" onClick={() => setF((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }))} aria-label={`Remove ${s}`} className="grid h-5 w-5 place-items-center rounded-full hover:bg-brand-100 dark:hover:bg-white/10"><X size={12} /></button></span>)}
              </div>
              <div className="mt-3 flex gap-2"><input className="input max-w-xs" placeholder="Add a skill and press Enter" value={skill} onChange={(e) => setSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} /><button type="button" className="btn btn-outline" onClick={addSkill}>Add</button></div>
            </div>
            <div className="mt-6 flex justify-end"><button className="btn btn-primary" type="submit">Save profile</button></div>
          </form>

          <section className="card p-6">
            <h3 className="text-base font-semibold">Data & storage</h3>
            <p className="mt-1 text-sm text-slate-500">Everything is stored in this browser using LocalStorage. Export a copy or restore the demo data any time.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-outline" onClick={() => { download('placewise-export.json', JSON.stringify({ ...data, resumes: data.resumes.map(({ dataUrl, ...r }) => r) }, null, 2), 'application/json'); toast('Export downloaded') }}><Download size={16} />Export JSON</button>
              <button className="btn btn-outline text-red-600 dark:text-red-400" onClick={() => setReset(true)}><RotateCcw size={16} />Reset demo data</button>
            </div>
          </section>
        </div>
      </div>
      <ConfirmDialog open={reset} title="Reset demo data" confirmLabel="Reset" text="This replaces everything you have added with the original sample data." onConfirm={() => { resetDemo(); toast('Demo data restored'); setTimeout(() => window.location.reload(), 400) }} onClose={() => setReset(false)} />
    </>
  )
}
