import { useEffect, useState } from 'react'
import { Package, History } from 'lucide-react'
import { Badge, Spinner, Empty } from '../../components/ui'
import api from '../../api/axios'

const STATUSES = ['All', 'Pending', 'Approved', 'Dispatched', 'On The Way', 'Delivered', 'Rejected']

export default function ShopHistory() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  useEffect(() => {
    api.get('/orders/my-orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [])

  const shown          = filter === 'All' ? orders : orders.filter(o => o.status === filter)
  const totalDelivered = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.quantity, 0)
  const activeCount    = orders.filter(o => !['Delivered', 'Rejected'].includes(o.status)).length

  return (
    <div className="animate-fade-up">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold text-slate-100">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">
          {orders.length} orders · {totalDelivered} barrels delivered · {activeCount} active
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${filter === s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/3 text-slate-500 border-white/6 hover:border-white/15'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-emerald-400" /></div>
        : shown.length === 0
          ? <Empty icon={History} message="No orders in this category" />
          : (
            <div className="flex flex-col gap-2">
              {shown.map(o => (
                <div key={o._id} className="card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] text-slate-600">{o._id?.slice(-6).toUpperCase()}</span>
                      <Badge status={o.status} />
                    </div>
                    <div className="font-semibold text-slate-200 text-sm">{o.quantity} × 20L Barrels</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {o.createdAt?.slice(0, 10)}
                      {o.plateNumber && ` · ${o.plateNumber}`}
                      {o.assignedDriver?.name && ` · ${o.assignedDriver.name}`}
                    </div>
                  </div>
                  <div className="font-mono text-lg font-bold text-primary flex-shrink-0">{o.quantity}</div>
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
