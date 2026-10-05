import { useState } from 'react'

export function useForm(initial) {
  const [f, setF] = useState(initial)
  const bind = (k) => ({ value: f[k] ?? '', onChange: (e) => setF((s) => ({ ...s, [k]: e.target.value })) })
  return { f, setF, bind }
}
