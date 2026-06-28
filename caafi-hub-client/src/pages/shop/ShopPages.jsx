// ─── Shop Layout ──────────────────────────────────────────────────────────────
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Plus, History, User, Droplets, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const LINKS = [
  { to:'/shop',          label:'Order',   icon:Plus    },
  { to:'/shop/history',  label:'History', icon:History },
  { to:'/shop/profile',  label:'Profile', icon:User    },
]

export function ShopLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/') }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 h-14 flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
          <Droplets size={16} className="text-white"/>
        </div>
        <div>
          <span className="font-heading font-extrabold text-slate-100">Caafi<span className="text-emerald-400">-Hub</span></span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full ml-2">Shop</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 ml-4">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to==='/shop'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                 ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`
              }>
              <l.icon size={13}/>{l.label}
            </NavLink>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block text-xs text-slate-400 font-medium truncate max-w-[120px]">{user?.shopName}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-red-400 text-xs font-semibold bg-red-500/8 border border-red-500/15 px-3 py-1.5 rounded-lg">
            <LogOut size={13}/> <span className="hidden sm:inline">Out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-16 sm:pb-0">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <Outlet/>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-secondary border-t border-white/5 flex">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to==='/shop'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold transition-colors
               ${isActive ? 'text-emerald-400' : 'text-slate-600'}`
            }>
            {({ isActive }) => <><l.icon size={19} className={isActive ? 'text-emerald-400' : 'text-slate-600'}/>{l.label}</>}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

