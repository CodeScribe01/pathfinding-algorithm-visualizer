import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, Lock, User } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

const MIN_PASSWORD_LENGTH = 8

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [localError, setLocalError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLocalError(null)

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setSubmitting(true)
    try {
      const user = await register(form)
      toast.success(`Account created — welcome, ${user.username}`)
      navigate('/visualizer', { replace: true })
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Keep your runs, boards and analytics across devices. Takes one form and no email confirmation."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="text-accent-soft transition-colors hover:text-white">
            Sign in
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
          label="Email"
          type="email"
          icon={AtSign}
          value={form.email}
          onChange={update('email')}
          autoComplete="email"
          required
          error={error?.fieldError?.('email')}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={update('password')}
          autoComplete="new-password"
          required
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={localError ?? error?.fieldError?.('password')}
        />

        {error && !error.details ? (
          <p className="rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-2xs text-rose-300">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
