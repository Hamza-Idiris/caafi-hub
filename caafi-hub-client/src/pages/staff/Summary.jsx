import { useEffect, useState } from 'react'
import { Clock, Check, Truck, CheckCircle, ShoppingBag } from 'lucide-react'
import { StatCard, Spinner } from '../../components/ui'
import api from '../../api/axios'

export default function StaffSummary() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/summary').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} className="text-purple-400" /></div>

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-slate-100">Staff Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Operations overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Pending"    value={data?.pending}    icon={Clock}        color="text-yellow-400"  bg="bg-yellow-400/10" />
        <StatCard label="Approved"   value={data?.approved}   icon={Check}        color="text-purple-400"  bg="bg-purple-400/10" />
        <StatCard label="In Transit" value={data?.inTransit}  icon={Truck}        color="text-orange-400"  bg="bg-orange-400/10" />
        <StatCard label="Delivered"  value={data?.delivered}  icon={CheckCircle}  color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard label="Total Shops"value={data?.totalShops} icon={ShoppingBag}  color="text-primary"     bg="bg-primary/10" />
      </div>
    </div>
  )
}
