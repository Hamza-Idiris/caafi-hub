// Staff Layout
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Package, Users, Droplets, LogOut, BarChart2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const LINKS = [
  { to:'/staff',      label:'Summary',   icon:BarChart2 },
  { to:'/staff/orders',label:'Orders',  icon:Package   },
  { to:'/staff/crm',  label:'Customers', icon:Users     },
]

export function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/') }

  return (
    <div className="min-h-screen bg-dark flex">
      <aside className="hidden md:flex w-52 flex-col fixed top-0 left-0 h-full bg-secondary border-r border-white/5 z-30">
        <div className="px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Droplets size={16} className="text-white"/>
            </div>
            <div>
              <div className="font-heading font-extrabold text-slate-100 text-base">Caafi<span className="text-purple-400">-Hub</span></div>
              <div className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">Staff</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to==='/staff'}
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${isActive?'bg-purple-500/15 text-purple-400':'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <l.icon size={15}/>{l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="text-xs font-semibold text-slate-400 px-2 mb-2 truncate">{user?.name}</div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all">
            <LogOut size={13}/> Sign Out
          </button>
        </div>
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-secondary border-b border-white/5 px-4 h-14 flex items-center">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center"><Droplets size={14} className="text-white"/></div>
          <span className="font-heading font-bold text-slate-100">Caafi<span className="text-purple-400">-Hub</span></span>
        </div>
        <button onClick={handleLogout} className="text-red-400"><LogOut size={16}/></button>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-secondary border-t border-white/5 flex">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to==='/staff'} className={({isActive})=>`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-semibold ${isActive?'text-purple-400':'text-slate-600'}`}>
            {({isActive})=><><l.icon size={18} className={isActive?'text-purple-400':'text-slate-600'}/>{l.label}</>}
          </NavLink>
        ))}
      </div>
      <main className="flex-1 md:ml-52 min-h-screen">
        <div className="p-4 md:p-6 pt-16 md:pt-6 pb-20 md:pb-6"><Outlet/></div>
      </main>
    </div>
  )
}

// ─── Staff Summary ────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Clock, Check, Truck, CheckCircle } from 'lucide-react'
import { StatCard, Spinner } from '../../components/ui'
import api from '../../api/axios'

export function StaffSummary() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/staff/summary').then(r => setData(r.data.data)).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} className="text-purple-400"/></div>
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-slate-100">Staff Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Operations overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending"    value={data?.pending}    icon={Clock}        color="text-yellow-400"  bg="bg-yellow-400/10"/>
        <StatCard label="Approved"   value={data?.approved}   icon={Check}        color="text-purple-400"  bg="bg-purple-400/10"/>
        <StatCard label="In Transit" value={data?.inTransit}  icon={Truck}        color="text-orange-400"  bg="bg-orange-400/10"/>
        <StatCard label="Delivered"  value={data?.delivered}  icon={CheckCircle}  color="text-emerald-400" bg="bg-emerald-400/10"/>
      </div>
    </div>
  )
}

