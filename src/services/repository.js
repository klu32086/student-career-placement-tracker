/**
 * Data access layer.
 *
 * Today every function reads/writes LocalStorage. When the Express + MongoDB
 * backend arrives, only this file needs to change: replace each body with a
 * fetch()/axios call (e.g. GET /api/applications, PUT /api/profile) and make the
 * functions async. The rest of the app talks to AppContext, never to storage.
 */
import { makeSeed } from '../data/seed'

const NS = 'placewise:v1:'
export const COLLECTIONS = ['profile', 'applications', 'interviews', 'dsaProblems', 'skills', 'goals', 'tasks', 'resumes', 'activity']

export const repository = {
  loadAll() {
    const seed = makeSeed()
    const out = {}
    COLLECTIONS.forEach((k) => {
      try {
        const raw = localStorage.getItem(NS + k)
        out[k] = raw ? JSON.parse(raw) : seed[k]
      } catch {
        out[k] = seed[k]
      }
    })
    return out
  },
  save(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value))
    } catch (e) {
      console.warn(`Could not persist "${key}" (storage full?)`, e)
    }
  },
  reset() {
    COLLECTIONS.forEach((k) => localStorage.removeItem(NS + k))
    return makeSeed()
  },
}
