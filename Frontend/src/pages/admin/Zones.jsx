import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { RiMapLine, RiAddLine, RiDeleteBinLine, RiEditLine } from 'react-icons/ri'

export default function AdminZones() {
  const [zones, setZones]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editZone, setEditZone] = useState(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [areaForm, setAreaForm] = useState({ pincode: '', city: '', state: '' })
  const [addingAreaTo, setAddingAreaTo] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/zones').then(({ data }) => setZones(data.zones)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const saveZone = async () => {
    setBusy(true)
    try {
      if (editZone) {
        await api.put(`/zones/${editZone._id}`, form)
        toast.success('Zone updated!')
      } else {
        await api.post('/zones', form)
        toast.success('Zone created!')
      }
      setShowForm(false); setEditZone(null); setForm({ name: '', code: '' }); load()
    } catch (err) { toast.error(err.message) }
    finally { setBusy(false) }
  }

  const addArea = async (zoneId) => {
    setBusy(true)
    try {
      await api.post(`/zones/${zoneId}/areas`, areaForm)
      toast.success('Area added!')
      setAddingAreaTo(null); setAreaForm({ pincode: '', city: '', state: '' }); load()
    } catch (err) { toast.error(err.message) }
    finally { setBusy(false) }
  }

  const removeArea = async (zoneId, pincode) => {
    if (!confirm(`Remove pincode ${pincode}?`)) return
    try {
      await api.delete(`/zones/${zoneId}/areas/${pincode}`)
      toast.success('Pincode removed')
      load()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Zones</h1>
          <p className="section-sub">Manage delivery zones and their serviceable pincodes</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditZone(null); setForm({ name: '', code: '' }) }}
          className="btn-primary">
          <RiAddLine /> New Zone
        </button>
      </div>

      {/* Zone form */}
      {showForm && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-200 mb-4">{editZone ? 'Edit Zone' : 'Create Zone'}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="label">Zone Name</label>
              <input className="input" placeholder="North Mumbai" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="label">Zone Code</label>
              <input className="input font-mono uppercase" placeholder="NMUM" value={form.code}
                onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); setEditZone(null) }} className="btn-secondary text-xs">Cancel</button>
            <button onClick={saveZone} disabled={busy || !form.name || !form.code} className="btn-primary text-xs">
              {busy ? 'Saving...' : editZone ? 'Update Zone' : 'Create Zone'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : zones.length === 0 ? (
        <div className="card flex flex-col items-center py-16 gap-3">
          <RiMapLine className="text-4xl text-slate-600" />
          <p className="text-slate-400 text-sm">No zones configured yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map(zone => (
            <div key={zone._id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20">
                    <span className="text-xs font-bold text-gold-500 font-mono">{zone.code}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{zone.name}</p>
                    <p className="text-xs text-slate-500">{zone.areas.length} serviceable pincode{zone.areas.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditZone(zone); setForm({ name: zone.name, code: zone.code }); setShowForm(true) }}
                    className="btn-ghost text-xs p-1.5"
                  ><RiEditLine /></button>
                  <button
                    onClick={() => setAddingAreaTo(addingAreaTo === zone._id ? null : zone._id)}
                    className="btn-secondary text-xs"
                  ><RiAddLine /> Add Pincode</button>
                </div>
              </div>

              {/* Add area form */}
              {addingAreaTo === zone._id && (
                <div className="mb-4 p-4 bg-white/3 rounded-lg border border-white/6">
                  <p className="text-xs font-semibold text-slate-400 mb-3">Add Serviceable Pincode</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="form-group">
                      <label className="label">Pincode</label>
                      <input className="input font-mono" placeholder="400001" maxLength={6}
                        value={areaForm.pincode} onChange={e => setAreaForm(f => ({...f, pincode: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="label">City</label>
                      <input className="input" placeholder="Mumbai" value={areaForm.city}
                        onChange={e => setAreaForm(f => ({...f, city: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="label">State</label>
                      <input className="input" placeholder="Maharashtra" value={areaForm.state}
                        onChange={e => setAreaForm(f => ({...f, state: e.target.value}))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAddingAreaTo(null)} className="btn-secondary text-xs">Cancel</button>
                    <button onClick={() => addArea(zone._id)}
                      disabled={busy || !areaForm.pincode || !areaForm.city || !areaForm.state}
                      className="btn-primary text-xs">Add</button>
                  </div>
                </div>
              )}

              {/* Areas list */}
              {zone.areas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {zone.areas.map(area => (
                    <div key={area.pincode}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border border-white/6 rounded-lg group">
                      <span className="font-mono text-xs text-slate-300">{area.pincode}</span>
                      <span className="text-[10px] text-slate-500">{area.city}</span>
                      <button onClick={() => removeArea(zone._id, area.pincode)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1">
                        <RiDeleteBinLine className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">No pincodes added yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}