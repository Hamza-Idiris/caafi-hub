import { useEffect, useState } from 'react'
import { Users, Truck, Plus, Edit2, Trash2 } from 'lucide-react'
import { Button, Modal, Input, Select, Spinner, Empty, PageHeader } from '../../components/ui'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [sel,     setSel]     = useState(null)
  const [form,    setForm]    = useState({ name: '', username: '', password: '', role: 'staff' })
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/users').then(r => setUsers(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openModal = (u = null) => {
    setSel(u)
    setForm(u
      ? { name: u.name, username: u.username, password: '', role: u.role }
      : { name: '', username: '', password: '', role: 'staff' }
    )
    setModal(u ? 'edit' : 'add')
  }

  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add') {
        await api.post('/admin/users', form)
        toast.success('User created')
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.put(`/admin/users/${sel._id}`, payload)
        toast.success('User updated')
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
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    toast.success('User removed')
    load()
  }

  const ROLE_STYLE = {
    staff:  'text-purple-400 bg-purple-400/10 border-purple-400/20',
    driver: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="User Management" subtitle={`${users.length} system accounts`}
        action={<Button onClick={() => openModal()}><Plus size={14} /> Add User</Button>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Spinner size={28} className="text-primary" /></div>
        : users.length === 0
          ? <Empty icon={Users} message="No users yet" />
          : (
            <div className="flex flex-col gap-2">
              {users.map(u => (
                <div key={u._id} className="card p-4 flex items-center gap-3 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    {u.role === 'driver'
                      ? <Truck size={16} className="text-orange-400" />
                      : <Users size={16} className="text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-200 text-sm">{u.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                      {!u.isActive && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">Disabled</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      @{u.username}{u.plateNumber ? ` · ${u.plateNumber}` : ''} · since {u.createdAt?.slice(0, 10)}
                    </div>
                  </div>
                  <div className="flex gap-1.5 ml-auto">
                    <Button size="sm" variant="ghost"                   onClick={() => openModal(u)}><Edit2 size={11} /></Button>
                    <Button size="sm" variant={u.isActive ? 'danger' : 'success'} onClick={() => toggle(u._id)}>{u.isActive ? 'Disable' : 'Enable'}</Button>
                    <Button size="sm" variant="danger"                  onClick={() => del(u._id)}><Trash2 size={11} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {modal && (
        <Modal title={modal === 'add' ? 'Add System User' : 'Edit User'} onClose={() => { setModal(null); setSel(null) }}>
          <div className="flex flex-col gap-3">
            <Input label="Full Name" value={form.name}     onChange={v => setForm({ ...form, name: v })}     placeholder="Full name" />
            <Input label="Username"  value={form.username} onChange={v => setForm({ ...form, username: v })} placeholder="Login username" />
            <Input label="Password"  value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder={modal === 'edit' ? 'Leave blank to keep current' : 'Password'} type="password" />
            {modal === 'add' && (
              <Select label="Role" value={form.role} onChange={v => setForm({ ...form, role: v })}
                options={[{ value: 'staff', label: 'Staff' }, { value: 'driver', label: 'Driver' }]}
              />
            )}
            <div className="flex gap-2 pt-1">
              <Button full onClick={save} disabled={saving}>
                {saving ? <Spinner size={15} className="text-white" /> : modal === 'add' ? 'Create User' : 'Save Changes'}
              </Button>
              <Button full variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
