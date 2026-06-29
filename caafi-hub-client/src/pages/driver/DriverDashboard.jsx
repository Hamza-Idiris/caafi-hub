import { useEffect, useState } from 'react'
import { Truck, MapPin, Phone, Check, Navigation, Droplets, LogOut, CheckCircle, Package } from 'lucide-react'
import { Badge, Button, Spinner, Empty } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ui/ThemeToggle'

export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [stats,    setStats]    = useState({})
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('active')
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    const [oRes, sRes] = await Promise.all([
      api.get('/driver/deliveries'),
      api.get('/driver/stats'),
    ])
    setOrders(oRes.data.data)
    setStats(sRes.data.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const update = async (id, status) => {
    setUpdating(id)
    try {
      await api.patch(`/driver/deliveries/${id}/status`, { status })
      toast.success(`Marked as ${status}`)
      load()
    } catch(e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setUpdating(null) }
  }

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/') }

  const active    = orders.filter(o => ['Dispatched','On The Way'].includes(o.status))
  const delivered = orders.filter(o => o.status === 'Delivered')
  const shown = filter === 'active' ? active : filter === 'done' ? delivered : orders

  return (
    <div className="min-h-screen bg-dark">
      {/* Top nav */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 h-14 flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-orange-600 rounded-lg flex items-center justify-center">
          <Droplets size={16} className="text-white"/>
        </div>
        <span className="font-heading font-extrabold text-slate-100">Caafi<span className="text-accent">-Hub</span></span>
        <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full ml-1">Driver</span>

        {/* NEW — Theme toggle + Logout grouped on the right */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 text-xs font-semibold bg-red-500/8 border border-red-500/15 px-3 py-1.5 rounded-lg">
            <LogOut size={13}/> Out
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Driver card */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-primary/5 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500/12 rounded-2xl flex items-center justify-center">
              <Truck size={24} className="text-orange-400"/>
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-slate-100">{user?.name}</div>
              <div className="font-mono text-sm text-orange-400">{user?.plateNumber}</div>
              <div className="text-xs text-slate-500">{user?.vehicle}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l:'Active',    v:stats.active,    c:'text-orange-400' },
              { l:'Delivered', v:stats.delivered, c:'text-emerald-400' },
              { l:'Total',     v:stats.total,     c:'text-primary' },
            ].map(s => (
              <div key={s.l} className="bg-black/30 rounded-xl p-3 text-center">
                <div className={`font-mono text-2xl font-bold ${s.c}`}>{s.v ?? '—'}</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { k:'active',   l:`Active (${active.length})` },
            { k:'done',     l:`Done (${delivered.length})` },
            { k:'all',      l:`All (${orders.length})` },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                ${filter===f.k ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' : 'bg-white/3 text-slate-500 border-white/6'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Deliveries */}
        {loading
          ? <div className="flex justify-center py-16"><Spinner size={28} className="text-orange-400"/></div>
          : shown.length === 0
            ? <Empty icon={Truck} message="No deliveries" />
            : (
            <div className="flex flex-col gap-3">
              {shown.map(o => (
                <div key={o._id} className="card p-4 border border-white/5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 text-base">{o.shop?.shopName}</div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                        <MapPin size={11}/>{o.shop?.district}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <Phone size={11}/>{o.shop?.phone}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge status={o.status} />
                      <div className="font-mono text-2xl font-bold text-primary mt-2">{o.quantity}</div>
                      <div className="text-[10px] text-slate-600">barrels</div>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-slate-700 mb-3">{o._id?.slice(-8).toUpperCase()}</div>
                  {o.status === 'Dispatched' && (
                    <Button full variant="orange" onClick={() => update(o._id,'On The Way')} disabled={updating===o._id}>
                      {updating===o._id ? <Spinner size={15} className="text-orange-400"/> : <><Navigation size={14}/> Mark On The Way</>}
                    </Button>
                  )}
                  {o.status === 'On The Way' && (
                    <Button full variant="success" onClick={() => update(o._id,'Delivered')} disabled={updating===o._id}>
                      {updating===o._id ? <Spinner size={15} className="text-emerald-400"/> : <><Check size={14}/> Confirm Delivery ✓</>}
                    </Button>
                  )}
                  {o.status === 'Delivered' && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <CheckCircle size={16}/> Delivered on {o.deliveredAt?.slice(0,10)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
