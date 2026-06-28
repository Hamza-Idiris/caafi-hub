import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart2, Package, Truck, Users, ShoppingBag, Droplets, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ThemeToggle from '../../components/ui/ThemeToggle'

const LINKS = [
  { to: '/admin',        label: 'Overview', icon: BarChart2,   end: true },
  { to: '/admin/orders', label: 'Orders',   icon: Package,     end: false },
  { to: '/admin/fleet',  label: 'Fleet',    icon: Truck,       end: false },
  { to: '/admin/users',  label: 'Users',    icon: Users,       end: false },
  { to: '/admin/shops',  label: 'Shops',    icon: ShoppingBag, end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col fixed top-0 left-0 h-full bg-secondary border-r border-white/5 z-30">
        <div className="px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Droplets size={16} className="text-white" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-slate-100 text-base leading-none">
                Caafi<span className="text-primary">-Hub</span>
              </div>
              <div className="text-[9px] text-sky-400 font-bold uppercase tracking-widest mt-0.5">Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150
                 ${isActive ? 'bg-primary/15 text-primary' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`
              }>
              {({ isActive }) => (
                <>
                  <l.icon size={15} />
                  <span className="flex-1">{l.label}</span>
                  {isActive && <ChevronRight size={12} className="text-primary/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-300 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-600">Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-secondary border-b border-white/5 px-4 h-14 flex items-center">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
            <Droplets size={14} className="text-white" />
          </div>
          <span className="font-heading font-bold text-slate-100">Caafi<span className="text-primary">-Hub</span></span>
        </div>
        <ThemeToggle />
        <button onClick={handleLogout} className="text-red-400 p-1 ml-2">
          <LogOut size={16} />
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-secondary border-t border-white/5 flex">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-semibold transition-colors
               ${isActive ? 'text-primary' : 'text-slate-600'}`
            }>
            {({ isActive }) => <><l.icon size={18} className={isActive ? 'text-primary' : 'text-slate-600'} />{l.label}</>}
          </NavLink>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-56 min-h-screen">

        {/* Desktop top header bar — Theme toggle visible here too */}
        <div className="hidden md:flex sticky top-0 z-20 h-14 glass border-b border-white/5 px-6 items-center justify-end gap-3">
          <span className="text-xs text-slate-500 font-medium mr-auto">
            Welcome back, <span className="text-slate-300 font-semibold">{user?.name}</span>
          </span>
          <ThemeToggle />
        </div>

        <div className="p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
