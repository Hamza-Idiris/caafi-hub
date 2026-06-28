import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Plus, History, User, Droplets, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ThemeToggle from '../../components/ui/ThemeToggle'

const LINKS = [
  { to: '/shop',         label: 'Order',   icon: Plus,    end: true  },
  { to: '/shop/history', label: 'History', icon: History, end: false },
  { to: '/shop/profile', label: 'Profile', icon: User,    end: false },
]

export default function ShopLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/') }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-white/5 h-14 flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
          <Droplets size={16} className="text-white" />
        </div>
        <div>
          <span className="font-heading font-extrabold text-slate-100">Caafi<span className="text-emerald-400">-Hub</span></span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full ml-2">Shop</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 ml-4">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                 ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`
              }>
              <l.icon size={13} />{l.label}
            </NavLink>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block text-xs text-slate-400 font-medium truncate max-w-[120px]">{user?.shopName}</span>
          <ThemeToggle />
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-red-400 text-xs font-semibold bg-red-500/8 border border-red-500/15 px-3 py-1.5 rounded-lg">
            <LogOut size={13} /><span className="hidden sm:inline">Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-16 sm:pb-0">
        <div className="max-w-3xl mx-auto p-4 md:p-6"><Outlet /></div>
      </main>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-secondary border-t border-white/5 flex">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold transition-colors
               ${isActive ? 'text-emerald-400' : 'text-slate-600'}`
            }>
            {({ isActive }) => <><l.icon size={19} className={isActive ? 'text-emerald-400' : 'text-slate-600'} />{l.label}</>}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
