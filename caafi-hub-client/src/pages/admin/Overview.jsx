import { useEffect, useState } from 'react'
import { Package, Truck, Users, ShoppingBag, Clock, CheckCircle, Check } from 'lucide-react'
import { StatCard, Badge, Spinner, Empty } from '../../components/ui'
import api from '../../api/axios'

export default function AdminOverview() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} className="text-primary" /></div>

  const { orders = {}, shops = 0, drivers = 0, staff = 0, recentOrders = [] } = stats || {}

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-slate-100">Operations Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Live system dashboard · Caafi-Hub</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Pending"    value={orders.pending}   icon={Clock}        color="text-yellow-400"  bg="bg-yellow-400/10" />
        <StatCard label="Approved"   value={orders.approved}  icon={Check}        color="text-sky-400"     bg="bg-sky-400/10" />
        <StatCard label="In Transit" value={orders.inTransit} icon={Truck}        color="text-orange-400"  bg="bg-orange-400/10" />
        <StatCard label="Delivered"  value={orders.delivered} icon={CheckCircle}  color="text-emerald-400" bg="bg-emerald-400/10" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Active Drivers" value={drivers} icon={Truck}       color="text-orange-400"  bg="bg-orange-400/10" />
        <StatCard label="Staff Members"  value={staff}   icon={Users}       color="text-purple-400"  bg="bg-purple-400/10" />
        <StatCard label="Shops Onboard"  value={shops}   icon={ShoppingBag} color="text-emerald-400" bg="bg-emerald-400/10" />
      </div>

      <div className="card p-5">
        <h2 className="font-heading text-[15px] font-bold text-slate-100 mb-4">Recent Orders</h2>
        {recentOrders.length === 0
          ? <Empty icon={Package} message="No orders yet" />
          : (
            <div className="flex flex-col">
              {recentOrders.map(o => (
                <div key={o._id} className="flex items-center gap-3 py-3 border-b border-white/4 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">{o.shop?.shopName}</div>
                    <div className="text-[11px] text-slate-500">{o.shop?.district} · {o.createdAt?.slice(0, 10)}</div>
                  </div>
                  <div className="font-mono text-sm font-bold text-primary mr-2">
                    {o.quantity}<span className="text-slate-600 text-[10px] font-normal"> brl</span>
                  </div>
                  <Badge status={o.status} />
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
