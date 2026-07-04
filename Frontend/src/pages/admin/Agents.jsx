import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { RiMotorbikeLine, RiAddLine, RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri'

export default function AdminAgents() {
  const [agents, setAgents]   = useState([])
  const [zones, setZones]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', assignedZones: [] })
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/admin/agents'), api.get('/zones')])
      .then(([ag, zn]) => { setAgents(ag.data.users || []); setZones(zn.data.zones) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const createAgent = async () => {
    setBusy(true)
    try {
      await api.post('/admin/agents', form)
      toast.success('Agent account created!')
      setShowForm(false)
      setForm({ name: '', email: '', phone: '', password: '', assignedZones: [] })
      load()
    } catch (err) { toast.error(err.message) }
    finally { setBusy(false) }
  }

  const toggleAvailability = async (agentId, current) => {
    try {
      await api.patch(`/admin/agents/${agentId}`, { isAvailable: !current })
      toast.success(`Agent marked ${!current ? 'available' : 'unavailable'}`)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const toggleZone = (zoneId) => {
    setForm(f => ({
      ...f,
      assignedZones: f.assignedZones.includes(zoneId)
        ? f.assignedZones.filter(z => z !== zoneId)
        : [...f.assignedZones, zoneId]
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Delivery Agents</h1>
          <p className="section-sub">{agents.length} agents registered</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <RiAddLine /> Add Agent
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-200 mb-4">Create Agent Account</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" placeholder="Ravi Kumar" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="ravi@lastmile.com" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 99999 00000" value={form.phone}
                onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))} />
            </div>
          </div>

          {zones.length > 0 && (
            <div className="mt-4">
              <label className="label">Assign Zones</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {zones.map(z => (
                  <button key={z._id}
                    onClick={() => toggleZone(z._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.assignedZones.includes(z._id)
                        ? 'bg-gold-500/15 border-gold-500/40 text-gold-400'
                        : 'bg-white/4 border-white/8 text-slate-400 hover:bg-white/8'
                    }`}
                  >
                    {z.name} <span className="font-mono text-[10px] opacity-70">{z.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs">Cancel</button>
            <button onClick={createAgent} disabled={busy || !form.name || !form.email || !form.password}
              className="btn-primary text-xs">
              {busy ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </div>
      )}

      {/* Agents grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="card flex flex-col items-center py-16 gap-3">
          <RiMotorbikeLine className="text-4xl text-slate-600" />
          <p className="text-slate-400 text-sm">No agents yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent._id} className="card-hover p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                  {agent.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{agent.name}</p>
                  <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                  <p className="text-xs text-slate-500">{agent.phone}</p>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  agent.isAvailable
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.isAvailable ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {agent.isAvailable ? 'Available' : 'Busy'}
                </div>
              </div>

              {/* Zone tags */}
              {agent.assignedZones?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.assignedZones.map(z => (
                    <span key={z._id || z} className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/8 text-gold-500/80 border border-gold-500/15 font-mono">
                      {z.code || z}
                    </span>
                  ))}
                </div>
              )}

              {agent.currentLocation?.zone && (
                <p className="text-[10px] text-slate-500 mb-3">
                  Current zone: <span className="text-slate-400">{agent.currentLocation.zone.name || 'Unknown'}</span>
                </p>
              )}

              <button
                onClick={() => toggleAvailability(agent._id, agent.isAvailable)}
                className={`w-full text-xs py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  agent.isAvailable
                    ? 'bg-slate-700 hover:bg-slate-600 border-white/10 text-slate-400'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                }`}
              >
                {agent.isAvailable ? <><RiCloseCircleLine /> Mark Busy</> : <><RiCheckboxCircleLine /> Mark Available</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}