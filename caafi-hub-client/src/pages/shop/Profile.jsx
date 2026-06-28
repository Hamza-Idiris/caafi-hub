import { useEffect, useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { Button, Input, Select, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const DISTRICTS = ['Hodan','Wadajir','Karaan','Heliwa','Dharkenley','Kaxda','Boondheere','Hawl-Wadaag','Shangani','Yaaqshid']

export default function ShopProfile() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({ ownerName: '', phone: '', district: '', address: '' })
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        ownerName: user.ownerName || '',
        phone:     user.phone     || '',
        district:  user.district  || 'Hodan',
        address:   user.address   || '',
      })
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/shops/profile', form)
      const updated = { ...user, ...form }
      localStorage.setItem('caafi_user', JSON.stringify(updated))
      toast.success('Profile updated')
      setEditing(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: 'Shop Name',    value: user?.shopName },
    { label: 'Owner Name',   value: user?.ownerName },
    { label: 'Phone Number', value: user?.phone },
    { label: 'District',     value: user?.district },
    { label: 'Member Since', value: user?.createdAt?.slice(0, 10) },
  ]

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-xl font-bold text-slate-100">Shop Profile</h1>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? <><X size={13} /> Cancel</> : <><Edit2 size={13} /> Edit</>}
        </Button>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
          <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400 font-heading text-2xl font-bold flex-shrink-0">
            {user?.shopName?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-slate-100">{user?.shopName}</div>
            <div className="text-sm text-slate-500">{user?.district} · Mogadishu</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full inline-block">
              Active Account
            </div>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            <Input label="Owner Name"   value={form.ownerName} onChange={v => setForm({ ...form, ownerName: v })} />
            <Input label="Phone Number" value={form.phone}     onChange={v => setForm({ ...form, phone: v })} />
            <Select label="District"    value={form.district}  onChange={v => setForm({ ...form, district: v })} options={DISTRICTS} />
            <Input label="Address"      value={form.address}   onChange={v => setForm({ ...form, address: v })} placeholder="Street or landmark (optional)" />
            <div className="flex gap-2 pt-1">
              <Button full onClick={save} disabled={saving}>
                {saving ? <Spinner size={15} className="text-white" /> : <><Save size={14} /> Save Changes</>}
              </Button>
              <Button full variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.label} className="bg-white/2 border border-white/4 rounded-lg p-3">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">{f.label}</div>
                <div className="text-sm font-medium text-slate-200">{f.value || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
