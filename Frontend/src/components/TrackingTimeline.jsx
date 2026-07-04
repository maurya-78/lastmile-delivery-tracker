import { STATUS_CONFIG } from '../utils/helpers'
import { formatDate } from '../utils/helpers'
import { RiCheckLine, RiTimeLine } from 'react-icons/ri'

const STATUS_ORDER = [
  'Order Placed', 'Confirmed', 'Agent Assigned',
  'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered',
]

export default function TrackingTimeline({ history = [], currentStatus }) {
  const isDone   = (s) => history.some((h) => h.status === s)
  const isActive = (s) => currentStatus === s
  const isFailed = currentStatus === 'Failed' || currentStatus === 'Cancelled' || currentStatus === 'Rescheduled'

  // Build combined list: standard flow + any extra events in history
  const extraEvents = history.filter((h) => !STATUS_ORDER.includes(h.status))

  return (
    <div className="space-y-0">
      {/* Standard timeline */}
      {STATUS_ORDER.map((status, idx) => {
        const done   = isDone(status)
        const active = isActive(status) && !isFailed
        const event  = history.find((h) => h.status === status)

        return (
          <div key={status} className="flex gap-4">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${done ? 'timeline-dot-done' : active ? 'timeline-dot-active' : 'timeline-dot-idle'}`}
              >
                {done && <RiCheckLine className="text-white text-[9px]" />}
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div className={`w-px flex-1 min-h-[28px] mt-1 ${done ? 'bg-emerald-500/40' : 'bg-white/8'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-5 min-w-0">
              <p className={`text-sm font-medium leading-none mb-1 ${done || active ? 'text-slate-100' : 'text-slate-500'}`}>
                {status}
              </p>
              {event && (
                <p className="text-xs text-slate-500">{formatDate(event.timestamp)}</p>
              )}
              {event?.note && (
                <p className="text-xs text-slate-400 mt-0.5 italic">{event.note}</p>
              )}
              {event?.actor?.name && (
                <p className="text-[11px] text-slate-600 mt-0.5">by {event.actor.name}</p>
              )}
            </div>
          </div>
        )
      })}

      {/* Extra events: Failed, Rescheduled, Cancelled */}
      {extraEvents.map((event, idx) => {
        const cfg = STATUS_CONFIG[event.status] || {}
        return (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                style={{ background: cfg.dot || '#6b7280', boxShadow: `0 0 0 3px ${cfg.dot || '#6b7280'}22` }}
              />
            </div>
            <div className="pb-5 min-w-0">
              <p className="text-sm font-medium text-slate-100 leading-none mb-1">{event.status}</p>
              <p className="text-xs text-slate-500">{formatDate(event.timestamp)}</p>
              {event.note && <p className="text-xs text-slate-400 mt-0.5 italic">{event.note}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}