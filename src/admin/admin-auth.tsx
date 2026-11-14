import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isCmsConfigured, supabase } from '../lib/supabase-client'
import { applyTheme, readStoredTheme } from '../theme'
import AdminCaptcha, { getTurnstileSiteKey } from './admin-captcha'
import { adminCopy } from './admin-copy'
import {
  clearLoginLock,
  formatLockCountdown,
  getLockRemainingMs,
  isLoginLocked,
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
  const [lockMs, setLockMs] = useState(() => getLockRemainingMs())
  const navigate = useNavigate()
  const copy = adminCopy.auth
  const locked = lockMs > 0
  const captchaRequired = Boolean(getTurnstileSiteKey())

  useEffect(() => {
    applyTheme(readStoredTheme())
  }, [])

  useEffect(() => {
    if (!locked) return
    const id = window.setInterval(() => {
      setLockMs(getLockRemainingMs())
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

  const enterDashboard = () => {
    clearLoginLock()
    navigate(ADMIN_DASHBOARD_PATH, { replace: true })
  }

  const failSoft = () => {
    const next = registerLoginFailure()
    const remaining = getLockRemainingMs()
    setLockMs(remaining)
    setCaptchaToken(null)
    setCaptchaReset((n) => n + 1)
    if (remaining > 0) {
      setError(`${copy.locked} ${formatLockCountdown(remaining)}.`)
    } else {
      setError(copy.error)
    }
    return next
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
      enterDashboard()
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
      failSoft()
      return
    }

    if (isLoginLocked()) {
      setLockMs(getLockRemainingMs())
      setError(`${copy.locked} ${formatLockCountdown(getLockRemainingMs())}.`)
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
      failSoft()
      setLoading(false)
      return
    }

    clearLoginLock()
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

    enterDashboard()
  }

  return (
    <div className="admin admin--center">
      <div className="admin__card admin__card--gate">
        <div className="admin__gate-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <rect
              x="5"
              y="10"
              width="14"
              height="10"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M8 10V7a4 4 0 0 1 8 0v3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {step === 'password' ? (
          <form className="admin__form" onSubmit={handleLogin}>
            {error ? <p className="admin__error">{error}</p> : null}
            {!isCmsConfigured() ? (
              <p className="admin__error">{copy.missing}</p>
            ) : null}
            {locked ? (
              <p className="admin__error">
                {copy.locked} {formatLockCountdown(lockMs)}.
              </p>
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
              <span className="admin__sr">{copy.email}</span>
              <input
                className="admin__input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.email}
                required
                autoComplete="username"
                disabled={locked || loading}
              />
            </label>

            <label className="admin__label">
              <span className="admin__sr">{copy.password}</span>
              <input
                className="admin__input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={copy.password}
                required
                autoComplete="current-password"
                disabled={locked || loading}
              />
            </label>

            <AdminCaptcha onToken={setCaptchaToken} resetKey={captchaReset} />

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
              <span className="admin__sr">{copy.mfaCode}</span>
              <input
                className="admin__input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder={copy.mfaCode}
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

        <Link className="admin__link admin__link--quiet" to="/">
          ←
        </Link>
      </div>
    </div>
  )
}
