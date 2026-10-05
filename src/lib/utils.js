export const cn = (...a) => a.filter(Boolean).join(' ')
const pad = (n) => String(n).padStart(2, '0')
export const toDateInput = (x = new Date()) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
export const toDateTimeInput = (x) => `${toDateInput(x)}T${pad(x.getHours())}:${pad(x.getMinutes())}`
const parse = (s) => new Date(s.length === 10 ? s + 'T00:00' : s)
export const fmtDate = (s) => (s ? parse(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
export const fmtDateTime = (s) => (s ? parse(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—')
export const fmtTime = (s) => (s ? parse(s).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '')
export const daysUntil = (s) => {
  if (!s) return null
  const t = parse(s); t.setHours(0, 0, 0, 0)
  const n = new Date(); n.setHours(0, 0, 0, 0)
  return Math.round((t - n) / 86400000)
}
export const dueLabel = (s) => {
  const n = daysUntil(s)
  if (n === null) return ''
  if (n < 0) return `${-n}d overdue`
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  return `In ${n} days`
}
export const timeAgo = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
export const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'S'
export const download = (filename, content, type = 'text/plain') => {
  const isData = content.startsWith('data:')
  const url = isData ? content : URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove()
  if (!isData) setTimeout(() => URL.revokeObjectURL(url), 1000)
}
