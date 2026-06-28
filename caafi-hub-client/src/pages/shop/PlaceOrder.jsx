import { useEffect, useState } from 'react'
import { Package, ChevronRight } from 'lucide-react'
import { Badge, Button, Input, Spinner, Empty } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ShopPlaceOrder() {
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
    setActive(r.data.data.filter(o => o.status !== 'Delivered').slice(0, 5))
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
      setQty('')
      setNote('')
      loadActive()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-extrabold text-slate-100">
          Welcome, <span className="text-emerald-400">{user?.shopName}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">{user?.district} District · {user?.phone}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="input-field resize-none w-full" />
            </div>
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
                ? <Spinner size={16} className="text-white" />
                : <><Package size={14} /> Submit Order <ChevronRight size={14} /></>
              }
            </Button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-heading text-[15px] font-bold text-slate-100 mb-4">Active Orders</h2>
          {loadingOrders
            ? <div className="flex justify-center py-8"><Spinner size={22} className="text-emerald-400" /></div>
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
                      <Badge status={o.status} />
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
