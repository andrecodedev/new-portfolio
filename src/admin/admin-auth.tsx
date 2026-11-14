import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isCmsConfigured, supabase } from '../lib/supabase-client'
import { applyTheme, readStoredTheme } from '../theme'
import AdminCaptcha, { getTurnstileSiteKey } from './admin-captcha'
import { adminCopy } from './admin-copy'
import {
  clearLoginLock,
  fetchLoginLockStatus,
  formatLockCountdown,
  LoginLockRpcError,
  registerLoginFailure,
} from './admin-login-lock'
import { ADMIN_DASHBOARD_PATH } from './admin-paths'
import './admin.css'

type AuthStep = 'password' | 'mfa' | 'enroll'

export default function AdminAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [honey, setHoney] = useState('')
  const [otp, setOtp] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaReset, setCaptchaReset] = useState(0)
  const [step, setStep] = useState<AuthStep>('password')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockMs, setLockMs] = useState(0)
  const lockUntilRef = useRef(0)
  const navigate = useNavigate()
  const copy = adminCopy.auth
  const locked = lockMs > 0
  const captchaRequired = Boolean(getTurnstileSiteKey())

  const applyLockMs = (remainingMs: number) => {
    const ms = Math.max(0, remainingMs)
    lockUntilRef.current = ms > 0 ? Date.now() + ms : 0
    setLockMs(ms)
  }

  useEffect(() => {
    applyTheme(readStoredTheme())
  }, [])

  useEffect(() => {
    if (!locked) return
    const id = window.setInterval(() => {
      const remaining = Math.max(0, lockUntilRef.current - Date.now())
      setLockMs(remaining)
    }, 250)
    return () => window.clearInterval(id)
  }, [locked])

  useEffect(() => {
    if (!supabase) return

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel === 'aal2') {
        navigate(ADMIN_DASHBOARD_PATH, { replace: true })
      }
    })()
  }, [navigate])

  // Ao abrir a página (mesmo sem email / depois de limpar cookie),
  // consulta o lock do IP no servidor e mantém o "Aguarde" na tela.
  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    void (async () => {
      try {
        const status = await fetchLoginLockStatus('')
        if (!cancelled) applyLockMs(status.remainingMs)
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const trimmed = email.trim()
    if (!supabase) return

    let cancelled = false
    const id = window.setTimeout(() => {
      void (async () => {
        try {
          const status = await fetchLoginLockStatus(trimmed)
          if (!cancelled) applyLockMs(status.remainingMs)
        } catch {
          // keep previous lock state
        }
      })()
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [email])

  const enterDashboard = async () => {
    await clearLoginLock(email)
    applyLockMs(0)
    navigate(ADMIN_DASHBOARD_PATH, { replace: true })
  }

  const mapAuthError = (message: string) => {
    const lower = message.toLowerCase()
    if (lower.includes('captcha')) return copy.captchaFailed
    if (lower.includes('confirm')) return copy.unconfirmed
    return copy.error
  }

  const failSoft = async (authMessage?: string) => {
    setCaptchaToken(null)
    setCaptchaReset((n) => n + 1)
    try {
      const status = await registerLoginFailure(email)
      applyLockMs(status.remainingMs)
      setError(status.remainingMs > 0 ? null : mapAuthError(authMessage ?? ''))
    } catch (err) {
      applyLockMs(0)
      setError(
        err instanceof LoginLockRpcError ? copy.lockUnavailable : copy.error,
      )
    }
  }

  const requireSecondFactor = async () => {
    if (!supabase) return

    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aalError) {
      setError(copy.error)
      await supabase.auth.signOut()
      return
    }

    if (aal.currentLevel === 'aal2') {
      await enterDashboard()
      return
    }

    if (aal.nextLevel === 'aal2') {
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors()
      if (factorsError || !factors.totp[0]) {
        setError(copy.error)
        await supabase.auth.signOut()
        return
      }
      setFactorId(factors.totp[0].id)
      setStep('mfa')
      setOtp('')
      setError(null)
      return
    }

    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'device',
    })

    if (enrollError || !enrolled) {
      setError(copy.enrollError)
      await supabase.auth.signOut()
      return
    }

    setFactorId(enrolled.id)
    setQrCode(enrolled.totp.qr_code)
    setTotpSecret(enrolled.totp.secret)
    setStep('enroll')
    setOtp('')
    setError(null)
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()

    if (!supabase) {
      setError(copy.missing)
      return
    }

    if (honey.trim()) {
      await failSoft()
      return
    }

    try {
      const status = await fetchLoginLockStatus(email)
      if (status.remainingMs > 0) {
        applyLockMs(status.remainingMs)
        setError(null)
        return
      }
    } catch {
      setError(copy.lockUnavailable)
      return
    }

    if (captchaRequired && !captchaToken) {
      setError(copy.captchaRequired)
      return
    }

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    })

    if (authError) {
      await failSoft(authError.message)
      setLoading(false)
      return
    }

    await clearLoginLock(email)
    await requireSecondFactor()
    setLoading(false)
  }

  const verifyTotp = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase || !factorId) return

    setLoading(true)
    setError(null)

    const code = otp.replace(/\s/g, '')
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    })

    if (verifyError) {
      setError(step === 'enroll' ? copy.enrollError : copy.mfaError)
      setLoading(false)
      return
    }

    await enterDashboard()
  }

  return (
    <div className="admin admin--center">
      <div className="admin__card admin__card--gate">
        <h1 className="admin__title admin__title--gate">
          {step === 'password' ? copy.title : copy.mfaTitle}
        </h1>

        {step === 'password' ? (
          <form className="admin__form" onSubmit={handleLogin}>
            {!isCmsConfigured() ? (
              <p className="admin__error">{copy.missing}</p>
            ) : null}
            {locked ? (
              <p className="admin__lock" role="status">
                {copy.locked} {formatLockCountdown(lockMs)}
              </p>
            ) : error ? (
              <p className="admin__error">{error}</p>
            ) : null}

            <label className="admin__hp" aria-hidden="true">
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honey}
                onChange={(event) => setHoney(event.target.value)}
              />
            </label>

            <label className="admin__label">
              {copy.email}
              <input
                className="admin__input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="username"
                disabled={locked || loading}
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
                disabled={locked || loading}
              />
            </label>

            {captchaRequired ? (
              <div className="admin__captcha-block">
                <p className="admin__captcha-label">{copy.captchaLabel}</p>
                <AdminCaptcha onToken={setCaptchaToken} resetKey={captchaReset} />
              </div>
            ) : null}

            <button
              className="admin__btn admin__btn--solid"
              type="submit"
              disabled={
                loading ||
                locked ||
                !isCmsConfigured() ||
                (captchaRequired && !captchaToken)
              }
            >
              {loading ? <span className="admin__spin" /> : copy.submit}
            </button>
          </form>
        ) : (
          <form className="admin__form" onSubmit={verifyTotp}>
            {error ? <p className="admin__error">{error}</p> : null}

            {step === 'enroll' && qrCode ? (
              <div className="admin__mfa-qr">
                <img src={qrCode} alt="" width={180} height={180} />
                {totpSecret ? (
                  <code className="admin__mfa-secret">{totpSecret}</code>
                ) : null}
              </div>
            ) : null}

            <label className="admin__label">
              {copy.mfaCode}
              <input
                className="admin__input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="000000"
                required
                maxLength={10}
                disabled={loading}
              />
            </label>

            <button
              className="admin__btn admin__btn--solid"
              type="submit"
              disabled={loading || otp.trim().length < 6}
            >
              {loading ? <span className="admin__spin" /> : copy.mfaSubmit}
            </button>
          </form>
        )}

        <Link className="admin__link" to="/">
          {copy.back}
        </Link>
      </div>
    </div>
  )
}
