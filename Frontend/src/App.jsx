// ============================================================
//  App.jsx  —  LastMile Delivery Tracker
//  Root router. Wraps everything in AuthProvider so every
//  child component can call useAuth() freely.
//
//  Route structure:
//  /login           → Login          (public)
//  /register        → Register       (public)
//  /track/:num      → TrackOrder     (public, shareable link)
//
//  /dashboard/*     → Customer pages (role: customer)
//  /agent/*         → Agent pages    (role: agent)
//  /admin/*         → Admin pages    (role: admin)
//
//  ProtectedRoute checks JWT + role before rendering Layout.
//  Layout renders the Sidebar + <Outlet /> (page content).
//  Any unknown URL falls back to /login.
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }            from './context/AuthContext'

// ── Layout wrappers ──────────────────────────────────────────
import Layout         from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// ── Public pages ─────────────────────────────────────────────
import Login      from './pages/Login'
import Register   from './pages/Register'
import TrackOrder from './pages/TrackOrder'

// ── Customer pages ───────────────────────────────────────────
import CustomerDashboard from './pages/customer/Dashboard'
import PlaceOrder        from './pages/customer/PlaceOrder'
import CustomerOrders    from './pages/customer/Orders'
import OrderDetail       from './pages/customer/OrderDetail'

// ── Admin pages ──────────────────────────────────────────────
import AdminDashboard   from './pages/admin/Dashboard'
import AdminOrders      from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import AdminZones       from './pages/admin/Zones'
import AdminRateCards   from './pages/admin/RateCards'
import AdminAgents      from './pages/admin/Agents'
import AdminCustomers   from './pages/admin/Customers'

// ── Agent pages ──────────────────────────────────────────────
import AgentOrders  from './pages/agent/Orders'
import AgentProfile from './pages/agent/Profile'

// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ════════════════════════════════════════
            PUBLIC ROUTES  —  no auth needed
        ════════════════════════════════════════ */}

        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public tracking page — customers share this link */}
        <Route path="/track"              element={<TrackOrder />} />
        <Route path="/track/:orderNumber" element={<TrackOrder />} />


        {/* ════════════════════════════════════════
            CUSTOMER ROUTES  —  role: customer
            /dashboard
            /dashboard/place
            /dashboard/orders
            /dashboard/orders/:id
        ════════════════════════════════════════ */}

        <Route element={<ProtectedRoute roles={['customer']} />}>
          <Route element={<Layout />}>

            {/* Home dashboard — stats + recent orders */}
            <Route
              path="/dashboard"
              element={<CustomerDashboard />}
            />

            {/* 3-step place order form with live charge estimate */}
            <Route
              path="/dashboard/place"
              element={<PlaceOrder />}
            />

            {/* All orders with status filter + pagination */}
            <Route
              path="/dashboard/orders"
              element={<CustomerOrders />}
            />

            {/* Single order — timeline + reschedule on failure */}
            <Route
              path="/dashboard/orders/:id"
              element={<OrderDetail />}
            />

          </Route>
        </Route>


        {/* ════════════════════════════════════════
            AGENT ROUTES  —  role: agent
            /agent
            /agent/profile
        ════════════════════════════════════════ */}

        <Route element={<ProtectedRoute roles={['agent']} />}>
          <Route element={<Layout />}> 

            {/* All assigned orders — expandable cards with inline status update */}
            <Route
              path="/agent"
              element={<AgentOrders />}
            />

            {/* Profile — edit name/phone, toggle availability, view zones */}
            <Route
              path="/agent/profile"
              element={<AgentProfile />}
            />

          </Route>
            </Route>


        {/* ════════════════════════════════════════
            ADMIN ROUTES  —  role: admin
            /admin
            /admin/orders
            /admin/orders/:id
            /admin/zones
            /admin/rate-cards
            /admin/agents
            /admin/customers
        ════════════════════════════════════════ */}

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<Layout />}>

            {/* Overview — stat cards, bar chart, recent orders */}
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            {/* All orders — filter by status/agent, auto-assign button */}
            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />

            {/* Single order — override status, manual/auto agent assign */}
            <Route
              path="/admin/orders/:id"
              element={<AdminOrderDetail />}
            />

            {/* Zone manager — create zones, add/remove pincodes */}
            <Route
              path="/admin/zones"
              element={<AdminZones />}
            />

            {/* Rate card config — B2B/B2C, intra/inter-zone, COD surcharge */}
            <Route
              path="/admin/rate-cards"
              element={<AdminRateCards />}
            />

            {/* Agent management — create accounts, toggle availability, assign zones */}
            <Route
              path="/admin/agents"
              element={<AdminAgents />}
            />

            {/* Customer list — search, view, activate/deactivate */}
            <Route
              path="/admin/customers"
              element={<AdminCustomers />}
            />

          </Route>
        </Route>


        {/* ════════════════════════════════════════
            FALLBACK ROUTES
            / and anything unknown → /login
        ════════════════════════════════════════ */}

        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </AuthProvider>
  )
}