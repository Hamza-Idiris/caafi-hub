import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`
        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
        ${dark
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-700'
          : 'bg-yellow-50  text-yellow-500 hover:bg-yellow-100 border border-yellow-200'
        }
      `}
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
