import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  defaultGatePayload,
  fetchGatePayload,
  saveGatePayload,
  type CmsGatePayload,
} from '../cms/gate-content'
import {
  defaultHeroPayload,
  fetchHeroPayload,
  saveHeroPayload,
  type CmsHeroPayload,
} from '../cms/hero-content'
import type { Locale } from '../i18n/copy'
import { supabase } from '../lib/supabase-client'
import {
  applyTheme,
  readDocumentTheme,
  ThemeIcon,
  type Theme,
} from '../theme'
import { adminCopy } from './admin-copy'
import { ADMIN_BASE_PATH } from './admin-paths'
import GateEditor from './gate-editor'
import HeroEditor from './hero-editor'
import LivePreview from './live-preview'
import SidebarMenu, { type AdminView } from './sidebar-menu'
import './admin.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const copy = adminCopy.dashboard
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle')
  const [currentView, setCurrentView] = useState<AdminView>('menu')
  const [previewLang, setPreviewLang] = useState<Locale>('pt')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop',
  )
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(readDocumentTheme)
  const [heroData, setHeroData] = useState<CmsHeroPayload>(defaultHeroPayload)
  const [initialHeroData, setInitialHeroData] =
    useState<CmsHeroPayload>(defaultHeroPayload)
  const [gateData, setGateData] = useState<CmsGatePayload>(defaultGatePayload)
  const [initialGateData, setInitialGateData] =
    useState<CmsGatePayload>(defaultGatePayload)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const heroDirty = JSON.stringify(heroData) !== JSON.stringify(initialHeroData)
  const gateDirty = JSON.stringify(gateData) !== JSON.stringify(initialGateData)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const client = supabase
    if (!client) {
      navigate(ADMIN_BASE_PATH, { replace: true })
      return
    }

    const load = async () => {
      const {
        data: { session },
      } = await client.auth.getSession()

      if (!session) {
        navigate(ADMIN_BASE_PATH, { replace: true })
        return
      }

      const [heroPayload, gatePayload] = await Promise.all([
        fetchHeroPayload(),
        fetchGatePayload(),
      ])
      setHeroData(heroPayload)
      setInitialHeroData(heroPayload)
      setGateData(gatePayload)
      setInitialGateData(gatePayload)
      setLoading(false)
    }

    void load()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate(ADMIN_BASE_PATH, { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleProtectedAction = (action: () => void) => {
    if (heroDirty || gateDirty) {
      setPendingAction(() => action)
      setShowUnsavedConfirm(true)
      return
    }
    action()
  }

  const confirmUnsavedAction = () => {
    setHeroData(initialHeroData)
    setGateData(initialGateData)
    setShowUnsavedConfirm(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      if (currentView === 'gate') {
        await saveGatePayload(gateData)
        setInitialGateData(gateData)
      } else {
        await saveHeroPayload(heroData)
        setInitialHeroData(heroData)
      }
      setSaveStatus('success')
      window.setTimeout(() => setSaveStatus('idle'), 2400)
    } catch {
      setSaveStatus('error')
      window.setTimeout(() => setSaveStatus('idle'), 2400)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="admin">
        <header className="admin__header">
          <div className="admin__header-copy">
            <div className="admin__skel" style={{ width: 180, height: 18 }} />
            <div
              className="admin__skel"
              style={{ width: 120, height: 10, marginTop: 8 }}
            />
          </div>
        </header>
        <div className="admin__workspace">
          <div className="admin__editor">
            <div className="admin__skel" style={{ width: '100%', height: 64 }} />
          </div>
          <div className="admin__preview" />
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__header-copy">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <div className="admin__header-actions">
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
          >
            {adminCopy.auth.back}
          </button>
          <button
            className="admin__btn admin__btn--ghost admin__btn--icon"
            type="button"
            aria-label={theme === 'dark' ? copy.themeLight : copy.themeDark}
            title={theme === 'dark' ? copy.themeLight : copy.themeDark}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <ThemeIcon
              theme={theme === 'dark' ? 'light' : 'dark'}
              className="admin__theme-icon"
            />
          </button>
          <button
            className="admin__btn admin__btn--danger"
            type="button"
            onClick={() =>
              handleProtectedAction(() => setShowLogoutConfirm(true))
            }
          >
            {copy.logout}
          </button>
        </div>
      </header>

      <div className="admin__workspace">
        <div className="admin__editor">
          {currentView === 'menu' ? (
            <SidebarMenu
              onOpenHero={() =>
                handleProtectedAction(() => {
                  setEditingModuleId(null)
                  setCurrentView('hero')
                })
              }
              onOpenGate={() =>
                handleProtectedAction(() => {
                  setEditingModuleId(null)
                  setCurrentView('gate')
                })
              }
            />
          ) : currentView === 'gate' ? (
            <GateEditor
              gateData={gateData}
              onChange={setGateData}
              saveStatus={saveStatus}
              isDirty={gateDirty}
              onSave={() => {
                void handleSave()
              }}
              onBack={() =>
                handleProtectedAction(() => {
                  setEditingModuleId(null)
                  setCurrentView('menu')
                })
              }
              editingId={editingModuleId}
              onEditingIdChange={setEditingModuleId}
            />
          ) : (
            <HeroEditor
              heroData={heroData}
              onChange={setHeroData}
              saveStatus={saveStatus}
              isDirty={heroDirty}
              onSave={() => {
                void handleSave()
              }}
              onBack={() =>
                handleProtectedAction(() => {
                  setEditingModuleId(null)
                  setCurrentView('menu')
                })
              }
              editingId={editingModuleId}
              onEditingIdChange={setEditingModuleId}
            />
          )}
        </div>

        <LivePreview
          currentView={currentView}
          previewLang={previewLang}
          onPreviewLang={setPreviewLang}
          previewDevice={previewDevice}
          onPreviewDevice={setPreviewDevice}
          heroData={heroData}
          gateData={gateData}
          previewModuleId={editingModuleId}
        />
      </div>

      {showUnsavedConfirm ? (
        <div className="admin__modal">
          <div className="admin__dialog" role="dialog" aria-modal="true">
            <h2>{copy.unsavedTitle}</h2>
            <p>{copy.unsavedDesc}</p>
            <div className="admin__dialog-actions">
              <button
                className="admin__btn admin__btn--ghost"
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
              >
                {copy.keepEditing}
              </button>
              <button
                className="admin__btn admin__btn--danger"
                type="button"
                onClick={confirmUnsavedAction}
              >
                {copy.discard}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showLeaveConfirm ? (
        <div className="admin__modal">
          <div className="admin__dialog" role="dialog" aria-modal="true">
            <h2>{copy.leaveTitle}</h2>
            <p>{copy.leaveDesc}</p>
            <div className="admin__dialog-actions">
              <button
                className="admin__btn admin__btn--ghost"
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
              >
                {copy.cancel}
              </button>
              <button
                className="admin__btn admin__btn--solid"
                type="button"
                onClick={() => {
                  setShowLeaveConfirm(false)
                  handleProtectedAction(() => {
                    navigate('/')
                  })
                }}
              >
                {copy.confirmLeave}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showLogoutConfirm ? (
        <div className="admin__modal">
          <div className="admin__dialog" role="dialog" aria-modal="true">
            <h2>{copy.logoutTitle}</h2>
            <p>{copy.logoutDesc}</p>
            <div className="admin__dialog-actions">
              <button
                className="admin__btn admin__btn--ghost"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                {copy.cancel}
              </button>
              <button
                className="admin__btn admin__btn--danger"
                type="button"
                onClick={() => {
                  void handleLogout()
                }}
              >
                {copy.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
