import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('caafi_user')
    const token  = localStorage.getItem('caafi_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  const systemLogin = async (username, password) => {
    const { data } = await api.post('/auth/system/login', { username, password })
    const { token, user: u } = data.data
    localStorage.setItem('caafi_token', token)
    localStorage.setItem('caafi_user',  JSON.stringify(u))
    setUser(u)
    return u
  }

  const shopLogin = async (phone, pin) => {
    const { data } = await api.post('/auth/shop/login', { phone, pin })
    const { token, shop } = data.data
    const u = { ...shop, role: 'shop' }
    localStorage.setItem('caafi_token', token)
    localStorage.setItem('caafi_user',  JSON.stringify(u))
    setUser(u)
    return u
  }

  const shopRegister = async (form) => {
    const { data } = await api.post('/auth/shop/register', form)
    const { token, shop } = data.data
    const u = { ...shop, role: 'shop' }
    localStorage.setItem('caafi_token', token)
    localStorage.setItem('caafi_user',  JSON.stringify(u))
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('caafi_token')
    localStorage.removeItem('caafi_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, systemLogin, shopLogin, shopRegister, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
