import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Droplets, LogOut, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLE_COLOR = {
  admin:  'bg-sky-500/15 text-sky-400 border-sky-500/25',
  staff:  'bg-purple-500/15 text-purple-400 border-purple-500/25',
  driver: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  shop:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

export default function Navbar({ links = [] }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  const displayName = user?.name || user?.shopName || 'User'
  const role        = user?.role || ''

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5 h-14 flex items-center px-4 gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center glow-blue">
          <Droplets size={16} className="text-white" />
        </div>
        <span className="font-heading font-extrabold text-slate-100 text-lg leading-none">
          Caafi<span className="text-primary">-Hub</span>
        </span>
      </div>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
               ${isActive ? 'bg-primary/15 text-primary' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`
            }>
            <l.icon size={14} />{l.label}
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${ROLE_COLOR[role]}`}>
          {role}
        </span>
        <span className="hidden sm:block text-xs text-slate-400 font-medium max-w-[120px] truncate">{displayName}</span>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-all">
          <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
        </button>
        {/* Mobile menu toggle */}
        {links.length > 0 && (
          <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 text-slate-400 hover:text-slate-200">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {open && links.length > 0 && (
        <div className="absolute top-14 left-0 right-0 bg-secondary border-b border-white/5 p-2 flex flex-col gap-1 md:hidden z-50">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${isActive ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:bg-white/5'}`
              }>
              <l.icon size={16} />{l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
