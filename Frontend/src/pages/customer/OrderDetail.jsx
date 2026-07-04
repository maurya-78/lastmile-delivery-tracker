import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { StatusBadge, formatCurrency, formatDate, formatDateShort } from '../../utils/helpers'
import TrackingTimeline from '../../components/TrackingTimeline'
import ChargeBreakdown from '../../components/ChargeBreakdown'
import {
  RiArrowLeftLine, RiUser3Line, RiTruckLine,
  RiCalendarLine, RiShareLine, RiRefreshLine
} from 'react-icons/ri'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [reschedDate, setReschedDate] = useState('')
  const [rescheduling, setRescheduling] = useState(false)
  const [showResched, setShowResched]   = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleReschedule = async () => {
    if (!reschedDate) { toast.error('Pick a date.'); return }
    setRescheduling(true)
    try {
      const { data } = await api.post(`/orders/${id}/reschedule`, { rescheduledDate: reschedDate })
      setOrder(data.order)
      toast.success('Order rescheduled!')
      setShowResched(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRescheduling(false)
    }
  }

  const copyTrackLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/track/${order.orderNumber}`)
    toast.success('Tracking link copied!')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!order) return <p className="text-slate-400">Order not found.</p>

  const chargeEstimate = order.charge ? {
    pickupZone:       order.pickup?.zone,
    dropZone:         order.drop?.zone,
    isIntraZone:      order.charge.isIntraZone,
    volumetricWeight: order.package?.volumetricWeight,
    billedWeight:     order.package?.billedWeight,
    charge:           order.charge,
  } : null

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/orders" className="btn-ghost p-1.5">
          <RiArrowLeftLine />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold text-white font-mono">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <button onClick={copyTrackLink} className="btn-secondary text-xs">
          <RiShareLine /> Share Tracking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: timeline */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-200 mb-5">Tracking Timeline</p>
            <TrackingTimeline history={order.trackingHistory} currentStatus={order.status} />
          </div>

          {/* Reschedule block */}
          {order.status === 'Failed' && (
            <div className="card p-5 border-red-500/20">
              <div className="flex items-start gap-3 mb-4">
                <RiRefreshLine className="text-red-400 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">Delivery Failed</p>
                  <p className="text-xs text-slate-400 mt-0.5">{order.failureReason}</p>
                </div>
              </div>
              {!showResched ? (
                <button onClick={() => setShowResched(true)} className="btn-primary text-xs w-full justify-center">
                  Reschedule Delivery
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="form-group">
                    <label className="label">New Delivery Date</label>
                    <input type="date" className="input"
                      min={new Date().toISOString().split('T')[0]}
                      value={reschedDate}
                      onChange={e => setReschedDate(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowResched(false)} className="btn-secondary text-xs flex-1 justify-center">Cancel</button>
                    <button onClick={handleReschedule} disabled={rescheduling} className="btn-primary text-xs flex-1 justify-center">
                      {rescheduling ? 'Saving...' : 'Confirm Reschedule'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Route */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Route</p>
            <div className="space-y-3 text-sm">
              <AddressInfo label="Pickup" data={order.pickup} color="text-gold-500" />
              <div className="border-t border-white/5" />
              <AddressInfo label="Delivery" data={order.drop} color="text-cyan-400" />
            </div>
          </div>

          {/* Package */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Package</p>
            <div className="space-y-1.5 text-sm">
              <Row label="Dimensions" value={`${order.package?.length}×${order.package?.breadth}×${order.package?.height} cm`} mono />
              <Row label="Actual Weight"     value={`${order.package?.actualWeight} kg`} mono />
              <Row label="Volumetric Weight" value={`${order.package?.volumetricWeight} kg`} mono />
              <Row label="Billed Weight"     value={`${order.package?.billedWeight} kg`} mono highlight />
              <Row label="Order Type"    value={order.orderType} />
              <Row label="Payment Type"  value={order.paymentType} />
            </div>
          </div>

          {/* Charge */}
          {chargeEstimate && <ChargeBreakdown estimate={chargeEstimate} />}

          {/* Agent */}
          {order.agent && (
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Assigned Agent</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                  {order.agent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">{order.agent.name}</p>
                  <p className="text-xs text-slate-400">{order.agent.phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddressInfo({ label, data, color }) {
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-wide ${color} mb-1`}>{label}</p>
      <p className="text-slate-200 text-sm leading-snug">{data?.address}</p>
      <p className="text-slate-400 text-xs">{data?.city}, {data?.state} — {data?.pincode}</p>
      {data?.zone && <p className="text-[10px] text-slate-500 mt-0.5">{data.zone.name}</p>}
    </div>
  )
}

function Row({ label, value, mono, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} text-xs ${highlight ? 'text-gold-500 font-semibold' : 'text-slate-300'}`}>{value}</span>
    </div>
  )
}