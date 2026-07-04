import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { StatusBadge, formatCurrency, formatDate, ORDER_STATUSES } from '../../utils/helpers'
import { RiSearchLine, RiArrowRightLine, RiBox3Line } from 'react-icons/ri'

export default function CustomerOrders() {
  const [orders, setOrders]   = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: PER_PAGE })
    if (statusFilter) params.set('status', statusFilter)
    api.get(`/orders?${params}`).then(({ data }) => {
      setOrders(data.orders)
      setTotal(data.total)
    }).finally(() => setLoading(false))
  }, [page, statusFilter])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Orders</h1>
          <p className="section-sub">{total} orders total</p>
        </div>
        <Link to="/dashboard/place" className="btn-primary text-xs">+ New Order</Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1) }}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!statusFilter ? 'bg-gold-500 text-navy-950 border-gold-500 font-semibold' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'}`}
        >All</button>
        {['Order Placed', 'Confirmed', 'Agent Assigned', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'].map(s => (
          <button key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? 'bg-gold-500 text-navy-950 border-gold-500 font-semibold' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'}`}
          >{s}</button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <RiBox3Line className="text-4xl text-slate-600" />
            <p className="text-slate-400 text-sm">No orders found</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>From → To</th>
                    <th>Type</th>
                    <th>Payment</th>
                    <th>Charge</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td className="font-mono text-xs text-gold-500">{o.orderNumber}</td>
                      <td className="text-xs">
                        <span className="text-slate-300">{o.pickup?.city}</span>
                        <span className="text-slate-600 mx-1">→</span>
                        <span className="text-slate-300">{o.drop?.city}</span>
                      </td>
                      <td><span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">{o.orderType}</span></td>
                      <td><span className={`text-xs font-medium ${o.paymentType === 'COD' ? 'text-amber-400' : 'text-slate-400'}`}>{o.paymentType}</span></td>
                      <td className="font-mono text-sm">{formatCurrency(o.charge?.totalCharge)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                      <td>
                        <Link to={`/dashboard/orders/${o._id}`}
                          className="btn-ghost text-xs p-1.5">
                          <RiArrowRightLine />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-slate-400">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-ghost text-xs py-1 px-2">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-ghost text-xs py-1 px-2">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}