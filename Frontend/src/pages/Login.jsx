import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { RiTruckLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [show, setShow]   = useState(false)
  const [busy, setBusy]   = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const dest = { admin: '/admin', agent: '/agent', customer: '/dashboard' }
      navigate(dest[user.role] || '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[44%] bg-navy-900 border-r border-white/5 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center">
            <RiTruckLine className="text-navy-950 text-xl" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">LastMile</span>
        </div>

        <div>
          <p className="text-4xl font-bold text-white leading-snug mb-4">
            Deliveries that<br />
            <span className="text-gold-500">move fast.</span><br />
            Tracking that<br />never misses.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Real-time status, zone-smart routing, and intelligent agent assignment — all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['Zone-Based', 'Pricing'], ['Auto', 'Assignment'], ['Live', 'Tracking']].map(([a, b]) => (
            <div key={a} className="bg-white/4 border border-white/6 rounded-xl p-4">
              <p className="text-gold-500 font-semibold text-sm">{a}</p>
              <p className="text-slate-400 text-xs">{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
                <RiTruckLine className="text-navy-950" />
              </div>
              <span className="font-bold text-white">LastMile</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
            <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {show ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={busy}>
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
              Create one
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 p-4 bg-white/3 border border-white/6 rounded-xl">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-400 font-mono">
              <p>Admin: admin@lastmile.com / admin123</p>
              <p>Agent: agent@lastmile.com / agent123</p>
              <p>Customer: customer@lastmile.com / cust123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}