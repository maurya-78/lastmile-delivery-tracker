import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import ChargeBreakdown from '../../components/ChargeBreakdown'
import {
  RiMapPinLine, RiBox3Line, RiMoneyDollarCircleLine,
  RiCheckboxCircleLine, RiArrowRightLine, RiArrowLeftLine, RiLoader4Line
} from 'react-icons/ri'

const STEPS = ['Address', 'Package', 'Review & Pay']

const initialForm = {
  pickup: { address: '', city: '', state: '', pincode: '' },
  drop:   { address: '', city: '', state: '', pincode: '' },
  package: { length: '', breadth: '', height: '', actualWeight: '' },
  orderType: 'B2C',
  paymentType: 'Prepaid',
  scheduledDate: '',
}

export default function PlaceOrder() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState(initialForm)
  const [estimate, setEstimate] = useState(null)
  const [estimating, setEstimating] = useState(false)
  const [placing, setPlacing]   = useState(false)

  const setAddr = (type, field, val) =>
    setForm(f => ({ ...f, [type]: { ...f[type], [field]: val } }))

  const setPkg = (field, val) =>
    setForm(f => ({ ...f, package: { ...f.package, [field]: val } }))

  const getEstimate = async () => {
    setEstimating(true)
    try {
      const { data } = await api.post('/orders/estimate', {
        pickup:      form.pickup,
        drop:        form.drop,
        packageInfo: form.package,
        orderType:   form.orderType,
        paymentType: form.paymentType,
      })
      setEstimate(data.estimate)
      setStep(2)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEstimating(false)
    }
  }

  const handleNext = async () => {
    if (step === 0) {
      // Validate addresses
      const pErr = Object.values(form.pickup).some(v => !v)
      const dErr = Object.values(form.drop).some(v => !v)
      if (pErr || dErr) { toast.error('Fill all address fields.'); return }
      setStep(1)
    } else if (step === 1) {
      const { length, breadth, height, actualWeight } = form.package
      if (!length || !breadth || !height || !actualWeight) {
        toast.error('Fill all package dimensions and weight.'); return
      }
      await getEstimate()
    }
  }

  const handlePlace = async () => {
    setPlacing(true)
    try {
      const { data } = await api.post('/orders', {
        pickup:      form.pickup,
        drop:        form.drop,
        packageInfo: form.package,
        orderType:   form.orderType,
        paymentType: form.paymentType,
        scheduledDate: form.scheduledDate || undefined,
      })
      toast.success(`Order ${data.order.orderNumber} placed!`)
      navigate(`/dashboard/orders/${data.order._id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Place New Order</h1>
        <p className="section-sub">Smart pricing calculated before you confirm</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-gold-500' : 'text-slate-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                ${i < step ? 'bg-gold-500 border-gold-500 text-navy-950'
                  : i === step ? 'border-gold-500 text-gold-500'
                  : 'border-white/10 text-slate-600'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? 'bg-gold-500/40' : 'bg-white/8'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Addresses */}
      {step === 0 && (
        <div className="space-y-4">
          <AddressBlock
            title="Pickup Address" icon={<RiMapPinLine className="text-gold-500" />}
            data={form.pickup} onChange={(f, v) => setAddr('pickup', f, v)}
          />
          <AddressBlock
            title="Delivery Address" icon={<RiMapPinLine className="text-cyan-400" />}
            data={form.drop} onChange={(f, v) => setAddr('drop', f, v)}
          />
        </div>
      )}

      {/* Step 1: Package */}
      {step === 1 && (
        <div className="card p-5 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <RiBox3Line className="text-gold-500 text-lg" />
            <p className="text-sm font-semibold text-slate-200">Package Details</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[['length', 'Length (cm)'], ['breadth', 'Breadth (cm)'], ['height', 'Height (cm)']].map(([k, lbl]) => (
              <div key={k} className="form-group">
                <label className="label">{lbl}</label>
                <input type="number" min="0" step="0.1" className="input font-mono"
                  placeholder="0" value={form.package[k]}
                  onChange={e => setPkg(k, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="label">Actual Weight (kg)</label>
            <input type="number" min="0" step="0.1" className="input font-mono"
              placeholder="0.00" value={form.package.actualWeight}
              onChange={e => setPkg('actualWeight', e.target.value)} />
            <p className="text-[11px] text-slate-500 mt-1">
              Volumetric weight = L×B×H÷5000. You're billed on whichever is higher.
            </p>
          </div>

          {form.package.length && form.package.breadth && form.package.height && (
            <div className="p-3 bg-white/3 border border-white/6 rounded-lg text-xs text-slate-400 font-mono">
              Volumetric weight ={' '}
              <span className="text-gold-500">
                {((+form.package.length * +form.package.breadth * +form.package.height) / 5000).toFixed(2)} kg
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Order Type</label>
              <select className="select" value={form.orderType} onChange={e => setForm(f => ({...f, orderType: e.target.value}))}>
                <option value="B2C">B2C (Business to Customer)</option>
                <option value="B2B">B2B (Business to Business)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Payment Type</label>
              <select className="select" value={form.paymentType} onChange={e => setForm(f => ({...f, paymentType: e.target.value}))}>
                <option value="Prepaid">Prepaid</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Scheduled Date (optional)</label>
            <input type="date" className="input"
              min={new Date().toISOString().split('T')[0]}
              value={form.scheduledDate}
              onChange={e => setForm(f => ({...f, scheduledDate: e.target.value}))} />
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && estimate && (
        <div className="space-y-4">
          <ChargeBreakdown estimate={estimate} />

          <div className="card p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Order Summary</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <InfoRow label="From" value={`${form.pickup.city}, ${form.pickup.pincode}`} />
              <InfoRow label="To"   value={`${form.drop.city}, ${form.drop.pincode}`} />
              <InfoRow label="Type"    value={form.orderType} />
              <InfoRow label="Payment" value={form.paymentType} />
              <InfoRow label="Dimensions"
                value={`${form.package.length}×${form.package.breadth}×${form.package.height} cm`} />
              <InfoRow label="Actual Weight" value={`${form.package.actualWeight} kg`} />
            </div>
          </div>

          {form.paymentType === 'COD' && (
            <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400">
                <strong>COD Surcharge applied.</strong> The delivery agent will collect payment at the drop address.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
            <RiArrowLeftLine /> Back
          </button>
        )}
        {step < 2 ? (
          <button onClick={handleNext} className="btn-primary ml-auto" disabled={estimating}>
            {estimating
              ? <><RiLoader4Line className="animate-spin" /> Calculating...</>
              : <>Next <RiArrowRightLine /></>}
          </button>
        ) : (
          <button onClick={handlePlace} className="btn-primary ml-auto" disabled={placing}>
            {placing
              ? <><span className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> Placing...</>
              : <><RiCheckboxCircleLine /> Confirm & Place Order</>}
          </button>
        )}
      </div>
    </div>
  )
}

function AddressBlock({ title, icon, data, onChange }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm font-semibold text-slate-200">{title}</p>
      </div>
      <div className="form-group">
        <label className="label">Street Address</label>
        <input className="input" placeholder="Building, Street" value={data.address}
          onChange={e => onChange('address', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">City</label>
          <input className="input" placeholder="Mumbai" value={data.city}
            onChange={e => onChange('city', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">State</label>
          <input className="input" placeholder="Maharashtra" value={data.state}
            onChange={e => onChange('state', e.target.value)} />
        </div>
        <div className="form-group col-span-2">
          <label className="label">Pincode</label>
          <input className="input font-mono" placeholder="400001" maxLength={6} value={data.pincode}
            onChange={e => onChange('pincode', e.target.value)} />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-slate-200 text-xs font-medium">{value}</p>
    </>
  )
}