import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { StatusBadge, formatCurrency, formatDate } from '../../utils/helpers'
import {
  RiTruckLine, RiCheckboxCircleLine, RiAlertLine,
  RiTimeLine, RiArrowRightLine, RiUser3Line, RiMotorbikeLine
} from 'react-icons/ri'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STAT_STATUSES = [
  { key: 'Order Placed',    label: 'Placed',    color: '#94a3b8' },
  { key: 'In Transit',      label: 'Transit',   color: '#fb923c' },
  { key: 'Out for Delivery',label: 'Out',       color: '#22d3ee' },
  { key: 'Delivered',       label: 'Delivered', color: '#10b981' },
  { key: 'Failed',          label: 'Failed',    color: '#ef4444' },
]

export default function AdminDashboard() {
  const [orders, setOrders]     = useState([])
  const [summary, setSummary]   = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/orders?limit=8').then(({ data }) => {
      setOrders(data.orders)
      const s = {}
      STAT_STATUSES.forEach(st => {
        s[st.key] = data.orders.filter(o => o.status === st.key).length
      })
      s.total = data.total
      setSummary(s)
    }).finally(() => setLoading(false))
  }, [])

  const chartData = STAT_STATUSES.map(s => ({
    name:  s.label,
    value: summary[s.key] || 0,
    color: s.color,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-sub">Platform overview and quick actions</p>
        </div>
        <Link to="/admin/orders" className="btn-primary text-xs">
          <RiTruckLine /> All Orders
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders',   value: summary.total,                   icon: RiTimeLine,            color: 'text-slate-200' },
          { label: 'In Transit',     value: summary['In Transit'],           icon: RiTruckLine,           color: 'text-orange-400' },
          { label: 'Out for Delivery',value: summary['Out for Delivery'],    icon: RiMotorbikeLine,       color: 'text-cyan-400' },
          { label: 'Delivered',      value: summary['Delivered'],            icon: RiCheckboxCircleLine,  color: 'text-emerald-400' },
          { label: 'Failed',         value: summary['Failed'],               icon: RiAlertLine,           color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon className={`text-xl ${s.color} mb-1`} />
            <p className={`stat-value ${s.color}`}>{s.value ?? '—'}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-200 mb-4">Orders by Status</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-200 mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { to: '/admin/zones',      label: 'Manage Zones',    sub: 'Add or edit delivery zones' },
              { to: '/admin/rate-cards', label: 'Rate Cards',      sub: 'Configure B2B/B2C pricing' },
              { to: '/admin/agents',     label: 'Agents',          sub: 'View & assign delivery agents' },
              { to: '/admin/orders',     label: 'Orders',          sub: 'Filter, assign, override' },
            ].map(a => (
              <Link key={a.to} to={a.to}
                className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div>
                  <p className="text-sm text-slate-200 font-medium group-hover:text-gold-500 transition-colors">{a.label}</p>
                  <p className="text-xs text-slate-500">{a.sub}</p>
                </div>
                <RiArrowRightLine className="text-slate-600 group-hover:text-gold-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <p className="text-sm font-semibold text-slate-200">Recent Orders</p>
          <Link to="/admin/orders" className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors">
            View all <RiArrowRightLine />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Agent</th>
                  <th>Charge</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td className="font-mono text-xs text-gold-500">{o.orderNumber}</td>
                    <td className="text-xs text-slate-300">{o.customer?.name}</td>
                    <td className="text-xs text-slate-300">{o.pickup?.city} → {o.drop?.city}</td>
                    <td className="text-xs">{o.agent ? <span className="text-cyan-400">{o.agent.name}</span> : <span className="text-slate-600">Unassigned</span>}</td>
                    <td className="font-mono text-sm">{formatCurrency(o.charge?.totalCharge)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                    <td>
                      <Link to={`/admin/orders/${o._id}`} className="btn-ghost text-xs p-1.5">
                        <RiArrowRightLine />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}