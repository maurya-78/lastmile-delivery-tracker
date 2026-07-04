import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { StatusBadge, formatDate, formatCurrency } from '../utils/helpers'
import TrackingTimeline from '../components/TrackingTimeline'
import { RiTruckLine, RiSearchLine, RiMapPinLine, RiUser3Line, RiPhoneLine } from 'react-icons/ri'

export default function TrackOrder() {
  const { orderNumber: paramNum } = useParams()
  const navigate = useNavigate()
  const [num, setNum]       = useState(paramNum || '')
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(false)

  const search = async (e) => {
    e?.preventDefault()
    if (!num.trim()) return
    setLoading(true)
    try {
      const { data } = await api.get(`/orders/track/${num.trim().toUpperCase()}`)
      setOrder(data.order)
      navigate(`/track/${num.trim().toUpperCase()}`, { replace: true })
    } catch (err) {
      toast.error(err.message)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="bg-navy-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <RiTruckLine className="text-navy-950 text-lg" />
          </div>
          <span className="font-bold text-white">LastMile</span>
        </div>
        <button onClick={() => navigate('/login')} className="btn-secondary text-xs">Sign In</button>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl font-bold text-white mb-2">Track Your Shipment</h1>
          <p className="text-slate-400 text-sm">Enter your order number to get live status updates</p>
        </div>

        {/* Search */}
        <form onSubmit={search} className="flex gap-3 mb-8">
          <input
            className="input flex-1 font-mono"
            placeholder="e.g. LMD123456789012"
            value={num}
            onChange={(e) => setNum(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              : <><RiSearchLine /> Track</>
            }
          </button>
        </form>

        {/* Result */}
        {order && (
          <div className="space-y-4">
            {/* Status header */}
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-mono">ORDER NUMBER</p>
                  <p className="text-lg font-bold text-white font-mono">{order.orderNumber}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <RiMapPinLine /> Pickup
                  </p>
                  <p className="text-slate-200">{order.pickup?.city}, {order.pickup?.state}</p>
                  <p className="text-slate-400 text-xs">{order.pickup?.pincode}</p>
                  {order.pickup?.zone && (
                    <p className="text-xs text-gold-500 mt-0.5">{order.pickup.zone.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <RiMapPinLine /> Delivery
                  </p>
                  <p className="text-slate-200">{order.drop?.city}, {order.drop?.state}</p>
                  <p className="text-slate-400 text-xs">{order.drop?.pincode}</p>
                  {order.drop?.zone && (
                    <p className="text-xs text-gold-500 mt-0.5">{order.drop.zone.name}</p>
                  )}
                </div>
              </div>

              {order.agent && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                    <RiUser3Line className="text-cyan-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Delivery Agent</p>
                    <p className="text-sm text-slate-200 font-medium">{order.agent.name}</p>
                  </div>
                  {order.agent.phone && (
                    <a href={`tel:${order.agent.phone}`}
                      className="ml-auto flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      <RiPhoneLine /> Call
                    </a>
                  )}
                </div>
              )}

              {order.failureReason && (
                <div className="mt-4 p-3 bg-red-500/8 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400"><strong>Delivery failed:</strong> {order.failureReason}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-slate-200 mb-5">Tracking Timeline</p>
              <TrackingTimeline history={order.trackingHistory} currentStatus={order.status} />
            </div>

            {/* Package details */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-slate-200 mb-3">Package Details</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Dimensions</p>
                  <p className="text-slate-300 font-mono text-xs">
                    {order.package?.length}×{order.package?.breadth}×{order.package?.height} cm
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Actual Weight</p>
                  <p className="text-slate-300 font-mono text-xs">{order.package?.actualWeight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Billed Weight</p>
                  <p className="text-slate-300 font-mono text-xs">{order.package?.billedWeight} kg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Order Type</p>
                  <p className="text-slate-300 text-xs">{order.orderType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Payment</p>
                  <p className="text-slate-300 text-xs">{order.paymentType}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}