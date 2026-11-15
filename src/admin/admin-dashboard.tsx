import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleProvider'
import {
  defaultChromePayload,
  fetchChromePayload,
  saveChromePayload,
} from '../cms/chrome-content'
import {
  defaultDesignPayload,
  fetchDesignPayload,
  saveDesignPayload,
} from '../cms/design-content'
import {
  defaultFooterPayload,
  fetchFooterPayload,
  saveFooterPayload,
} from '../cms/footer-content'
import {
  defaultGatePayload,
  fetchGatePayload,
  saveGatePayload,
} from '../cms/gate-content'
import {
  defaultHeaderPayload,
  fetchHeaderPayload,
  saveHeaderPayload,
} from '../cms/header-content'
import {
  defaultHeroPayload,
  fetchHeroPayload,
  saveHeroPayload,
} from '../cms/hero-content'
import { supabase } from '../lib/supabase-client'
import {
  applyTheme,
  readDocumentTheme,
  ThemeIcon,
  type Theme,
} from '../theme'
import { adminCopy } from './admin-copy'
import { ADMIN_BASE_PATH } from './admin-paths'
import { applyAdminNoIndex } from './admin-seo'
import ChromeEditor from './chrome-editor'
import DesignEditor from './design-editor'
import FooterEditor from './footer-editor'
import GateEditor from './gate-editor'
import HeaderEditor from './header-editor'
import HeroEditor from './hero-editor'
import LivePreview from './live-preview'
import SidebarMenu, { type AdminView } from './sidebar-menu'
import { useUndoableState } from './use-undoable-state'
import './admin.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  // Assina o idioma: sem isso o painel não re-renderiza quando troca PT/EN/ES.
  const { dictionaryLocale, setLocale } = useLocale()
  const copy = adminCopy.dashboard
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle')
  const [currentView, setCurrentView] = useState<AdminView>('menu')
  const [previewLang, setPreviewLang] = useState('pt')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop',
  )
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(readDocumentTheme)
  const [heroSeed] = useState(() => defaultHeroPayload())
  const [gateSeed] = useState(() => defaultGatePayload())
  const [headerSeed] = useState(() => defaultHeaderPayload())
  const [footerSeed] = useState(() => defaultFooterPayload())
  const [chromeSeed] = useState(() => defaultChromePayload())
  const [designSeed] = useState(() => defaultDesignPayload())

  const {
    state: heroData,
    set: setHeroData,
    reset: resetHeroData,
    undo: undoHero,
    redo: redoHero,
    canUndo: canUndoHero,
    canRedo: canRedoHero,
  } = useUndoableState(heroSeed)
  const {
    state: gateData,
    set: setGateData,
    reset: resetGateData,
    undo: undoGate,
    redo: redoGate,
    canUndo: canUndoGate,
    canRedo: canRedoGate,
  } = useUndoableState(gateSeed)
  const {
    state: headerData,
    set: setHeaderData,
    reset: resetHeaderData,
    undo: undoHeader,
    redo: redoHeader,
    canUndo: canUndoHeader,
    canRedo: canRedoHeader,
  } = useUndoableState(headerSeed)
  const {
    state: footerData,
    set: setFooterData,
    reset: resetFooterData,
    undo: undoFooter,
    redo: redoFooter,
    canUndo: canUndoFooter,
    canRedo: canRedoFooter,
  } = useUndoableState(footerSeed)
  const {
    state: chromeData,
    set: setChromeData,
    reset: resetChromeData,
    undo: undoChrome,
    redo: redoChrome,
    canUndo: canUndoChrome,
    canRedo: canRedoChrome,
  } = useUndoableState(chromeSeed)
  const {
    state: designData,
    set: setDesignData,
    reset: resetDesignData,
    undo: undoDesign,
    redo: redoDesign,
    canUndo: canUndoDesign,
    canRedo: canRedoDesign,
  } = useUndoableState(designSeed)

  const [initialHeroData, setInitialHeroData] = useState(heroSeed)
  const [initialGateData, setInitialGateData] = useState(gateSeed)
  const [initialHeaderData, setInitialHeaderData] = useState(headerSeed)
  const [initialFooterData, setInitialFooterData] = useState(footerSeed)
  const [initialChromeData, setInitialChromeData] = useState(chromeSeed)
  const [initialDesignData, setInitialDesignData] = useState(designSeed)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const heroDirty = JSON.stringify(heroData) !== JSON.stringify(initialHeroData)
  const gateDirty = JSON.stringify(gateData) !== JSON.stringify(initialGateData)
  const headerDirty =
    JSON.stringify(headerData) !== JSON.stringify(initialHeaderData)
  const footerDirty =
    JSON.stringify(footerData) !== JSON.stringify(initialFooterData)
  const chromeDirty =
    JSON.stringify(chromeData) !== JSON.stringify(initialChromeData)
  const designDirty =
    JSON.stringify(designData) !== JSON.stringify(initialDesignData)
  const anyDirty =
    heroDirty ||
    gateDirty ||
    headerDirty ||
    footerDirty ||
    chromeDirty ||
    designDirty

  const canUndo =
    currentView === 'gate'
      ? canUndoGate
      : currentView === 'header'
        ? canUndoHeader
        : currentView === 'footer'
          ? canUndoFooter
          : currentView === 'chrome'
            ? canUndoChrome
            : currentView === 'design'
              ? canUndoDesign
              : canUndoHero
  const canRedo =
    currentView === 'gate'
      ? canRedoGate
      : currentView === 'header'
        ? canRedoHeader
        : currentView === 'footer'
          ? canRedoFooter
          : currentView === 'chrome'
            ? canRedoChrome
            : currentView === 'design'
              ? canRedoDesign
              : canRedoHero

  const handleUndo = () => {
    if (currentView === 'gate') undoGate()
    else if (currentView === 'header') undoHeader()
    else if (currentView === 'footer') undoFooter()
    else if (currentView === 'chrome') undoChrome()
    else if (currentView === 'design') undoDesign()
    else if (currentView === 'hero') undoHero()
  }

  const handleRedo = () => {
    if (currentView === 'gate') redoGate()
    else if (currentView === 'header') redoHeader()
    else if (currentView === 'footer') redoFooter()
    else if (currentView === 'chrome') redoChrome()
    else if (currentView === 'design') redoDesign()
    else if (currentView === 'hero') redoHero()
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    applyAdminNoIndex()
  }, [])

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

      const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel !== 'aal2') {
        await client.auth.signOut()
        navigate(ADMIN_BASE_PATH, { replace: true })
        return
      }

      const [
        heroPayload,
        gatePayload,
        headerPayload,
        footerPayload,
        chromePayload,
        designPayload,
      ] = await Promise.all([
        fetchHeroPayload(),
        fetchGatePayload(),
        fetchHeaderPayload(),
        fetchFooterPayload(),
        fetchChromePayload(),
        fetchDesignPayload(),
      ])
      resetHeroData(heroPayload)
      setInitialHeroData(heroPayload)
      resetGateData(gatePayload)
      setInitialGateData(gatePayload)
      resetHeaderData(headerPayload)
      setInitialHeaderData(headerPayload)
      resetFooterData(footerPayload)
      setInitialFooterData(footerPayload)
      resetChromeData(chromePayload)
      setInitialChromeData(chromePayload)
      resetDesignData(designPayload)
      setInitialDesignData(designPayload)
      setLoading(false)
    }

    void load()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate(ADMIN_BASE_PATH, { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [
    chromeSeed,
    designSeed,
    footerSeed,
    gateSeed,
    headerSeed,
    heroSeed,
    navigate,
    resetChromeData,
    resetDesignData,
    resetFooterData,
    resetGateData,
    resetHeaderData,
    resetHeroData,
  ])

  useEffect(() => {
    if (currentView === 'menu') return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }

      const key = event.key.toLowerCase()
      const modifier = event.metaKey || event.ctrlKey
      if (!modifier) return

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
        return
      }

      if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentView])

  const handleProtectedAction = (action: () => void) => {
    if (anyDirty) {
      setPendingAction(() => action)
      setShowUnsavedConfirm(true)
      return
    }
    action()
  }

  const openView = (view: Exclude<AdminView, 'menu'>) => {
    handleProtectedAction(() => {
      setEditingModuleId(
        view === 'header'
          ? 'header'
          : view === 'design'
            ? 'typography'
            : null,
      )
      setCurrentView(view)
    })
  }

  const backToMenu = () => {
    handleProtectedAction(() => {
      setEditingModuleId(null)
      setCurrentView('menu')
    })
  }

  const confirmUnsavedAction = () => {
    resetHeroData(initialHeroData)
    resetGateData(initialGateData)
    resetHeaderData(initialHeaderData)
    resetFooterData(initialFooterData)
    resetChromeData(initialChromeData)
    resetDesignData(initialDesignData)
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
      } else if (currentView === 'header') {
        await saveHeaderPayload(headerData)
        setInitialHeaderData(headerData)
      } else if (currentView === 'footer') {
        await saveFooterPayload(footerData)
        setInitialFooterData(footerData)
      } else if (currentView === 'chrome') {
        await saveChromePayload(chromeData)
        setInitialChromeData(chromeData)
      } else if (currentView === 'design') {
        await saveDesignPayload(designData)
        setInitialDesignData(designData)
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

  const editorShared = {
    saveStatus,
    onSave: () => {
      void handleSave()
    },
    onBack: backToMenu,
    editingId: editingModuleId,
    onEditingIdChange: setEditingModuleId,
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
          <div className="admin__structure">
            <div className="admin__skel" style={{ width: '100%', height: 64 }} />
          </div>
          <div className="admin__preview" />
          <div className="admin__inspector">
            <div className="admin__skel" style={{ width: '100%', height: 64 }} />
          </div>
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
          <div className="admin__lang" role="group" aria-label="Idioma / Language">
            {(['pt', 'en', 'es'] as const).map((code) => (
              <button
                key={code}
                type="button"
                className={`admin__btn admin__btn--ghost admin__lang-btn${
                  dictionaryLocale === code ? ' is-active' : ''
                }`}
                aria-pressed={dictionaryLocale === code}
                onClick={() => setLocale(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
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

      <div
        className={`admin__workspace${
          currentView !== 'menu' ? ' admin__workspace--triple' : ''
        }`}
      >
        <aside className="admin__structure">
          {currentView === 'menu' ? (
            <SidebarMenu
              onOpenHeader={() => openView('header')}
              onOpenFooter={() => openView('footer')}
              onOpenChrome={() => openView('chrome')}
              onOpenDesign={() => openView('design')}
              onOpenGate={() => openView('gate')}
              onOpenHero={() => openView('hero')}
              headerName={headerData.sectionName}
              footerName={footerData.sectionName}
              chromeName={chromeData.sectionName}
              designName={designData.sectionName}
              gateName={gateData.sectionName}
            />
          ) : currentView === 'gate' ? (
            <GateEditor
              pane="structure"
              gateData={gateData}
              onChange={setGateData}
              isDirty={gateDirty}
              {...editorShared}
            />
          ) : currentView === 'header' ? (
            <HeaderEditor
              pane="structure"
              headerData={headerData}
              onChange={setHeaderData}
              isDirty={headerDirty}
              {...editorShared}
            />
          ) : currentView === 'footer' ? (
            <FooterEditor
              pane="structure"
              footerData={footerData}
              onChange={setFooterData}
              isDirty={footerDirty}
              locales={chromeData.locales}
              {...editorShared}
            />
          ) : currentView === 'chrome' ? (
            <ChromeEditor
              pane="structure"
              chromeData={chromeData}
              onChange={setChromeData}
              isDirty={chromeDirty}
              onOpenGate={() => openView('gate')}
              {...editorShared}
            />
          ) : currentView === 'design' ? (
            <DesignEditor
              pane="structure"
              designData={designData}
              onChange={setDesignData}
              isDirty={designDirty}
              {...editorShared}
            />
          ) : (
            <HeroEditor
              pane="structure"
              heroData={heroData}
              onChange={setHeroData}
              isDirty={heroDirty}
              {...editorShared}
            />
          )}
        </aside>

        <LivePreview
          currentView={currentView}
          previewLang={previewLang}
          onPreviewLang={setPreviewLang}
          previewDevice={previewDevice}
          onPreviewDevice={setPreviewDevice}
          heroData={heroData}
          gateData={gateData}
          headerData={headerData}
          footerData={footerData}
          chromeData={chromeData}
          designData={designData}
          previewModuleId={editingModuleId}
          onSelectEdit={setEditingModuleId}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {currentView !== 'menu' ? (
          <aside className="admin__inspector">
            {currentView === 'gate' ? (
              <GateEditor
                pane="inspector"
                gateData={gateData}
                onChange={setGateData}
                isDirty={gateDirty}
                {...editorShared}
              />
            ) : currentView === 'header' ? (
              <HeaderEditor
                pane="inspector"
                headerData={headerData}
                onChange={setHeaderData}
                isDirty={headerDirty}
                {...editorShared}
              />
            ) : currentView === 'footer' ? (
              <FooterEditor
                pane="inspector"
                footerData={footerData}
                onChange={setFooterData}
                isDirty={footerDirty}
                locales={chromeData.locales}
                {...editorShared}
              />
            ) : currentView === 'chrome' ? (
              <ChromeEditor
                pane="inspector"
                chromeData={chromeData}
                onChange={setChromeData}
                isDirty={chromeDirty}
                onOpenGate={() => openView('gate')}
                {...editorShared}
              />
            ) : currentView === 'design' ? (
              <DesignEditor
                pane="inspector"
                designData={designData}
                onChange={setDesignData}
                isDirty={designDirty}
                {...editorShared}
              />
            ) : (
              <HeroEditor
                pane="inspector"
                heroData={heroData}
                onChange={setHeroData}
                isDirty={heroDirty}
                {...editorShared}
              />
            )}
          </aside>
        ) : null}
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
