import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import { ThemeProvider } from './context/ThemeContext'

import Login from './pages/Login'

import AdminLayout   from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/Overview'
import AdminOrders   from './pages/admin/Orders'
import AdminFleet    from './pages/admin/Fleet'
import AdminUsers    from './pages/admin/Users'
import AdminShops    from './pages/admin/Shops'

import StaffLayout   from './pages/staff/StaffLayout'
import StaffSummary  from './pages/staff/Summary'
import StaffOrders   from './pages/staff/Orders'
import StaffCRM      from './pages/staff/CRM'

import DriverDashboard from './pages/driver/DriverDashboard'

import ShopLayout    from './pages/shop/ShopLayout'
import ShopPlaceOrder from './pages/shop/PlaceOrder'
import ShopHistory   from './pages/shop/History'
import ShopProfile   from './pages/shop/Profile'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Login />
  const routes = { admin: '/admin', staff: '/staff', driver: '/driver', shop: '/shop' }
  return <Navigate to={routes[user.role] || '/'} replace />
}

export default function App() {
  return (
   <ThemeProvider>
     <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0F172A',
              color: '#E2E8F0',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#34D399', secondary: '#0F172A' } },
            error:   { iconTheme: { primary: '#F87171', secondary: '#0F172A' } },
          }}
        />
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index         element={<AdminOverview />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="fleet"  element={<AdminFleet />} />
            <Route path="users"  element={<AdminUsers />} />
            <Route path="shops"  element={<AdminShops />} />
          </Route>

          <Route path="/staff" element={<ProtectedRoute roles={['staff', 'admin']}><StaffLayout /></ProtectedRoute>}>
            <Route index         element={<StaffSummary />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="crm"    element={<StaffCRM />} />
          </Route>

          <Route path="/driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />

          <Route path="/shop" element={<ProtectedRoute roles={['shop']}><ShopLayout /></ProtectedRoute>}>
            <Route index          element={<ShopPlaceOrder />} />
            <Route path="history" element={<ShopHistory />} />
            <Route path="profile" element={<ShopProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
   </ThemeProvider>
  )
}
