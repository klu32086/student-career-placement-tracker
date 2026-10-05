import { useEffect } from 'react'
import { X, AlertTriangle, Inbox } from 'lucide-react'
import { cn } from '../lib/utils'

export function Modal({ open = true, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title}
        className={cn('relative flex max-h-[92vh] w-full animate-pop flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-panel dark:ring-1 dark:ring-white/10 sm:rounded-2xl', size === 'lg' ? 'sm:max-w-2xl' : size === 'xl' ? 'sm:max-w-4xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-white/10">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button>
      </>}>
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"><AlertTriangle size={18} /></span>
        <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </Modal>
  )
}

const TONES = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  blue: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  teal: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
}
export const Badge = ({ tone = 'slate', children, className }) => (
  <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone], className)}>{children}</span>
)

export function ProgressRing({ value = 0, size = 96, stroke = 9, color = '#1F9385', track = 'text-slate-200 dark:text-white/10', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(Math.max(value, 0), 100) / 100)} style={{ transition: 'stroke-dashoffset .9s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export const ProgressBar = ({ value = 0, color = '#1F9385', track = 'bg-slate-100 dark:bg-white/10', height = 'h-2' }) => (
  <div className={cn('w-full overflow-hidden rounded-full', track, height)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full" style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, background: color, transition: 'width .7s ease' }} />
  </div>
)

export const Field = ({ label, children, className }) => (
  <label className={cn('block', className)}><span className="label">{label}</span>{children}</label>
)

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
)

export const EmptyState = ({ icon: Icon = Inbox, title, text, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-white/15">
    <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Icon size={22} /></span>
    <h3 className="mt-4 text-base font-semibold">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/10', className)} />

export const CardHeader = ({ title, action, sub }) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div><h3 className="text-base font-semibold">{title}</h3>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div>
    {action}
  </div>
)

export const chartTooltip = {
  contentStyle: { background: 'var(--tt)', border: '1px solid rgba(148,163,184,.25)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', fontSize: 12 },
  itemStyle: { color: 'inherit' },
  cursor: { fill: 'rgba(148,163,184,.12)' },
}
export const axisTick = { fill: '#94a3b8', fontSize: 12 }
