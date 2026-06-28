import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, ChevronRight, AlertCircle, Zap, Shield, Truck, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Input, Select, Button, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const DISTRICTS = ['Hodan','Wadajir','Karaan','Heliwa','Dharkenley','Kaxda','Boondheere','Hawl-Wadaag','Shangani','Yaaqshid']

const DEMOS = [
  { role:'Admin',  icon: Shield,     username:'admin',   password:'Admin@caafi1', color:'text-sky-400',    bg:'bg-sky-400/10',    border:'border-sky-400/20' },
  { role:'Staff',  icon: Zap,        username:'staff1',  password:'Staff@123',    color:'text-purple-400', bg:'bg-purple-400/10', border:'border-purple-400/20' },
  { role:'Driver', icon: Truck,      username:'driver1', password:'Driver@123',   color:'text-orange-400', bg:'bg-orange-400/10', border:'border-orange-400/20' },
]

export default function Login() {
  const { systemLogin, shopLogin, shopRegister } = useAuth()
  const navigate = useNavigate()

  const [tab,      setTab]      = useState('system') // 'system' | 'shop'
  const [isReg,    setIsReg]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // System login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Shop login / register
  const [phone,    setPhone]    = useState('')
  const [pin,      setPin]      = useState('')
  const [shopForm, setShopForm] = useState({ shopName:'', ownerName:'', district:'Hodan' })

  const ROLE_ROUTES = { admin:'/admin', staff:'/staff', driver:'/driver', shop:'/shop' }

  const handleSystemLogin = async () => {
    if (!username || !password) { setError('Please enter username and password.'); return }
    setLoading(true); setError('')
    try {
      const u = await systemLogin(username, password)
      toast.success(`Welcome back, ${u.name}!`)
      navigate(ROLE_ROUTES[u.role])
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  const handleShopLogin = async () => {
    if (!phone || !pin) { setError('Phone and PIN are required.'); return }
    setLoading(true); setError('')
    try {
      const u = await shopLogin(phone, pin)
      toast.success(`Welcome, ${u.shopName}!`)
      navigate('/shop')
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid phone or PIN.')
    } finally { setLoading(false) }
  }

  const handleShopRegister = async () => {
    if (!phone || !pin || !shopForm.shopName || !shopForm.ownerName) { setError('All fields are required.'); return }
    setLoading(true); setError('')
    try {
      const u = await shopRegister({ ...shopForm, phone, pin })
      toast.success(`Account created! Welcome, ${u.shopName}!`)
      navigate('/shop')
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const fillDemo = (d) => { setUsername(d.username); setPassword(d.password); setError('') }

  return (
    <div className="min-h-screen bg-dark bg-grid flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-accent/6 to-transparent pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center glow-blue shadow-lg">
              <Droplets size={26} className="text-white" />
            </div>
            <h1 className="font-heading text-4xl font-extrabold text-slate-100 tracking-tight">
              Caafi<span className="text-primary">-Hub</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-[0.15em]">Water Supply & Fleet Operations · Mogadishu</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-secondary/80 border border-white/5 rounded-xl p-1 mb-5">
          {[{k:'system',l:'System Login'},{k:'shop',l:'Shop Portal'}].map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setError(''); setIsReg(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${tab === t.k ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card p-6 shadow-2xl">
          {tab === 'system' ? (
            <div className="flex flex-col gap-4">
              <Input label="Username"  value={username} onChange={setUsername} placeholder="Enter username" />
              <Input label="Password"  value={password} onChange={setPassword} placeholder="••••••••" type="password" />

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle size={13} />{error}
                </div>
              )}

              <Button full onClick={handleSystemLogin} disabled={loading}>
                {loading ? <Spinner size={16} className="text-white" /> : <>Sign In <ChevronRight size={15} /></>}
              </Button>

              {/* Demo credentials */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Demo Accounts</p>
                <div className="flex flex-col gap-2">
                  {DEMOS.map(d => (
                    <button key={d.role} onClick={() => fillDemo(d)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${d.bg} ${d.border} hover:opacity-80 transition-opacity cursor-pointer`}>
                      <div className="flex items-center gap-2">
                        <d.icon size={13} className={d.color} />
                        <span className={`text-xs font-bold ${d.color}`}>{d.role}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">{d.username} / {d.password}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="252615001234" type="tel" />
              {!isReg && <Input label="PIN (4 digits)" value={pin} onChange={setPin} placeholder="••••" type="password" />}
              {isReg && (
                <>
                  <Input label="PIN (4 digits)"  value={pin}               onChange={setPin}    placeholder="Choose a 4-digit PIN" type="password" />
                  <Input label="Shop Name"        value={shopForm.shopName} onChange={v => setShopForm({...shopForm,shopName:v})}   placeholder="Your shop name" />
                  <Input label="Owner Full Name"  value={shopForm.ownerName}onChange={v => setShopForm({...shopForm,ownerName:v})}  placeholder="Full name" />
                  <Select label="District" value={shopForm.district} onChange={v => setShopForm({...shopForm,district:v})} options={DISTRICTS} />
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle size={13} />{error}
                </div>
              )}

              <Button full onClick={isReg ? handleShopRegister : handleShopLogin} disabled={loading}>
                {loading ? <Spinner size={16} className="text-white" /> : <>{isReg ? 'Create Account' : 'Sign In'} <ChevronRight size={15} /></>}
              </Button>

              <button onClick={() => { setIsReg(!isReg); setError('') }}
                className="text-xs text-slate-500 hover:text-slate-300 text-center transition-colors underline underline-offset-2">
                {isReg ? 'Already have an account? Sign In' : 'New shop? Register here'}
              </button>

              {!isReg && (
                <div className="border-t border-white/5 pt-3 text-center">
                  <p className="text-[11px] text-slate-600">Demo shop: <button className="text-primary hover:underline" onClick={() => { setPhone('252615001234'); setPin('1234') }}>252615001234 / PIN: 1234</button></p>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-6 uppercase tracking-widest">
          © 2025 Caafi Water Company · Mogadishu, Somalia
        </p>
      </div>
    </div>
  )
}