// ─── Staff Orders ─────────────────────────────────────────────────────────────
import { Badge, Button, Empty, PageHeader } from '../../components/ui'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export function StaffOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  const load = async () => {
    setLoading(true)
    const params = filter !== 'All' ? `?status=${filter}` : ''
    const r = await api.get(`/orders${params}`)
    setOrders(r.data.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [filter])

  const review = async (id, action) => {
    try {
      await api.patch(`/orders/${id}/review`, { action })
      toast.success(`Order ${action}d`)
      load()
    } catch(e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const FILTERS = ['All','Pending','Approved','Dispatched','On The Way','Delivered','Rejected']

  return (
    <div className="animate-fade-up">
      <PageHeader title="Order Queue" subtitle="Review and process incoming orders" />
      <div className="flex gap-1.5 flex-wrap mb-5">
        {FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filter===s?'bg-purple-500 text-white border-purple-500':'bg-white/3 text-slate-500 border-white/6 hover:border-white/15'}`}>
            {s}
          </button>
        ))}
      </div>
      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-purple-400"/></div>
        : orders.length === 0
          ? <Empty icon={Package} message="No orders" />
          : (
          <div className="flex flex-col gap-2">
            {orders.map(o => (
              <div key={o._id} className="card p-4 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-slate-600">{o._id?.slice(-6).toUpperCase()}</span>
                    <Badge status={o.status}/>
                  </div>
                  <div className="font-semibold text-slate-200 text-sm">{o.shop?.shopName}</div>
                  <div className="text-[11px] text-slate-500">{o.shop?.district} · {o.createdAt?.slice(0,10)}</div>
                </div>
                <div className="font-mono text-xl font-bold text-primary text-center">
                  {o.quantity}<div className="text-[10px] text-slate-600 font-normal">barrels</div>
                </div>
                {o.plateNumber && <div className="text-center"><div className="font-mono text-xs text-orange-400 font-bold">{o.plateNumber}</div><div className="text-[10px] text-slate-500">{o.assignedDriver?.name}</div></div>}
                {o.status === 'Pending' && (
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="success" onClick={() => review(o._id,'approve')}><Check size={12}/> Approve</Button>
                    <Button size="sm" variant="danger"  onClick={() => review(o._id,'reject')}><X size={12}/> Reject</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ─── Staff CRM ────────────────────────────────────────────────────────────────
import { Search, Edit2, Phone as PhoneIcon, MapPin as MapPinIcon } from 'lucide-react'
import { Modal, Input as Inp, Select as Sel } from '../../components/ui'

const DISTRICTS = ['Hodan','Wadajir','Karaan','Heliwa','Dharkenley','Kaxda','Boondheere','Hawl-Wadaag','Shangani','Yaaqshid']

export function StaffCRM() {
  const [shops,   setShops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [saving,  setSaving]  = useState(false)

  const load = async (q='') => {
    setLoading(true)
    const r = await api.get(`/staff/shops${q?`?search=${q}`:''}`)
    setShops(r.data.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openEdit = (s) => { setEditing(s); setForm({ ownerName:s.ownerName, phone:s.phone, district:s.district, address:s.address||'' }) }

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/staff/shops/${editing._id}`, form)
      toast.success('Customer updated'); setEditing(null); load(search)
    } catch(e) { toast.error(e.response?.data?.message||'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Customer Directory" subtitle={`${shops.length} registered shops`} />
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <input value={search} onChange={e => { setSearch(e.target.value); load(e.target.value) }}
          placeholder="Search by name, phone or district..."
          className="input-field pl-9" />
      </div>
      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-purple-400"/></div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {shops.map(s => (
              <div key={s._id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center"><Users size={16} className="text-purple-400"/></div>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Edit2 size={11}/></Button>
                </div>
                <div className="font-semibold text-slate-200 mb-0.5">{s.shopName}</div>
                <div className="text-xs text-slate-400 mb-2">{s.ownerName}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1"><PhoneIcon size={10}/>{s.phone}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600"><MapPinIcon size={10}/>{s.district}</div>
              </div>
            ))}
          </div>
      }
      {editing && (
        <Modal title={`Edit — ${editing.shopName}`} onClose={() => setEditing(null)}>
          <div className="flex flex-col gap-3">
            <Inp label="Owner Name" value={form.ownerName} onChange={v => setForm({...form,ownerName:v})} />
            <Inp label="Phone"      value={form.phone}     onChange={v => setForm({...form,phone:v})} />
            <Sel label="District"   value={form.district}  onChange={v => setForm({...form,district:v})} options={DISTRICTS} />
            <Inp label="Address"    value={form.address}   onChange={v => setForm({...form,address:v})} placeholder="Street or landmark" />
            <div className="flex gap-2 pt-1">
              <Button full onClick={save} disabled={saving}>{saving?<Spinner size={15} className="text-white"/>:'Save Changes'}</Button>
              <Button full variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
