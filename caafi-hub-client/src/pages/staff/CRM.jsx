import { useEffect, useState } from 'react'
import { Users, Search, Edit2, Phone, MapPin } from 'lucide-react'
import { Button, Modal, Input, Select, Spinner, Empty, PageHeader } from '../../components/ui'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const DISTRICTS = ['Hodan','Wadajir','Karaan','Heliwa','Dharkenley','Kaxda','Boondheere','Hawl-Wadaag','Shangani','Yaaqshid']

export default function StaffCRM() {
  const [shops,   setShops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [saving,  setSaving]  = useState(false)

  const load = async (q = '') => {
    setLoading(true)
    const r = await api.get(`/staff/shops${q ? `?search=${q}` : ''}`)
    setShops(r.data.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openEdit = (s) => {
    setEditing(s)
    setForm({ ownerName: s.ownerName, phone: s.phone, district: s.district, address: s.address || '' })
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/staff/shops/${editing._id}`, form)
      toast.success('Customer updated')
      setEditing(null)
      load(search)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Customer Directory" subtitle={`${shops.length} registered shops`} />

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value) }}
          placeholder="Search by name, phone or district..."
          className="input-field pl-9"
        />
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-purple-400" /></div>
        : shops.length === 0
          ? <Empty icon={Users} message="No shops found" />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {shops.map(s => (
                <div key={s._id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Users size={16} className="text-purple-400" />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Edit2 size={11} /></Button>
                  </div>
                  <div className="font-semibold text-slate-200 mb-0.5">{s.shopName}</div>
                  <div className="text-xs text-slate-400 mb-3">{s.ownerName}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1"><Phone size={10} />{s.phone}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600"><MapPin size={10} />{s.district}</div>
                </div>
              ))}
            </div>
          )}

      {editing && (
        <Modal title={`Edit — ${editing.shopName}`} onClose={() => setEditing(null)}>
          <div className="flex flex-col gap-3">
            <Input label="Owner Name" value={form.ownerName} onChange={v => setForm({ ...form, ownerName: v })} />
            <Input label="Phone"      value={form.phone}     onChange={v => setForm({ ...form, phone: v })} />
            <Select label="District"  value={form.district}  onChange={v => setForm({ ...form, district: v })} options={DISTRICTS} />
            <Input label="Address"    value={form.address}   onChange={v => setForm({ ...form, address: v })} placeholder="Street or landmark" />
            <div className="flex gap-2 pt-1">
              <Button full onClick={save} disabled={saving}>
                {saving ? <Spinner size={15} className="text-white" /> : 'Save Changes'}
              </Button>
              <Button full variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
