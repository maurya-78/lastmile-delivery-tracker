import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/helpers'
import { RiPriceTagLine, RiAddLine, RiEditLine } from 'react-icons/ri'

export default function AdminRateCards() {
  const [cards, setCards]     = useState([])
  const [zones, setZones]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [busy, setBusy] = useState(false)

  const emptyForm = {
    name: '', orderType: 'B2C',
    intraZoneRate: { baseCharge: '', perKgRate: '', minWeight: '0.5' },
    codSurcharge: '',
    interZoneRates: [],
  }
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/rate-cards'), api.get('/zones')])
      .then(([rc, zn]) => { setCards(rc.data.rateCards || []); setZones(zn.data.zones) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const addInterZoneRow = () => {
    setForm(f => ({
      ...f,
      interZoneRates: [...f.interZoneRates, { fromZone: '', toZone: '', baseCharge: '', perKgRate: '', minWeight: '0.5' }]
    }))
  }

  const updateInterRow = (idx, field, val) => {
    setForm(f => {
      const rows = [...f.interZoneRates]
      rows[idx] = { ...rows[idx], [field]: val }
      return { ...f, interZoneRates: rows }
    })
  }

  const removeInterRow = (idx) => {
    setForm(f => ({ ...f, interZoneRates: f.interZoneRates.filter((_, i) => i !== idx) }))
  }

  const saveCard = async () => {
    setBusy(true)
    try {
      if (editCard) {
        await api.put(`/rate-cards/${editCard._id}`, form)
        toast.success('Rate card updated!')
      } else {
        await api.post('/rate-cards', form)
        toast.success('Rate card created!')
      }
      setShowForm(false); setEditCard(null); setForm(emptyForm); load()
    } catch (err) { toast.error(err.message) }
    finally { setBusy(false) }
  }

  const openEdit = (card) => {
    setEditCard(card)
    setForm({
      name: card.name, orderType: card.orderType,
      intraZoneRate: { ...card.intraZoneRate },
      codSurcharge: card.codSurcharge,
      interZoneRates: card.interZoneRates.map(r => ({
        fromZone: r.fromZone?._id || r.fromZone,
        toZone:   r.toZone?._id   || r.toZone,
        baseCharge: r.baseCharge, perKgRate: r.perKgRate, minWeight: r.minWeight,
      })),
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Rate Cards</h1>
          <p className="section-sub">Configure B2B and B2C pricing for zones</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditCard(null); setForm(emptyForm) }}
          className="btn-primary"><RiAddLine /> New Rate Card</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 space-y-5">
          <p className="text-sm font-semibold text-slate-200">{editCard ? 'Edit Rate Card' : 'Create Rate Card'}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Card Name</label>
              <input className="input" placeholder="Standard B2C" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="label">Order Type</label>
              <select className="select" value={form.orderType}
                onChange={e => setForm(f => ({...f, orderType: e.target.value}))}>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
          </div>

          {/* Intra-zone */}
          <div className="p-4 bg-white/3 rounded-xl border border-white/6">
            <p className="text-xs font-semibold text-gold-500 mb-3">Intra-Zone Rate (same zone pickup & drop)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['baseCharge', 'Base Charge (₹)'],
                ['perKgRate',  'Per Kg Rate (₹)'],
                ['minWeight',  'Min. Weight (kg)'],
              ].map(([k, lbl]) => (
                <div key={k} className="form-group">
                  <label className="label">{lbl}</label>
                  <input type="number" step="0.01" min="0" className="input font-mono"
                    placeholder="0" value={form.intraZoneRate[k]}
                    onChange={e => setForm(f => ({...f, intraZoneRate: {...f.intraZoneRate, [k]: e.target.value}}))} />
                </div>
              ))}
            </div>
          </div>

          {/* COD surcharge */}
          <div className="form-group">
            <label className="label">COD Surcharge (₹ per order)</label>
            <input type="number" step="0.01" min="0" className="input font-mono w-48"
              placeholder="0" value={form.codSurcharge}
              onChange={e => setForm(f => ({...f, codSurcharge: e.target.value}))} />
          </div>

          {/* Inter-zone rates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-cyan-400">Inter-Zone Rates</p>
              <button onClick={addInterZoneRow} className="btn-ghost text-xs"><RiAddLine /> Add Route</button>
            </div>
            <div className="space-y-3">
              {form.interZoneRates.map((row, idx) => (
                <div key={idx} className="p-3 bg-white/3 rounded-lg border border-white/6">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="form-group">
                      <label className="label">From Zone</label>
                      <select className="select text-xs py-2" value={row.fromZone}
                        onChange={e => updateInterRow(idx, 'fromZone', e.target.value)}>
                        <option value="">Select...</option>
                        {zones.map(z => <option key={z._id} value={z._id}>{z.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">To Zone</label>
                      <select className="select text-xs py-2" value={row.toZone}
                        onChange={e => updateInterRow(idx, 'toZone', e.target.value)}>
                        <option value="">Select...</option>
                        {zones.map(z => <option key={z._id} value={z._id}>{z.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Base (₹)</label>
                      <input type="number" className="input font-mono text-xs py-2" placeholder="0"
                        value={row.baseCharge} onChange={e => updateInterRow(idx, 'baseCharge', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Per Kg (₹)</label>
                      <input type="number" className="input font-mono text-xs py-2" placeholder="0"
                        value={row.perKgRate} onChange={e => updateInterRow(idx, 'perKgRate', e.target.value)} />
                    </div>
                    <div className="flex items-end pb-0.5">
                      <button onClick={() => removeInterRow(idx)} className="btn-danger text-xs py-2 w-full justify-center">✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {form.interZoneRates.length === 0 && (
                <p className="text-xs text-slate-600 italic px-1">No inter-zone routes configured yet.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button onClick={() => { setShowForm(false); setEditCard(null) }} className="btn-secondary text-xs">Cancel</button>
            <button onClick={saveCard} disabled={busy || !form.name} className="btn-primary text-xs">
              {busy ? 'Saving...' : editCard ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </div>
      )}

      {/* Cards list */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {cards.map(card => (
            <div key={card._id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${card.orderType === 'B2B' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'}`}>
                    {card.orderType}
                  </span>
                  <p className="text-sm font-semibold text-slate-200">{card.name}</p>
                </div>
                <button onClick={() => openEdit(card)} className="btn-ghost text-xs">
                  <RiEditLine /> Edit
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                <InfoBox label="Intra Base"   value={formatCurrency(card.intraZoneRate?.baseCharge)} />
                <InfoBox label="Intra/kg"     value={formatCurrency(card.intraZoneRate?.perKgRate)} />
                <InfoBox label="Min Weight"   value={`${card.intraZoneRate?.minWeight} kg`} />
                <InfoBox label="COD Surcharge" value={formatCurrency(card.codSurcharge)} accent />
              </div>

              {card.interZoneRates?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Inter-Zone Routes ({card.interZoneRates.length})</p>
                  <div className="space-y-1">
                    {card.interZoneRates.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs bg-white/3 px-3 py-2 rounded-lg">
                        <span className="text-slate-300 font-medium">{r.fromZone?.name}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-300 font-medium">{r.toZone?.name}</span>
                        <span className="ml-auto text-slate-400">Base: <span className="text-slate-200 font-mono">{formatCurrency(r.baseCharge)}</span></span>
                        <span className="text-slate-400">Per kg: <span className="text-slate-200 font-mono">{formatCurrency(r.perKgRate)}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {cards.length === 0 && (
            <div className="card flex flex-col items-center py-16 gap-3">
              <RiPriceTagLine className="text-4xl text-slate-600" />
              <p className="text-slate-400 text-sm">No rate cards configured</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoBox({ label, value, accent }) {
  return (
    <div className="p-3 bg-white/3 rounded-lg border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm font-semibold font-mono ${accent ? 'text-amber-400' : 'text-slate-200'}`}>{value}</p>
    </div>
  )
}