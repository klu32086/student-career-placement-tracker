import { useRef, useState } from 'react'
import { UploadCloud, FileText, Star, Download, Eye, Trash2, Sparkles, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { analyzeResume } from '../services/resumeAnalyzer'
import { cn, fmtSize, timeAgo, download } from '../lib/utils'
import { Badge, ConfirmDialog, EmptyState, Modal, PageHeader } from '../components/ui'

const MAX_STORED = 1.5 * 1024 * 1024 // keep demo files small enough for LocalStorage

const readAsDataUrl = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) })

function Preview({ resume, profile, onClose }) {
  const isPdf = resume.dataUrl && resume.type === 'application/pdf'
  const isImg = resume.dataUrl && resume.type.startsWith('image/')
  return (
    <Modal onClose={onClose} title={resume.name} size="xl">
      {isPdf ? <iframe title={resume.name} src={resume.dataUrl} className="h-[65vh] w-full rounded-lg border border-slate-200 dark:border-white/10" />
        : isImg ? <img src={resume.dataUrl} alt={resume.name} className="mx-auto max-h-[65vh] rounded-lg" />
        : (
          <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-slate-800 shadow-sm">
            <p className="mb-4 rounded bg-amber-50 px-3 py-1.5 text-xs text-amber-800">Simulated preview. This demo entry has no uploaded file.</p>
            <h2 className="!text-slate-900 text-2xl font-semibold">{profile.name}</h2>
            <p className="text-sm text-slate-500">{profile.degree} · {profile.branch} · CGPA {profile.cgpa}</p>
            <hr className="my-4" />
            {['Education', 'Projects', 'Skills', 'Experience'].map((s) => (
              <div key={s} className="mb-4"><p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">{s}</p><div className="space-y-1.5"><div className="h-2 w-full rounded bg-slate-200" /><div className="h-2 w-5/6 rounded bg-slate-200" /><div className="h-2 w-2/3 rounded bg-slate-200" /></div></div>
            ))}
          </div>
        )}
    </Modal>
  )
}

export default function Resumes() {
  const { data, add, update, remove, mutate, toast } = useApp()
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [preview, setPreview] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const resumes = [...data.resumes].sort((a, b) => (b.primary - a.primary) || new Date(b.uploadedAt) - new Date(a.uploadedAt))

  const upload = async (files) => {
    for (const file of Array.from(files || [])) {
      if (!/\.(pdf|doc|docx|png|jpe?g)$/i.test(file.name)) { toast(`${file.name}: unsupported file type`, 'error'); continue }
      let dataUrl = null
      if (file.size <= MAX_STORED) { try { dataUrl = await readAsDataUrl(file) } catch { dataUrl = null } }
      const first = data.resumes.length === 0
      add('resumes', { name: file.name, label: 'Uploaded resume', size: file.size, type: file.type || 'application/octet-stream', uploadedAt: new Date().toISOString(), primary: first, dataUrl, analysis: null }, `Uploaded resume: ${file.name}`)
      toast(dataUrl ? 'Resume uploaded' : 'Resume added (file too large to keep in demo storage)')
    }
    if (inputRef.current) inputRef.current.value = ''
  }
  const makePrimary = (r) => { mutate('resumes', (l) => l.map((x) => ({ ...x, primary: x.id === r.id })), `Set ${r.name} as primary resume`); toast('Primary resume updated') }
  const downloadResume = (r) => {
    if (r.dataUrl) download(r.name, r.dataUrl)
    else download(r.name.replace(/\.\w+$/, '') + '.txt', `${data.profile.name}\n${data.profile.degree}, ${data.profile.branch}\n\nDemo placeholder for "${r.name}". The original file was not stored in this prototype.`)
    toast('Download started')
  }
  const runAnalyzer = async (r) => {
    const res = await analyzeResume(r)
    if (res.status === 'coming_soon') toast('AI Resume Analyzer is coming in the next release')
  }

  return (
    <>
      <PageHeader title="Resumes" subtitle="Keep tailored versions ready and mark the one you send by default." />
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files) }}
        className={cn('mb-6 flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition', drag ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-300 dark:border-white/15')}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><UploadCloud size={22} /></span>
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">Drop a resume here, or choose a file</p>
        <p className="text-xs text-slate-500">PDF, DOC, DOCX, PNG or JPG. Files under 1.5 MB are stored in your browser.</p>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple hidden onChange={(e) => upload(e.target.files)} />
        <button className="btn btn-primary mt-4" onClick={() => inputRef.current?.click()}>Upload resume</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {resumes.length === 0 ? <EmptyState icon={FileText} title="No resumes uploaded" text="Upload your first resume to mark it as primary." /> : resumes.map((r) => (
            <article key={r.id} className={cn('card flex flex-wrap items-center gap-4 p-4', r.primary && 'border-saffron-500/60 ring-1 ring-saffron-500/30')}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><FileText size={22} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold">{r.name}</h3>{r.primary && <Badge tone="amber"><Star size={11} fill="currentColor" />Primary</Badge>}</div>
                <p className="mt-0.5 text-xs text-slate-500">{r.label} · {fmtSize(r.size)} · uploaded {timeAgo(r.uploadedAt)}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {!r.primary && <button className="btn btn-ghost px-2.5 py-1.5" onClick={() => makePrimary(r)}><Star size={15} />Make primary</button>}
                <button className="icon-btn" onClick={() => setPreview(r)} aria-label="View"><Eye size={16} /></button>
                <button className="icon-btn" onClick={() => downloadResume(r)} aria-label="Download"><Download size={16} /></button>
                <button className="icon-btn hover:text-red-600" onClick={() => setDeleting(r)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>

        <aside className="card h-fit p-5">
          <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-saffron-500/15 text-saffron-600"><Sparkles size={18} /></span><h3 className="text-base font-semibold">AI Resume Analyzer</h3><Badge tone="violet">Soon</Badge></div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Score your resume against a job description, spot missing keywords and get rewrite suggestions.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">{['ATS compatibility score', 'Job description keyword match', 'Bullet-point improvements'].map((x) => <li key={x} className="flex items-center gap-2"><Lock size={13} />{x}</li>)}</ul>
          <button className="btn btn-outline mt-5 w-full" disabled={!resumes.length} onClick={() => runAnalyzer(resumes.find((r) => r.primary) || resumes[0])}>Analyze primary resume</button>
        </aside>
      </div>

      {preview && <Preview resume={preview} profile={data.profile} onClose={() => setPreview(null)} />}
      <ConfirmDialog open={!!deleting} title="Remove resume" confirmLabel="Remove" text={deleting && `Remove ${deleting.name}? ${deleting.primary ? 'This is your primary resume.' : ''}`}
        onConfirm={() => { remove('resumes', deleting.id, `Removed resume: ${deleting.name}`); toast('Resume removed') }} onClose={() => setDeleting(null)} />
    </>
  )
}
