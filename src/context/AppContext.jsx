import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { repository, COLLECTIONS } from '../services/repository'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`
const ACT_TYPE = { applications: 'application', interviews: 'interview', dsaProblems: 'dsa', skills: 'skill', goals: 'goal', tasks: 'task', resumes: 'resume' }
const pushActivity = (list, text, type) => (text ? [{ id: uid('act'), text, type, time: new Date().toISOString() }, ...list].slice(0, 30) : list)

export function AppProvider({ children }) {
  const [data, setData] = useState(() => repository.loadAll())
  const [ready, setReady] = useState(false)
  const [toasts, setToasts] = useState([])
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))

  // brief loading state so skeletons are visible on first paint
  useEffect(() => { const t = setTimeout(() => setReady(true), 650); return () => clearTimeout(t) }, [])

  // persist through the repository (swap for API calls later)
  useEffect(() => { COLLECTIONS.forEach((k) => repository.save(k, data[k])) }, [data])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('placewise:theme', theme) } catch { /* ignore */ }
  }, [theme])

  const toast = useCallback((message, type = 'success') => {
    const id = uid('t')
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  const api = useMemo(() => ({
    add(col, item, activity) {
      const rec = { id: uid(col.slice(0, 3)), createdAt: new Date().toISOString(), ...item }
      setData((d) => ({ ...d, [col]: [rec, ...d[col]], activity: pushActivity(d.activity, activity, ACT_TYPE[col]) }))
      return rec
    },
    update(col, id, patch, activity) {
      setData((d) => ({ ...d, [col]: d[col].map((r) => (r.id === id ? { ...r, ...patch } : r)), activity: pushActivity(d.activity, activity, ACT_TYPE[col]) }))
    },
    remove(col, id, activity) {
      setData((d) => ({ ...d, [col]: d[col].filter((r) => r.id !== id), activity: pushActivity(d.activity, activity, ACT_TYPE[col]) }))
    },
    mutate(col, fn, activity) {
      setData((d) => ({ ...d, [col]: fn(d[col]), activity: pushActivity(d.activity, activity, ACT_TYPE[col]) }))
    },
    setProfile(patch) { setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })) },
    resetDemo() { setData(repository.reset()) },
  }), [])

  const value = { data, ready, theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), toasts, toast, dismissToast, ...api }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
