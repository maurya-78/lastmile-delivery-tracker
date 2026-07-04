import { formatCurrency } from '../utils/helpers'
import { RiScalesLine, RiMapPinLine, RiMoneyDollarCircleLine } from 'react-icons/ri'

export default function ChargeBreakdown({ estimate, compact = false }) {
  if (!estimate) return null
  const { pickupZone, dropZone, isIntraZone, volumetricWeight, billedWeight, charge } = estimate

  return (
    <div className="card p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
        <RiMoneyDollarCircleLine className="text-gold-500" />
        Charge Breakdown
      </p>

      {/* Zone info */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RiMapPinLine className="text-gold-500 flex-shrink-0" />
        <span>
          {pickupZone?.name} → {dropZone?.name}
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isIntraZone ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
            {isIntraZone ? 'Intra-Zone' : 'Inter-Zone'}
          </span>
        </span>
      </div>

      {/* Weight info */}
      {!compact && (
        <div className="flex items-start gap-2 text-xs text-slate-400">
          <RiScalesLine className="text-gold-500 flex-shrink-0 mt-0.5" />
          <span>
            Volumetric: <span className="text-slate-200">{volumetricWeight} kg</span>
            &nbsp;·&nbsp;
            Billed: <span className="text-slate-200 font-semibold">{billedWeight} kg</span>
            &nbsp;
            <span className="text-[10px] text-slate-500">(higher of actual vs volumetric)</span>
          </span>
        </div>
      )}

      {/* Fee rows */}
      <div className="space-y-1.5 pt-1 border-t border-white/5">
        <FeeRow label="Base Charge"   value={charge.baseCharge} />
        <FeeRow label="Weight Charge" value={charge.weightCharge} />
        {charge.codSurcharge > 0 && (
          <FeeRow label="COD Surcharge" value={charge.codSurcharge} accent />
        )}
        <div className="flex justify-between items-center pt-1.5 border-t border-white/8">
          <span className="text-sm font-semibold text-slate-200">Total Charge</span>
          <span className="text-lg font-bold text-gold-500 font-mono">
            {formatCurrency(charge.totalCharge)}
          </span>
        </div>
      </div>
    </div>
  )
}

function FeeRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={accent ? 'text-amber-400 font-medium' : 'text-slate-300'}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}