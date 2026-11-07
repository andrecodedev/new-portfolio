import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isCmsConfigured, supabase } from '../lib/supabase-client'
import { applyTheme, readStoredTheme } from '../theme'
import { adminCopy } from './admin-copy'
import { ADMIN_DASHBOARD_PATH } from './admin-paths'
import './admin.css'

export default function AdminAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const copy = adminCopy.auth

  useEffect(() => {
    applyTheme(readStoredTheme())
  }, [])

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(ADMIN_DASHBOARD_PATH, { replace: true })
    })
  }, [navigate])

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()

    if (!supabase) {
      setError(copy.missing)
      return
    }

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(copy.error)
      setLoading(false)
      return
    }

    navigate(ADMIN_DASHBOARD_PATH, { replace: true })
  }

  return (
    <div className="admin admin--center">
      <div className="admin__card">
        <div>
          <p className="admin__kicker">Admin</p>
          <h1 className="admin__title">{copy.title}</h1>
          <p className="admin__lead">{copy.subtitle}</p>
        </div>

        <form className="admin__form" onSubmit={handleLogin}>
          {error ? <p className="admin__error">{error}</p> : null}
          {!isCmsConfigured() ? (
            <p className="admin__error">{copy.missing}</p>
          ) : null}

          <label className="admin__label">
            {copy.email}
            <input
              className="admin__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="admin__label">
            {copy.password}
            <input
              className="admin__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <button
            className="admin__btn admin__btn--solid"
            type="submit"
            disabled={loading || !isCmsConfigured()}
          >
            {loading ? <span className="admin__spin" /> : copy.submit}
          </button>
        </form>

        <Link className="admin__link" to="/">
          {copy.back}
        </Link>
      </div>
    </div>
  )
}