// ─── Place Order ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Package, Droplets as Drop, Clock, Check, ChevronRight, AlertCircle } from 'lucide-react'
import { Badge, Button, Input, Spinner, StatCard, Empty } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export function ShopPlaceOrder() {
  const { user }  = useAuth()
  const [qty,     setQty]     = useState('')
  const [note,    setNote]    = useState('')
  const [qtyErr,  setQtyErr]  = useState('')
  const [placing, setPlacing] = useState(false)
  const [active,  setActive]  = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const loadActive = async () => {
    setLoadingOrders(true)
    const r = await api.get('/orders/my-orders')
    setActive(r.data.data.filter(o => o.status !== 'Delivered').slice(0,5))
    setLoadingOrders(false)
  }
  useEffect(() => { loadActive() }, [])

  const place = async () => {
    setQtyErr('')
    const n = parseInt(qty)
    if (isNaN(n) || n < 10) { setQtyErr('Minimum order is 10 barrels.'); return }
    setPlacing(true)
    try {
      await api.post('/orders', { quantity: n, note })
      toast.success(`Order for ${n} barrels placed!`)
      setQty(''); setNote(''); loadActive()
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to place order') }
    finally { setPlacing(false) }
  }

  const delivered  = 0
  const totalBarrels = 0

  return (
    <div className="animate-fade-up">
      {/* Welcome */}
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-extrabold text-slate-100">
          Welcome, <span className="text-emerald-400">{user?.shopName}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">{user?.district} District · {user?.phone}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Order form */}
        <div className="card p-5">
          <h2 className="font-heading text-[15px] font-bold text-slate-100 mb-4">Place New Order</h2>
          <div className="flex flex-col gap-4">
            <Input label="Quantity (20L Barrels)" value={qty} onChange={setQty}
              type="number" placeholder="Min. 10 barrels" error={qtyErr} />

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Delivery instructions..."
                rows={2}
                className="input-field resize-none" />
            </div>

            {/* Info box */}
            <div className="bg-emerald-500/6 border border-emerald-500/15 rounded-lg p-3 text-xs text-emerald-300 space-y-1 leading-relaxed">
              <div>📦 Each barrel = <strong>20 Litres</strong></div>
              <div>⚠️ Minimum order: <strong>10 barrels</strong></div>
              {parseInt(qty) >= 10 && (
                <div className="text-emerald-400 font-semibold">
                  ✓ Total: {parseInt(qty)} × 20L = {parseInt(qty) * 20}L
                </div>
              )}
            </div>

            <Button full onClick={place} disabled={placing}>
              {placing
                ? <Spinner size={16} className="text-white"/>
                : <><Package size={14}/> Submit Order <ChevronRight size={14}/></>
              }
            </Button>
          </div>
        </div>

        {/* Active orders */}
        <div className="card p-5">
          <h2 className="font-heading text-[15px] font-bold text-slate-100 mb-4">Active Orders</h2>
          {loadingOrders
            ? <div className="flex justify-center py-8"><Spinner size={22} className="text-emerald-400"/></div>
            : active.length === 0
              ? <Empty icon={Package} message="No active orders" />
              : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto no-scrollbar">
                {active.map(o => (
                  <div key={o._id} className="flex items-center justify-between p-3 bg-white/2 rounded-lg border border-white/4">
                    <div>
                      <div className="font-mono text-[11px] text-slate-600 mb-1">{o._id?.slice(-6).toUpperCase()}</div>
                      <div className="font-semibold text-slate-200 text-sm">{o.quantity} barrels</div>
                      {o.assignedDriver && (
                        <div className="text-[11px] text-slate-500 mt-0.5">🚛 {o.assignedDriver?.name}</div>
                      )}
                    </div>
                    <Badge status={o.status}/>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

// ─── Order History ────────────────────────────────────────────────────────────
export function ShopHistory() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  useEffect(() => {
    api.get('/orders/my-orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [])

  const STATUSES = ['All','Pending','Approved','Dispatched','On The Way','Delivered','Rejected']
  const shown = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  const totalDelivered = orders.filter(o => o.status==='Delivered').reduce((s,o) => s+o.quantity, 0)
  const activeCount    = orders.filter(o => !['Delivered','Rejected'].includes(o.status)).length

  return (
    <div className="animate-fade-up">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold text-slate-100">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">{orders.length} orders · {totalDelivered} barrels delivered · {activeCount} active</p>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${filter===s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/3 text-slate-500 border-white/6 hover:border-white/15'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-emerald-400"/></div>
        : shown.length === 0
          ? <Empty icon={History} message="No orders in this category" />
          : (
          <div className="flex flex-col gap-2">
            {shown.map(o => (
              <div key={o._id} className="card p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package size={15} className="text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-600">{o._id?.slice(-6).toUpperCase()}</span>
                    <Badge status={o.status}/>
                  </div>
                  <div className="font-semibold text-slate-200 text-sm">{o.quantity} × 20L Barrels</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {o.createdAt?.slice(0,10)}
                    {o.plateNumber && ` · ${o.plateNumber}`}
                    {o.assignedDriver?.name && ` · ${o.assignedDriver.name}`}
                  </div>
                </div>
                <div className="font-mono text-lg font-bold text-primary flex-shrink-0">{o.quantity}</div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ─── Shop Profile ─────────────────────────────────────────────────────────────
import { Edit2, Save, X } from 'lucide-react'
import { Select } from '../../components/ui'

const DISTRICTS = ['Hodan','Wadajir','Karaan','Heliwa','Dharkenley','Kaxda','Boondheere','Hawl-Wadaag','Shangani','Yaaqshid']

export function ShopProfile() {
  const { user, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({ ownerName:'', phone:'', district:'', address:'' })
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (user) setForm({ ownerName:user.ownerName||'', phone:user.phone||'', district:user.district||'Hodan', address:user.address||'' })
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/shops/profile', form)
      // Update stored user
      const updated = { ...user, ...data.data }
      localStorage.setItem('caafi_user', JSON.stringify(updated))
      toast.success('Profile updated')
      setEditing(false)
    } catch(e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const fields = [
    { label:'Shop Name',    value:user?.shopName,  key:null },
    { label:'Owner Name',   value:user?.ownerName, key:'ownerName' },
    { label:'Phone Number', value:user?.phone,      key:'phone' },
    { label:'District',     value:user?.district,   key:'district' },
    { label:'Member Since', value:user?.createdAt?.slice(0,10), key:null },
  ]

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-xl font-bold text-slate-100">Shop Profile</h1>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? <><X size={13}/> Cancel</> : <><Edit2 size={13}/> Edit</>}
        </Button>
      </div>

      <div className="card p-5">
        {/* Avatar section */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
          <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400 font-heading text-2xl font-bold">
            {user?.shopName?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-slate-100">{user?.shopName}</div>
            <div className="text-sm text-slate-500">{user?.district} · Mogadishu</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full inline-block">Active Account</div>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            <Input label="Owner Name"   value={form.ownerName} onChange={v => setForm({...form,ownerName:v})} />
            <Input label="Phone Number" value={form.phone}     onChange={v => setForm({...form,phone:v})} />
            <Select label="District"    value={form.district}  onChange={v => setForm({...form,district:v})} options={DISTRICTS} />
            <Input label="Address"      value={form.address}   onChange={v => setForm({...form,address:v})} placeholder="Street or landmark (optional)" />
            <div className="flex gap-2 pt-1">
              <Button full onClick={save} disabled={saving}>
                {saving ? <Spinner size={15} className="text-white"/> : <><Save size={14}/> Save Changes</>}
              </Button>
              <Button full variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.label} className="bg-white/2 border border-white/4 rounded-lg p-3">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">{f.label}</div>
                <div className="text-sm font-medium text-slate-200">{f.value || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
