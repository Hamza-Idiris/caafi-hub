import { useEffect, useState } from 'react'
import { Package, Check, X, Truck } from 'lucide-react'
import { Badge, Button, Modal, Select, Spinner, Empty, PageHeader } from '../../components/ui'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const FILTERS = ['All', 'Pending', 'Approved', 'Dispatched', 'On The Way', 'Delivered', 'Rejected']

export default function StaffOrders() {
  const [orders,        setOrders]        = useState([])
  const [drivers,       setDrivers]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('All')
  const [dispatchOrder, setDispatchOrder] = useState(null)
  const [driverId,      setDriverId]      = useState('')
  const [dispatching,   setDispatching]   = useState(false)

  const load = async () => {
    setLoading(true)
    const params = filter !== 'All' ? `?status=${encodeURIComponent(filter)}` : ''
    const [oRes, dRes] = await Promise.all([
      api.get(`/orders${params}`),
      api.get('/staff/drivers'),
    ])
    setOrders(oRes.data.data)
    setDrivers(dRes.data.data)
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

  const handleDispatch = async () => {
    if (!driverId) { toast.error('Select a driver'); return }
    setDispatching(true)
    try {
      await api.patch(`/orders/${dispatchOrder._id}/dispatch`, { driverId })
      const name = drivers.find(d => d._id === driverId)?.name
      toast.success(`Dispatched to ${name}`)
      setDispatchOrder(null)
      setDriverId('')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Dispatch failed')
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Order Queue" subtitle="Review, approve, and dispatch incoming orders" />

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

                  {/* Pending → Approve / Reject */}
                  {o.status === 'Pending' && (
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="success" onClick={() => review(o._id, 'approve')}><Check size={12} /> Approve</Button>
                      <Button size="sm" variant="danger"  onClick={() => review(o._id, 'reject')}><X size={12} /> Reject</Button>
                    </div>
                  )}

                  {/* NEW — Approved → Dispatch directly from Staff */}
                  {o.status === 'Approved' && (
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="orange" onClick={() => { setDispatchOrder(o); setDriverId('') }}>
                        <Truck size={12} /> Dispatch
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

      {/* NEW — Dispatch Modal (same flow Admin uses) */}
      {dispatchOrder && (
        <Modal title="Dispatch Order" onClose={() => setDispatchOrder(null)}>
          <div className="flex flex-col gap-4">
            <div className="bg-primary/6 border border-primary/15 rounded-lg p-3">
              <div className="font-mono text-xs text-primary mb-1">{dispatchOrder._id?.slice(-6).toUpperCase()}</div>
              <div className="font-semibold text-slate-200">{dispatchOrder.shop?.shopName} — {dispatchOrder.quantity} barrels</div>
              <div className="text-xs text-slate-500 mt-0.5">{dispatchOrder.shop?.district}</div>
            </div>
            <Select label="Assign Driver" value={driverId} onChange={setDriverId}
              options={[
                { value: '', label: '— Select a driver —' },
                ...drivers.map(d => ({ value: d._id, label: `${d.name} (${d.plateNumber}) · ${d.vehicle}` }))
              ]}
            />
            <div className="flex gap-2 pt-1">
              <Button full onClick={handleDispatch} disabled={!driverId || dispatching}>
                {dispatching ? <Spinner size={15} className="text-white" /> : <><Truck size={14} /> Dispatch Now</>}
              </Button>
              <Button full variant="ghost" onClick={() => setDispatchOrder(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
