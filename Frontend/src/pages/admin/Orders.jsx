import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { StatusBadge, formatCurrency, formatDate, ORDER_STATUSES } from '../../utils/helpers'
import { RiArrowRightLine, RiUserAddLine, RiSettings3Line, RiLoader4Line } from 'react-icons/ri'

export default function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [agents, setAgents]   = useState([])
  const [filters, setFilters] = useState({ status: '', agentId: '' })
  const [page, setPage]       = useState(1)
  const [assigning, setAssigning] = useState({})
  const PER_PAGE = 15

  useEffect(() => {
    api.get('/admin/agents').then(({ data }) => setAgents(data.users || []))
  }, [])

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: PER_PAGE })
    if (filters.status)  params.set('status', filters.status)
    if (filters.agentId) params.set('agentId', filters.agentId)
    api.get(`/orders?${params}`).then(({ data }) => {
      setOrders(data.orders)
      setTotal(data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filters])

  const autoAssign = async (orderId) => {
    setAssigning(a => ({ ...a, [orderId]: true }))
    try {
      await api.post(`/orders/${orderId}/assign`, { auto: true })
      toast.success('Agent auto-assigned!')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAssigning(a => ({ ...a, [orderId]: false }))
    }
  }

  const manualAssign = async (orderId, agentId) => {
    if (!agentId) return
    setAssigning(a => ({ ...a, [orderId]: true }))
    try {
      await api.post(`/orders/${orderId}/assign`, { agentId })
      toast.success('Agent assigned!')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAssigning(a => ({ ...a, [orderId]: false }))
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">All Orders</h1>
          <p className="section-sub">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="form-group min-w-40">
          <label className="label">Status</label>
          <select className="select text-xs py-2"
            value={filters.status}
            onChange={e => { setFilters(f => ({...f, status: e.target.value})); setPage(1) }}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group min-w-40">
          <label className="label">Agent</label>
          <select className="select text-xs py-2"
            value={filters.agentId}
            onChange={e => { setFilters(f => ({...f, agentId: e.target.value})); setPage(1) }}>
            <option value="">All Agents</option>
            <option value="unassigned">Unassigned</option>
            {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setFilters({ status: '', agentId: '' }); setPage(1) }}
            className="btn-ghost text-xs py-2">Clear Filters</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Type</th>
                    <th>Charge</th>
                    <th>Status</th>
                    <th>Agent</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td className="font-mono text-xs text-gold-500">{o.orderNumber}</td>
                      <td>
                        <div>
                          <p className="text-xs text-slate-200">{o.customer?.name}</p>
                          <p className="text-[10px] text-slate-500">{o.customer?.email}</p>
                        </div>
                      </td>
                      <td className="text-xs text-slate-300">{o.pickup?.city} → {o.drop?.city}</td>
                      <td>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{o.orderType}</span>
                      </td>
                      <td className="font-mono text-sm">{formatCurrency(o.charge?.totalCharge)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        {o.agent ? (
                          <span className="text-xs text-cyan-400">{o.agent.name}</span>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => autoAssign(o._id)}
                              disabled={assigning[o._id]}
                              className="text-[10px] px-2 py-1 rounded bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 border border-violet-500/20 transition-all flex items-center gap-1"
                            >
                              {assigning[o._id] ? <RiLoader4Line className="animate-spin" /> : <RiUserAddLine />}
                              Auto
                            </button>
                          </div>
                        )}
                      </td>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-xs text-slate-400">
                <span>Page {page} of {totalPages} · {total} orders</span>
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