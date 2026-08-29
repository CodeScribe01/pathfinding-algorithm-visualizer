import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.username}`)
      navigate(location.state?.from ?? '/visualizer', { replace: true })
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Your run history, saved boards and analytics live behind your account. The visualiser itself works without one."
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="text-accent-soft transition-colors hover:text-white">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Username"
          icon={User}
          value={form.username}
          onChange={update('username')}
          autoComplete="username"
          required
          error={error?.fieldError?.('username')}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={update('password')}
          autoComplete="current-password"
          required
          error={error?.fieldError?.('password')}
        />

        {error && !error.fieldError?.('username') && !error.fieldError?.('password') ? (
          <p className="rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-2xs text-rose-300">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full" loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
