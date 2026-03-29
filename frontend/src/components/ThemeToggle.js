import { useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}