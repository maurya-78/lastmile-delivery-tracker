import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { RiTruckLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '',role: 'customer' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role })
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <RiTruckLine className="text-navy-950" />
          </div>
          <span className="font-bold text-white text-lg">LastMile</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-slate-400 text-sm mb-8">Join LastMile to start shipping</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" placeholder="Rahul Sharma" value={form.name}
              onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="rahul@company.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input type="tel" className="input" placeholder="+91 98765 43210" value={form.phone}
              onChange={(e) => set('phone', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} className="input pr-10"
                placeholder="Min 6 characters" value={form.password}
                onChange={(e) => set('password', e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Confirm Password</label>
            <input type="password" className="input" placeholder="Re-enter password" value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)} required />
          </div>

          <div className="form-group">
  <label className="label">Role</label>

  <select
    className="input"
    value={form.role}
    onChange={(e) => set('role', e.target.value)}
  >
    <option value="customer">Customer</option>
    <option value="agent">Agent</option>
    <option value="admin">Admin</option>
  </select>
</div>

          <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={busy}>
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}