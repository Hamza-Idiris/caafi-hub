import { useEffect, useState } from 'react'
import { Users, Phone, MapPin, Trash2, ShoppingBag } from 'lucide-react'
import { Button, Spinner, Empty, PageHeader } from '../../components/ui'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminShops() {
  const [shops,   setShops]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/shops').then(r => setShops(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggle = async (id) => {
    await api.patch(`/admin/shops/${id}/toggle`)
    toast.success('Shop status updated')
    load()
  }

  const del = async (id) => {
    if (!confirm('Permanently delete this shop?')) return
    await api.delete(`/admin/shops/${id}`)
    toast.success('Shop removed')
    load()
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Registered Shops" subtitle={`${shops.length} B2B clients`} />

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-primary" /></div>
        : shops.length === 0
          ? <Empty icon={ShoppingBag} message="No shops registered yet" />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {shops.map(s => (
                <div key={s._id} className={`card p-4 border ${s.isActive ? 'border-white/6' : 'border-red-500/15'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!s.isActive && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">Inactive</span>
                      )}
                      <span className="font-mono text-[10px] text-slate-600">{s.createdAt?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-200 mb-0.5">{s.shopName}</div>
                  <div className="text-xs text-slate-400 mb-3">{s.ownerName}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1"><Phone size={10} />{s.phone}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-4"><MapPin size={10} />{s.district}</div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant={s.isActive ? 'danger' : 'success'} onClick={() => toggle(s._id)}>
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => del(s._id)}><Trash2 size={11} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
