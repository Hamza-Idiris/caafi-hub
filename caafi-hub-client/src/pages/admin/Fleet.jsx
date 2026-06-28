import { useEffect, useState } from 'react'
import { Truck, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button, Modal, Input, Spinner, Empty, PageHeader } from '../../components/ui'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminFleet() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [sel,     setSel]     = useState(null)
  const [form,    setForm]    = useState({ name: '', username: '', password: '', plateNumber: '', vehicle: '' })
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/users?role=driver')
      .then(r => setDrivers(r.data.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openModal = (d = null) => {
    setSel(d)
    setForm(d
      ? { name: d.name, username: d.username, password: '', plateNumber: d.plateNumber || '', vehicle: d.vehicle || '' }
      : { name: '', username: '', password: '', plateNumber: '', vehicle: '' }
    )
    setModal(d ? 'edit' : 'add')
  }

  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add') {
        await api.post('/admin/users', { ...form, role: 'driver' })
        toast.success('Driver added')
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.put(`/admin/users/${sel._id}`, payload)
        toast.success('Driver updated')
      }
      setModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (id) => {
    await api.patch(`/admin/users/${id}/toggle`)
    toast.success('Status updated')
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this driver?')) return
    await api.delete(`/admin/users/${id}`)
    toast.success('Driver removed')
    load()
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Fleet Management" subtitle={`${drivers.length} delivery vehicles`}
        action={<Button onClick={() => openModal()}><Plus size={14} /> Add Driver</Button>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-primary" /></div>
        : drivers.length === 0
          ? <Empty icon={Truck} message="No drivers yet" />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {drivers.map(d => (
                <div key={d._id} className={`card p-4 border ${d.isActive ? 'border-orange-500/20' : 'border-white/4'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Truck size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{d.name}</div>
                        <div className="font-mono text-xs text-orange-400">{d.plateNumber}</div>
                      </div>
                    </div>
                    {!d.isActive && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">Off</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{d.vehicle} · @{d.username}</div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => openModal(d)}><Edit2 size={11} /></Button>
                    <Button size="sm" variant={d.isActive ? 'danger' : 'success'} onClick={() => toggle(d._id)}>
                      {d.isActive ? <><ToggleRight size={13} /> Disable</> : <><ToggleLeft size={13} /> Enable</>}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => del(d._id)}><Trash2 size={11} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Driver' : 'Edit Driver'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            <Input label="Full Name"    value={form.name}        onChange={v => setForm({ ...form, name: v })}        placeholder="Full name" />
            <Input label="Username"     value={form.username}    onChange={v => setForm({ ...form, username: v })}    placeholder="Login username" />
            <Input label="Password"     value={form.password}    onChange={v => setForm({ ...form, password: v })}    placeholder={modal === 'edit' ? 'Leave blank to keep current' : 'Password'} type="password" />
            <Input label="Plate Number" value={form.plateNumber} onChange={v => setForm({ ...form, plateNumber: v })} placeholder="SOM-XXXX" />
            <Input label="Vehicle Type" value={form.vehicle}     onChange={v => setForm({ ...form, vehicle: v })}     placeholder="e.g. Toyota Dyna" />
            <div className="flex gap-2 pt-1">
              <Button full onClick={save} disabled={saving}>
                {saving ? <Spinner size={15} className="text-white" /> : modal === 'add' ? 'Create Driver' : 'Save Changes'}
              </Button>
              <Button full variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
