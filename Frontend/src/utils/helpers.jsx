import { format, formatDistanceToNow } from 'date-fns'

export const STATUS_CONFIG = {
  'Order Placed':      { cls: 'badge-placed',      dot: '#94a3b8', label: 'Order Placed' },
  'Confirmed':         { cls: 'badge-confirmed',   dot: '#60a5fa', label: 'Confirmed' },
  'Agent Assigned':    { cls: 'badge-assigned',    dot: '#a78bfa', label: 'Agent Assigned' },
  'Picked Up':         { cls: 'badge-pickedup',    dot: '#fbbf24', label: 'Picked Up' },
  'In Transit':        { cls: 'badge-transit',     dot: '#fb923c', label: 'In Transit' },
  'Out for Delivery':  { cls: 'badge-outfor',      dot: '#22d3ee', label: 'Out for Delivery' },
  'Delivered':         { cls: 'badge-delivered',   dot: '#10b981', label: 'Delivered' },
  'Failed':            { cls: 'badge-failed',      dot: '#ef4444', label: 'Failed' },
  'Rescheduled':       { cls: 'badge-rescheduled', dot: '#facc15', label: 'Rescheduled' },
  'Cancelled':         { cls: 'badge-cancelled',   dot: '#6b7280', label: 'Cancelled' },
}

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { cls: 'badge-placed', label: status }
  return (
    <span className={cfg.cls}>
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

export const ORDER_STATUSES = Object.keys(STATUS_CONFIG)

export const AGENT_STATUSES = [
  'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed',
]

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0)

export const formatDate = (d) => d ? format(new Date(d), 'dd MMM yyyy, hh:mm a') : '—'

export const formatDateShort = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—'

export const timeAgo = (d) => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—'