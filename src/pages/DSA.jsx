import { useMemo, useState } from 'react'
import { Plus, Search, ExternalLink, Pencil, Trash2, Code2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useApp } from '../context/AppContext'
import { computeMetrics, DSA_TOPICS, DIFFICULTIES, DIFF_COLOR, DIFF_TONE, PLATFORMS, DSA_TARGET, TOPIC_TARGET } from '../lib/metrics'
import { fmtDate, toDateInput } from '../lib/utils'
import { useForm } from '../lib/useForm'
import { Badge, CardHeader, ConfirmDialog, EmptyState, Field, Modal, PageHeader, ProgressBar, ProgressRing, chartTooltip, axisTick } from '../components/ui'

function ProblemModal({ item, onClose }) {
  const { add, update, toast } = useApp()
  const { f, bind } = useForm({ title: '', topic: DSA_TOPICS[0], difficulty: 'Easy', platform: 'LeetCode', link: '', solvedOn: toDateInput(), ...item })
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) return toast('Problem title is required', 'error')
    if (item.id) { update('dsaProblems', item.id, f); toast('Problem updated') }
    else { add('dsaProblems', f, `Solved ${f.title} (${f.difficulty})`); toast('Problem logged') }
    onClose()
  }
  return (
    <Modal onClose={onClose} title={item.id ? 'Edit problem' : 'Log solved problem'}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit" form="dsa-form">{item.id ? 'Save changes' : 'Log problem'}</button></>}>
      <form id="dsa-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Problem title *" className="sm:col-span-2"><input className="input" autoFocus {...bind('title')} /></Field>
        <Field label="Topic"><select className="input" {...bind('topic')}>{DSA_TOPICS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Difficulty"><select className="input" {...bind('difficulty')}>{DIFFICULTIES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Platform"><select className="input" {...bind('platform')}>{PLATFORMS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Solved on"><input type="date" className="input" {...bind('solvedOn')} /></Field>
        <Field label="Problem link" className="sm:col-span-2"><input type="url" className="input" placeholder="https://" {...bind('link')} /></Field>
      </form>
    </Modal>
  )
}

export default function DSA() {
  const { data, remove, toast } = useApp()
  const m = useMemo(() => computeMetrics(data), [data])
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState('All')
  const [diff, setDiff] = useState('All')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const list = useMemo(() => data.dsaProblems
    .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) && (topic === 'All' || p.topic === topic) && (diff === 'All' || p.difficulty === diff))
    .sort((a, b) => (b.solvedOn || '').localeCompare(a.solvedOn || '')), [data.dsaProblems, q, topic, diff])
  const pct = Math.round((m.solved / DSA_TARGET) * 100)

  return (
    <>
      <PageHeader title="DSA Tracker" subtitle="Topic-wise progress across every platform you practise on."
        actions={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Log problem</button>} />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <section className="card flex items-center gap-5 p-5">
          <ProgressRing value={pct} size={120} stroke={11} color="#1F9385">
            <div className="text-center"><span className="font-display text-3xl font-semibold text-slate-900 dark:text-white">{m.solved}</span><span className="block text-[11px] text-slate-500">of {DSA_TARGET}</span></div>
          </ProgressRing>
          <div className="flex-1 space-y-2.5">
            {m.byDifficulty.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{d.name}</span><span className="text-slate-500">{d.value}</span></div>
                <ProgressBar value={m.solved ? (d.value / m.solved) * 100 : 0} color={DIFF_COLOR[d.name]} height="h-1.5" />
              </div>
            ))}
          </div>
        </section>
        <section className="card p-5 lg:col-span-2">
          <CardHeader title="Problems by topic" sub="Stacked by difficulty" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.topics} margin={{ left: -24 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                <XAxis dataKey="topic" tick={{ ...axisTick, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} tickFormatter={(t) => (t.length > 8 ? t.split(/[ &]/)[0] : t)} />
                <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltip} />
                {DIFFICULTIES.map((d, i) => <Bar key={d} dataKey={d} stackId="a" fill={DIFF_COLOR[d]} radius={i === 2 ? [4, 4, 0, 0] : 0} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <CardHeader title="Topic progress" sub={`Target: ${TOPIC_TARGET} problems per topic`} />
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {m.topics.map((t) => (
              <div key={t.topic}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium text-slate-900 dark:text-white">{t.topic}</span><span className="text-xs text-slate-500">{t.total} / {TOPIC_TARGET}</span></div>
                <ProgressBar value={t.pct} color={t.pct >= 100 ? '#22C55E' : '#1F9385'} />
              </div>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <CardHeader title="Difficulty mix" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={m.byDifficulty} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3} stroke="none">{m.byDifficulty.map((d) => <Cell key={d.name} fill={DIFF_COLOR[d.name]} />)}</Pie>
                <Tooltip {...chartTooltip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search problems" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input w-auto" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic"><option>All</option>{DSA_TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="input w-auto" value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty"><option>All</option>{DIFFICULTIES.map((t) => <option key={t}>{t}</option>)}</select>
        <span className="ml-auto text-sm text-slate-500">{list.length} problems</span>
      </div>

      {list.length === 0 ? <EmptyState icon={Code2} title="No problems found" text="Log a solved problem or adjust your filters." action={<button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={16} />Log problem</button>} /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-white/10"><tr>{['Problem', 'Topic', 'Difficulty', 'Platform', 'Solved', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {list.slice(0, 50).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[.03]">
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{p.title}</td>
                  <td className="px-4 py-2.5">{p.topic}</td>
                  <td className="px-4 py-2.5"><Badge tone={DIFF_TONE[p.difficulty]}>{p.difficulty}</Badge></td>
                  <td className="px-4 py-2.5">{p.platform}</td><td className="px-4 py-2.5">{fmtDate(p.solvedOn)}</td>
                  <td className="px-4 py-2.5"><div className="flex justify-end gap-1">
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="icon-btn" aria-label="Open problem"><ExternalLink size={15} /></a>}
                    <button className="icon-btn" onClick={() => setEditing(p)} aria-label="Edit"><Pencil size={15} /></button>
                    <button className="icon-btn hover:text-red-600" onClick={() => setDeleting(p)} aria-label="Delete"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length > 50 && <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-white/5">Showing the 50 most recent. Use search or filters to narrow down.</p>}
        </div>
      )}

      {editing && <ProblemModal key={editing.id || 'new'} item={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!deleting} title="Delete problem" text={deleting && `Remove "${deleting.title}" from your log?`}
        onConfirm={() => { remove('dsaProblems', deleting.id); toast('Problem removed') }} onClose={() => setDeleting(null)} />
    </>
  )
}
