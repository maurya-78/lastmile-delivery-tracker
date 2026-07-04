import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { StatusBadge, formatCurrency, formatDate } from '../../utils/helpers'
import { RiTruckLine, RiAddLine, RiArrowRightLine, RiBox3Line, RiTimeLine } from 'react-icons/ri'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats]   = useState({ total: 0, delivered: 0, active: 0, failed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders?limit=5').then(({ data }) => {
      setOrders(data.orders)
      const all = data.orders
      setStats({
        total:     data.total,
        delivered: all.filter(o => o.status === 'Delivered').length,
        active:    all.filter(o => !['Delivered','Cancelled','Failed'].includes(o.status)).length,
        failed:    all.filter(o => o.status === 'Failed').length,
      })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's what's moving today</p>
        </div>
        <Link to="/dashboard/place" className="btn-primary">
          <RiAddLine /> New Order
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders',   value: stats.total,     color: 'text-slate-200' },
          { label: 'Active',         value: stats.active,    color: 'text-cyan-400' },
          { label: 'Delivered',      value: stats.delivered, color: 'text-emerald-400' },
          { label: 'Failed',         value: stats.failed,    color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className={`stat-value ${s.color}`}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <p className="section-title text-base">Recent Orders</p>
          </div>
          <Link to="/dashboard/orders" className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors">
            View all <RiArrowRightLine />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RiBox3Line className="text-4xl text-slate-600" />
            <p className="text-slate-400 text-sm">No orders yet</p>
            <Link to="/dashboard/place" className="btn-primary text-xs">Place Your First Order</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Route</th>
                  <th>Type</th>
                  <th>Charge</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="font-mono text-xs text-gold-500">{o.orderNumber}</td>
                    <td>
                      <p className="text-xs text-slate-300">{o.pickup?.city} → {o.drop?.city}</p>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">{o.orderType}</span>
                    </td>
                    <td className="font-mono text-sm text-slate-200">{formatCurrency(o.charge?.totalCharge)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                    <td>
                      <Link to={`/dashboard/orders/${o._id}`}
                        className="text-xs text-slate-500 hover:text-gold-500 transition-colors flex items-center gap-1">
                        Details <RiArrowRightLine />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick track */}
      <div className="card p-5 flex items-center gap-4">
        <RiTimeLine className="text-2xl text-gold-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200">Track any shipment</p>
          <p className="text-xs text-slate-500">Share the public tracking link with your customers</p>
        </div>
        <Link to="/track" className="btn-secondary text-xs flex-shrink-0">Open Tracker</Link>
      </div>
    </div>
  )
}