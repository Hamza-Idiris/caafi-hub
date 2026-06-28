import { useEffect, useState } from 'react'
import { Package, Check, X } from 'lucide-react'
import { Badge, Button, Spinner, Empty, PageHeader } from '../../components/ui'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const FILTERS = ['All', 'Pending', 'Approved', 'Dispatched', 'On The Way', 'Delivered', 'Rejected']

export default function StaffOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  const load = async () => {
    setLoading(true)
    const params = filter !== 'All' ? `?status=${encodeURIComponent(filter)}` : ''
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
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Order Queue" subtitle="Review and process incoming orders" />

      <div className="flex gap-1.5 flex-wrap mb-5">
        {FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${filter === s ? 'bg-purple-500 text-white border-purple-500' : 'bg-white/3 text-slate-500 border-white/6 hover:border-white/15'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-purple-400" /></div>
        : orders.length === 0
          ? <Empty icon={Package} message="No orders found" />
          : (
            <div className="flex flex-col gap-2">
              {orders.map(o => (
                <div key={o._id} className="card p-4 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] text-slate-600">{o._id?.slice(-6).toUpperCase()}</span>
                      <Badge status={o.status} />
                    </div>
                    <div className="font-semibold text-slate-200 text-sm">{o.shop?.shopName}</div>
                    <div className="text-[11px] text-slate-500">{o.shop?.district} · {o.createdAt?.slice(0, 10)}</div>
                  </div>
                  <div className="font-mono text-xl font-bold text-primary text-center">
                    {o.quantity}
                    <div className="text-[10px] text-slate-600 font-normal">barrels</div>
                  </div>
                  {o.plateNumber && (
                    <div className="text-center">
                      <div className="font-mono text-xs text-orange-400 font-bold">{o.plateNumber}</div>
                      <div className="text-[10px] text-slate-500">{o.assignedDriver?.name}</div>
                    </div>
                  )}
                  {o.status === 'Pending' && (
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="success" onClick={() => review(o._id, 'approve')}><Check size={12} /> Approve</Button>
                      <Button size="sm" variant="danger"  onClick={() => review(o._id, 'reject')}><X size={12} /> Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
