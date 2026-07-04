import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { StatusBadge, formatCurrency, formatDate, ORDER_STATUSES } from '../../utils/helpers'
import TrackingTimeline from '../../components/TrackingTimeline'
import ChargeBreakdown from '../../components/ChargeBreakdown'
import { RiArrowLeftLine, RiUserAddLine, RiEditLine } from 'react-icons/ri'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder]     = useState(null)
  const [agents, setAgents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [selAgent, setSelAgent]   = useState('')
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideNote, setOverrideNote]     = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/orders/${id}`),
      api.get('/admin/agents'),
    ]).then(([ord, ag]) => {
      setOrder(ord.data.order)
      setAgents(ag.data.users || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const assignAgent = async (auto = false) => {
    setBusy(true)
    try {
      const body = auto ? { auto: true } : { agentId: selAgent }
      await api.post(`/orders/${id}/assign`, body)
      toast.success(auto ? 'Agent auto-assigned!' : 'Agent assigned!')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const overrideOrderStatus = async () => {
    if (!overrideStatus) { toast.error('Select a status.'); return }
    setBusy(true)
    try {
      await api.patch(`/orders/${id}/status`, { status: overrideStatus, note: overrideNote || 'Status overridden by admin.' })
      toast.success('Status updated!')
      setOverrideNote('')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!order) return <p className="text-slate-400">Order not found.</p>

  const chargeEstimate = order.charge ? {
    pickupZone: order.pickup?.zone, dropZone: order.drop?.zone,
    isIntraZone: order.charge.isIntraZone, volumetricWeight: order.package?.volumetricWeight,
    billedWeight: order.package?.billedWeight, charge: order.charge,
  } : null

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="btn-ghost p-1.5"><RiArrowLeftLine /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold text-white font-mono">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-4">
          {/* Timeline */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-200 mb-5">Tracking History</p>
            <TrackingTimeline history={order.trackingHistory} currentStatus={order.status} />
          </div>

          {/* Override status */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <RiEditLine className="text-gold-500" /> Override Status
            </p>
            <div className="space-y-3">
              <div className="form-group">
                <label className="label">New Status</label>
                <select className="select" value={overrideStatus} onChange={e => setOverrideStatus(e.target.value)}>
                  <option value="">Select status...</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Note (optional)</label>
                <input className="input" placeholder="Reason for override..." value={overrideNote}
                  onChange={e => setOverrideNote(e.target.value)} />
              </div>
              <button onClick={overrideOrderStatus} disabled={busy || !overrideStatus} className="btn-primary text-xs">
                {busy ? 'Updating...' : 'Apply Override'}
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Customer</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-sm font-bold text-gold-500">
                {order.customer?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-slate-200 font-medium">{order.customer?.name}</p>
                <p className="text-xs text-slate-400">{order.customer?.email}</p>
                <p className="text-xs text-slate-400">{order.customer?.phone}</p>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Route</p>
            <div>
              <p className="text-[10px] text-gold-500 font-semibold uppercase mb-1">Pickup</p>
              <p className="text-xs text-slate-200">{order.pickup?.address}</p>
              <p className="text-xs text-slate-400">{order.pickup?.city}, {order.pickup?.pincode}</p>
              {order.pickup?.zone && <p className="text-[10px] text-slate-500">{order.pickup.zone.name}</p>}
            </div>
            <div className="border-t border-white/5" />
            <div>
              <p className="text-[10px] text-cyan-400 font-semibold uppercase mb-1">Delivery</p>
              <p className="text-xs text-slate-200">{order.drop?.address}</p>
              <p className="text-xs text-slate-400">{order.drop?.city}, {order.drop?.pincode}</p>
              {order.drop?.zone && <p className="text-[10px] text-slate-500">{order.drop.zone.name}</p>}
            </div>
          </div>

          {/* Assign agent */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <RiUserAddLine className="text-violet-400" /> Agent Assignment
            </p>
            {order.agent && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-white/3 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {order.agent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-cyan-400 font-medium">{order.agent.name}</p>
                  <p className="text-[10px] text-slate-500">Currently assigned</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <select className="select text-xs py-2" value={selAgent} onChange={e => setSelAgent(e.target.value)}>
                <option value="">Select agent manually...</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name} {a.isAvailable ? '✓' : '(busy)'}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => assignAgent(false)} disabled={busy || !selAgent}
                  className="btn-secondary text-xs flex-1 justify-center">Assign</button>
                <button onClick={() => assignAgent(true)} disabled={busy}
                  className="btn-primary text-xs flex-1 justify-center">Auto-Assign</button>
              </div>
            </div>
          </div>

          {/* Charge */}
          {chargeEstimate && <ChargeBreakdown estimate={chargeEstimate} compact />}
        </div>
      </div>
    </div>
  )
}