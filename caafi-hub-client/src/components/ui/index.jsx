// src/components/ui/index.jsx — All shared UI primitives
import { useState } from 'react'
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react'

/* ── Button ─────────────────────────────────────────────── */
const variantCls = {
  primary: 'bg-primary text-white hover:opacity-90',
  danger:  'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20',
  ghost:   'bg-white/5 text-slate-400 border border-white/8 hover:bg-white/10',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20',
  orange:  'bg-orange-500/10 text-orange-400 border border-orange-500/25 hover:bg-orange-500/20',
  outline: 'bg-transparent text-primary border border-primary/40 hover:bg-primary/10',
}
const sizeCls = {
  sm: 'text-xs px-3 py-1.5 gap-1',
  md: 'text-sm px-4 py-2 gap-1.5',
  lg: 'text-base px-6 py-3 gap-2',
}

export function Button({ children, variant='primary', size='md', full=false, disabled=false, onClick, type='button', className='' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-semibold rounded-lg cursor-pointer transition-all duration-200 font-sans
        ${variantCls[variant]} ${sizeCls[size]} ${full ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

/* ── Input ──────────────────────────────────────────────── */
export function Input({ label, value, onChange, type='text', placeholder, error, readOnly=false, className='' }) {
  const [show, setShow] = useState(false)
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>}
      <div className="relative">
        <input
          type={type === 'password' && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`input-field pr-${type==='password'?'10':'3'} ${error ? 'border-red-500/50' : ''} ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  )
}

/* ── Select ─────────────────────────────────────────────── */
export function Select({ label, value, onChange, options=[] }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="input-field">
        {options.map(o => {
          const val = typeof o === 'string' ? o : o.value
          const lbl = typeof o === 'string' ? o : o.label
          return <option key={val} value={val} className="bg-secondary">{lbl}</option>
        })}
      </select>
    </div>
  )
}

/* ── Badge ──────────────────────────────────────────────── */
const badgeCfg = {
  Pending:      'text-yellow-400 bg-yellow-400/10 border-yellow-400/25',
  Approved:     'text-sky-400 bg-sky-400/10 border-sky-400/25',
  Dispatched:   'text-orange-400 bg-orange-400/10 border-orange-400/25',
  'On The Way': 'text-purple-400 bg-purple-400/10 border-purple-400/25',
  Delivered:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  Rejected:     'text-red-400 bg-red-400/10 border-red-400/25',
}
export function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide whitespace-nowrap ${badgeCfg[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/25'}`}>
      {status}
    </span>
  )
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({ title, children, onClose, width='max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`card w-full ${width} max-h-[90vh] overflow-auto animate-fade-up`}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-heading text-[17px] font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size=20, className='' }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

/* ── StatCard ────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, color='text-primary', bg='bg-primary/10' }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <div className={`font-mono text-2xl font-bold text-slate-100`}>{value}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────── */
export function Empty({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <Icon size={36} className="mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

/* ── Page Header ─────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
