import {
  useState,
  type ReactNode,
} from 'react'
import { LOCALES, type Locale } from '../i18n/copy'
import {
  BUTTON_TARGETS,
  buttonSelectValue,
  createBlankIntroModule,
  createLineButton,
  createLineModule,
  createScrollModule,
  EXTERNAL_LINK_VALUE,
  isExternalHref,
  type Align,
  type CmsHeroPayload,
  type DesktopTextSide,
  type HeroModule,
  type IntroModule,
  type LineModule,
  type MobileAvatarPlace,
  type ScrollModule,
} from '../cms/hero-content'
import { ACCENT_SWATCHES } from '../cms/accent-swatches'
import { adminCopy } from './admin-copy'
import ConfirmDialog from './confirm-dialog'
import GalleryField from './gallery-field'
import { ChevronRightIcon } from './icons'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

type HeroEditorProps = {
  heroData: CmsHeroPayload
  onChange: (next: CmsHeroPayload) => void
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  onBack: () => void
  editingId: string | null
  onEditingIdChange: (id: string | null) => void
}

const ALIGNS: Align[] = ['start', 'center', 'end']

function alignLabel(align: Align, copy: typeof adminCopy.dashboard) {
  if (align === 'start') return copy.alignStart
  if (align === 'center') return copy.alignCenter
  return copy.alignEnd
}

function moduleTitle(module: HeroModule, copy: typeof adminCopy.dashboard) {
  if (module.kind === 'intro') return copy.introModuleTitle
  if (module.kind === 'scroll') return copy.scrollModuleTitle
  return copy.lineModuleTitle
}

function moduleDesc(module: HeroModule, copy: typeof adminCopy.dashboard) {
  if (module.kind === 'intro') return copy.introModuleDesc
  if (module.kind === 'scroll') return copy.scrollModuleDesc
  return copy.lineModuleDesc
}

export default function HeroEditor({
  heroData,
  onChange,
  saveStatus,
  isDirty,
  onSave,
  onBack,
  editingId,
  onEditingIdChange,
}: HeroEditorProps) {
  const [tab, setTab] = useState<Locale>('pt')
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const copy = adminCopy.dashboard
  const editing = heroData.modules.find((module) => module.id === editingId)

  const saveLabel =
    saveStatus === 'success'
      ? copy.published
      : saveStatus === 'saving'
        ? copy.publishing
        : copy.publishHero

  const replaceModule = (next: HeroModule) => {
    onChange({
      ...heroData,
      modules: heroData.modules.map((module) =>
        module.id === next.id ? next : module,
      ),
    })
  }

  const addModule = (module: HeroModule) => {
    onChange({
      ...heroData,
      modules: [...heroData.modules, module],
    })
    onEditingIdChange(module.id)
  }

  const removeModule = (id: string) => {
    onChange({
      ...heroData,
      modules: heroData.modules.filter((module) => module.id !== id),
    })
    onEditingIdChange(null)
  }

  const confirmRemove = () => {
    if (!pendingRemoveId) return
    removeModule(pendingRemoveId)
    setPendingRemoveId(null)
  }

  const deleteDialog = pendingRemoveId ? (
    <ConfirmDialog
      title={copy.deleteModuleTitle}
      description={copy.deleteModuleDesc}
      confirmLabel={copy.confirmDelete}
      onCancel={() => setPendingRemoveId(null)}
      onConfirm={confirmRemove}
    />
  ) : null

  const moveModule = (id: string, direction: -1 | 1) => {
    const index = heroData.modules.findIndex((module) => module.id === id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= heroData.modules.length) return
    const modules = [...heroData.modules]
    const [item] = modules.splice(index, 1)
    modules.splice(nextIndex, 0, item)
    onChange({ ...heroData, modules })
  }

  const setModuleEnabled = (id: string, enabled: boolean) => {
    onChange({
      ...heroData,
      modules: heroData.modules.map((module) =>
        module.id === id ? { ...module, enabled } : module,
      ),
    })
  }

  if (!editing) {
    return (
      <div>
        <div className="admin__editor-head">
          <button className="admin__btn admin__btn--ghost" type="button" onClick={onBack}>
            {copy.back}
          </button>
          <div>
            <h2>{copy.heroModulesTitle}</h2>
            <p className="admin__lead">{copy.heroModulesLead}</p>
          </div>
        </div>

        <div className="admin__modules">
          {heroData.modules.map((module, index) => (
            <div
              key={module.id}
              className={`admin__module-wrap${module.enabled ? '' : ' admin__module-wrap--off'}`}
            >
              <button
                className="admin__module"
                type="button"
                onClick={() => onEditingIdChange(module.id)}
              >
                <span>
                  <h3>{moduleTitle(module, copy)}</h3>
                  <p>
                    {module.enabled ? copy.moduleVisible : copy.moduleHidden}
                    {' · '}
                    {moduleDesc(module, copy)}
                  </p>
                </span>
                <ChevronRightIcon />
              </button>
              <div className="admin__block-actions">
                <label className="admin__check admin__check--action">
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={(event) =>
                      setModuleEnabled(module.id, event.target.checked)
                    }
                  />
                  {copy.moduleVisible}
                </label>
                <button
                  type="button"
                  className="admin__icon-btn"
                  disabled={index === 0}
                  onClick={() => moveModule(module.id, -1)}
                >
                  {copy.moveUp}
                </button>
                <button
                  type="button"
                  className="admin__icon-btn"
                  disabled={index === heroData.modules.length - 1}
                  onClick={() => moveModule(module.id, 1)}
                >
                  {copy.moveDown}
                </button>
                <button
                  type="button"
                  className="admin__icon-btn admin__icon-btn--danger"
                  onClick={() => setPendingRemoveId(module.id)}
                >
                  {copy.deleteModule}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="admin__add-row">
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={() => addModule(createBlankIntroModule())}
          >
            + {copy.addIntro}
          </button>
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={() => addModule(createLineModule())}
          >
            + {copy.addLine}
          </button>
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={() => addModule(createScrollModule())}
          >
            + {copy.addScroll}
          </button>
        </div>

        <button
          className={`admin__btn admin__btn--solid admin__save${
            saveStatus === 'success'
              ? ' admin__save--ok'
              : saveStatus === 'error'
                ? ' admin__save--err'
                : ''
          }`}
          type="button"
          onClick={onSave}
          disabled={!isDirty || saveStatus === 'saving' || saveStatus === 'success'}
        >
          {saveLabel}
        </button>
        {deleteDialog}
      </div>
    )
  }

  return (
    <div>
      <div className="admin__editor-head">
        <button
          className="admin__btn admin__btn--ghost"
          type="button"
          onClick={() => onEditingIdChange(null)}
        >
          {copy.back}
        </button>
        <h2>{moduleTitle(editing, copy)}</h2>
      </div>

      <div className="admin__tabs">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            className={`admin__tab${tab === code ? ' admin__tab--on' : ''}`}
            onClick={() => setTab(code)}
          >
            {code === 'pt' ? copy.tabPt : code === 'en' ? copy.tabEn : copy.tabEs}
          </button>
        ))}
      </div>

      {editing.kind === 'intro' ? (
        <IntroFields
          module={editing}
          tab={tab}
          onChange={replaceModule}
        />
      ) : editing.kind === 'scroll' ? (
        <ScrollFields
          module={editing}
          tab={tab}
          onChange={replaceModule}
        />
      ) : (
        <LineFields
          module={editing}
          tab={tab}
          onChange={replaceModule}
        />
      )}

      <button
        className="admin__btn admin__btn--danger admin__save"
        type="button"
        onClick={() => setPendingRemoveId(editing.id)}
      >
        {copy.removeBlock}
      </button>

      <button
        className={`admin__btn admin__btn--solid admin__save${
          saveStatus === 'success'
            ? ' admin__save--ok'
            : saveStatus === 'error'
              ? ' admin__save--err'
              : ''
        }`}
        type="button"
        onClick={onSave}
        disabled={!isDirty || saveStatus === 'saving' || saveStatus === 'success'}
      >
        {saveLabel}
      </button>
      {deleteDialog}
    </div>
  )
}

function FieldWithShow({
  label,
  show,
  onShow,
  children,
}: {
  label: string
  show: boolean
  onShow: (next: boolean) => void
  children: ReactNode
}) {
  const copy = adminCopy.dashboard
  return (
    <div className="admin__field">
      <div className="admin__field-head">
        <span className="admin__label">{label}</span>
        <label className="admin__check">
          <input
            type="checkbox"
            checked={show}
            onChange={(event) => onShow(event.target.checked)}
          />
          {copy.showField}
        </label>
      </div>
      {children}
    </div>
  )
}

function ScrollFields({
  module,
  tab,
  onChange,
}: {
  module: ScrollModule
  tab: Locale
  onChange: (next: ScrollModule) => void
}) {
  const copy = adminCopy.dashboard
  return (
    <div className="admin__form">
      <label className="admin__label">
        {copy.scrollLabel}
        <input
          className="admin__input"
          value={module.label[tab]}
          onChange={(event) =>
            onChange({
              ...module,
              label: { ...module.label, [tab]: event.target.value },
            })
          }
        />
      </label>
      <div className="admin__align-row">
        <span>{copy.alignDesktop}</span>
        <div className="admin__align">
          {ALIGNS.map((align) => (
            <button
              key={`d-${align}`}
              type="button"
              className={`admin__align-btn${module.alignDesktop === align ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, alignDesktop: align })}
            >
              {alignLabel(align, copy)}
            </button>
          ))}
        </div>
      </div>
      <div className="admin__align-row">
        <span>{copy.alignMobile}</span>
        <div className="admin__align">
          {ALIGNS.map((align) => (
            <button
              key={`m-${align}`}
              type="button"
              className={`admin__align-btn${module.alignMobile === align ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, alignMobile: align })}
            >
              {alignLabel(align, copy)}
            </button>
          ))}
        </div>
      </div>
      <div className="admin__align-row">
        <span>{copy.accent}</span>
        <div className="admin__swatches" role="listbox" aria-label={copy.accent}>
          <button
            type="button"
            role="option"
            title={copy.scrollAccentInk}
            aria-label={copy.scrollAccentInk}
            aria-selected={module.accent === 'ink'}
            className={`admin__swatch admin__swatch--ink${
              module.accent === 'ink' ? ' admin__swatch--on' : ''
            }`}
            onClick={() => onChange({ ...module, accent: 'ink' })}
          />
          {ACCENT_SWATCHES.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              role="option"
              title={swatch.label}
              aria-label={swatch.label}
              aria-selected={module.accent === swatch.id}
              className={`admin__swatch${module.accent === swatch.id ? ' admin__swatch--on' : ''}`}
              data-accent={swatch.id}
              onClick={() => onChange({ ...module, accent: swatch.id })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function IntroFields({
  module,
  tab,
  onChange,
}: {
  module: IntroModule
  tab: Locale
  onChange: (next: IntroModule) => void
}) {
  const copy = adminCopy.dashboard
  const current = module.copy[tab]

  const patchCopy = (partial: Partial<typeof current>) => {
    onChange({
      ...module,
      copy: {
        ...module.copy,
        [tab]: { ...current, ...partial },
      },
    })
  }

  return (
    <div className="admin__fields">
      <div className="admin__align-row">
        <span>{copy.layoutDesktop}</span>
        <div className="admin__align">
          {(['start', 'end'] as DesktopTextSide[]).map((side) => (
            <button
              key={side}
              type="button"
              className={`admin__align-btn${module.desktopTextSide === side ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, desktopTextSide: side })}
            >
              {side === 'start' ? copy.textLeft : copy.textRight}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__align-row">
        <span>{copy.layoutMobile}</span>
        <div className="admin__align">
          {(['before', 'after'] as MobileAvatarPlace[]).map((place) => (
            <button
              key={place}
              type="button"
              className={`admin__align-btn${module.mobileAvatar === place ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, mobileAvatar: place })}
            >
              {place === 'before' ? copy.avatarTop : copy.avatarBottom}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__align-row">
        <span>{copy.textAlign} ({copy.alignMobile})</span>
        <div className="admin__align">
          {ALIGNS.map((align) => (
            <button
              key={align}
              type="button"
              className={`admin__align-btn${module.mobileAlign === align ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, mobileAlign: align })}
            >
              {alignLabel(align, copy)}
            </button>
          ))}
        </div>
      </div>

      <FieldWithShow
        label={copy.titleLine1}
        show={module.visible.titleLine1}
        onShow={(titleLine1) =>
          onChange({ ...module, visible: { ...module.visible, titleLine1 } })
        }
      >
        <input
          className="admin__input"
          value={current.titleLine1}
          onChange={(event) => patchCopy({ titleLine1: event.target.value })}
        />
      </FieldWithShow>
      <FieldWithShow
        label={copy.titleLine2}
        show={module.visible.titleLine2}
        onShow={(titleLine2) =>
          onChange({ ...module, visible: { ...module.visible, titleLine2 } })
        }
      >
        <input
          className="admin__input"
          value={current.titleLine2}
          onChange={(event) => patchCopy({ titleLine2: event.target.value })}
        />
      </FieldWithShow>
      <FieldWithShow
        label={copy.subtitleLine1}
        show={module.visible.subtitleLine1}
        onShow={(subtitleLine1) =>
          onChange({ ...module, visible: { ...module.visible, subtitleLine1 } })
        }
      >
        <input
          className="admin__input"
          value={current.subtitleLine1}
          onChange={(event) => patchCopy({ subtitleLine1: event.target.value })}
        />
      </FieldWithShow>
      <FieldWithShow
        label={copy.subtitleLine2}
        show={module.visible.subtitleLine2}
        onShow={(subtitleLine2) =>
          onChange({ ...module, visible: { ...module.visible, subtitleLine2 } })
        }
      >
        <input
          className="admin__input"
          value={current.subtitleLine2}
          onChange={(event) => patchCopy({ subtitleLine2: event.target.value })}
        />
      </FieldWithShow>
      <label className="admin__check">
        <input
          type="checkbox"
          checked={module.showAvatar}
          onChange={(event) =>
            onChange({ ...module, showAvatar: event.target.checked })
          }
        />
        {copy.showAvatar}
      </label>
      <GalleryField
        urls={module.gallery}
        onChange={(gallery) => onChange({ ...module, gallery })}
      />
    </div>
  )
}

function LineFields({
  module,
  tab,
  onChange,
}: {
  module: LineModule
  tab: Locale
  onChange: (next: LineModule) => void
}) {
  const copy = adminCopy.dashboard
  const accentWords = module.accents[tab] ?? []
  const buttons = module.buttons ?? []
  const [pendingAccent, setPendingAccent] = useState<number | null>(null)
  const [pendingButtonId, setPendingButtonId] = useState<string | null>(null)

  return (
    <div className="admin__fields">
      <div className="admin__align-row">
        <span>{copy.alignDesktop}</span>
        <div className="admin__align">
          {ALIGNS.map((align) => (
            <button
              key={`d-${align}`}
              type="button"
              className={`admin__align-btn${module.alignDesktop === align ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, alignDesktop: align })}
            >
              {alignLabel(align, copy)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__align-row">
        <span>{copy.alignMobile}</span>
        <div className="admin__align">
          {ALIGNS.map((align) => (
            <button
              key={`m-${align}`}
              type="button"
              className={`admin__align-btn${module.alignMobile === align ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, alignMobile: align })}
            >
              {alignLabel(align, copy)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__align-row">
        <span>{copy.imageDesktop}</span>
        <div className="admin__align">
          {(['start', 'end'] as DesktopTextSide[]).map((side) => (
            <button
              key={`img-d-${side}`}
              type="button"
              className={`admin__align-btn${(module.imageDesktop ?? 'end') === side ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, imageDesktop: side })}
            >
              {side === 'start' ? copy.imageLeft : copy.imageRight}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__align-row">
        <span>{copy.imageMobile}</span>
        <div className="admin__align">
          {(['before', 'after'] as MobileAvatarPlace[]).map((place) => (
            <button
              key={`img-m-${place}`}
              type="button"
              className={`admin__align-btn${(module.imageMobile ?? 'after') === place ? ' admin__align-btn--on' : ''}`}
              onClick={() => onChange({ ...module, imageMobile: place })}
            >
              {place === 'before' ? copy.imageTop : copy.imageBottom}
            </button>
          ))}
        </div>
      </div>

      <div className="admin__align-row">
        <span>{copy.accent}</span>
        <div className="admin__swatches" role="listbox" aria-label={copy.accent}>
          {ACCENT_SWATCHES.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              role="option"
              title={swatch.label}
              aria-label={swatch.label}
              aria-selected={module.accent === swatch.id}
              className={`admin__swatch${module.accent === swatch.id ? ' admin__swatch--on' : ''}`}
              data-accent={swatch.id}
              onClick={() => onChange({ ...module, accent: swatch.id })}
            />
          ))}
        </div>
      </div>

      <FieldWithShow
        label={copy.titleLine1}
        show={module.visible.titleLine1}
        onShow={(titleLine1) =>
          onChange({ ...module, visible: { ...module.visible, titleLine1 } })
        }
      >
        <input
          className="admin__input"
          value={module.title[tab][0]}
          onChange={(event) =>
            onChange({
              ...module,
              title: {
                ...module.title,
                [tab]: [event.target.value, module.title[tab][1]],
              },
            })
          }
        />
      </FieldWithShow>
      <FieldWithShow
        label={copy.titleLine2}
        show={module.visible.titleLine2}
        onShow={(titleLine2) =>
          onChange({ ...module, visible: { ...module.visible, titleLine2 } })
        }
      >
        <input
          className="admin__input"
          value={module.title[tab][1]}
          onChange={(event) =>
            onChange({
              ...module,
              title: {
                ...module.title,
                [tab]: [module.title[tab][0], event.target.value],
              },
            })
          }
        />
      </FieldWithShow>
      <FieldWithShow
        label={copy.blockDescription}
        show={module.visible.body}
        onShow={(body) =>
          onChange({ ...module, visible: { ...module.visible, body } })
        }
      >
        <textarea
          className="admin__textarea"
          value={module.body[tab]}
          onChange={(event) =>
            onChange({
              ...module,
              body: { ...module.body, [tab]: event.target.value },
            })
          }
        />
      </FieldWithShow>
      <div className="admin__repeat">
        <div className="admin__repeat-head">
          <span className="admin__label">{copy.accents}</span>
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={() =>
              onChange({
                ...module,
                accents: {
                  ...module.accents,
                  [tab]: [...accentWords, ''],
                },
              })
            }
          >
            + {copy.addAccentWord}
          </button>
        </div>
        {accentWords.length === 0 ? (
          <p className="admin__gallery-empty">{copy.accentsEmpty}</p>
        ) : (
          accentWords.map((word, index) => (
            <div key={`accent-${index}`} className="admin__url-row">
              <input
                className="admin__input"
                value={word}
                placeholder={copy.accentWord}
                onChange={(event) => {
                  const next = [...accentWords]
                  next[index] = event.target.value
                  onChange({
                    ...module,
                    accents: { ...module.accents, [tab]: next },
                  })
                }}
              />
              <button
                className="admin__icon-btn admin__icon-btn--danger"
                type="button"
                onClick={() => setPendingAccent(index)}
              >
                {copy.removeBlock}
              </button>
            </div>
          ))
        )}
      </div>
      <div className="admin__repeat">
        <div className="admin__repeat-head">
          <span className="admin__label">{copy.buttonsTitle}</span>
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={() =>
              onChange({
                ...module,
                buttons: [...buttons, createLineButton()],
                visible: { ...module.visible, cta: true },
              })
            }
          >
            + {copy.addCta}
          </button>
        </div>
        {buttons.length === 0 ? (
          <p className="admin__gallery-empty">{copy.buttonsEmpty}</p>
        ) : (
          buttons.map((button) => (
            <div key={button.id} className="admin__repeat-card">
              <label className="admin__label">
                {copy.blockButton}
                <input
                  className="admin__input"
                  value={button.label[tab]}
                  onChange={(event) =>
                    onChange({
                      ...module,
                      buttons: buttons.map((item) =>
                        item.id === button.id
                          ? {
                              ...item,
                              label: {
                                ...item.label,
                                [tab]: event.target.value,
                              },
                            }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label className="admin__label">
                {copy.buttonLink}
                <select
                  className="admin__input admin__select"
                  value={buttonSelectValue(button.to)}
                  onChange={(event) => {
                    const nextTo =
                      event.target.value === EXTERNAL_LINK_VALUE
                        ? isExternalHref(button.to)
                          ? button.to
                          : 'https://'
                        : event.target.value
                    onChange({
                      ...module,
                      buttons: buttons.map((item) =>
                        item.id === button.id ? { ...item, to: nextTo } : item,
                      ),
                    })
                  }}
                >
                  {BUTTON_TARGETS.map((target) => (
                    <option key={target.to} value={target.to}>
                      {target.label}
                    </option>
                  ))}
                  <option value={EXTERNAL_LINK_VALUE}>{copy.linkExternal}</option>
                </select>
              </label>
              {buttonSelectValue(button.to) === EXTERNAL_LINK_VALUE ? (
                <label className="admin__label">
                  {copy.externalUrl}
                  <input
                    className="admin__input"
                    type="url"
                    value={button.to}
                    placeholder={copy.externalPlaceholder}
                    onChange={(event) =>
                      onChange({
                        ...module,
                        buttons: buttons.map((item) =>
                          item.id === button.id
                            ? { ...item, to: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
              ) : null}
              <button
                className="admin__btn admin__btn--danger"
                type="button"
                onClick={() => setPendingButtonId(button.id)}
              >
                {copy.removeBlock}
              </button>
            </div>
          ))
        )}
      </div>
      {pendingAccent !== null ? (
        <ConfirmDialog
          title={copy.removeAccentTitle}
          description={copy.removeAccentDesc}
          confirmLabel={copy.confirmRemove}
          onCancel={() => setPendingAccent(null)}
          onConfirm={() => {
            onChange({
              ...module,
              accents: {
                ...module.accents,
                [tab]: accentWords.filter(
                  (_, itemIndex) => itemIndex !== pendingAccent,
                ),
              },
            })
            setPendingAccent(null)
          }}
        />
      ) : null}
      {pendingButtonId ? (
        <ConfirmDialog
          title={copy.removeButtonTitle}
          description={copy.removeButtonDesc}
          confirmLabel={copy.confirmRemove}
          onCancel={() => setPendingButtonId(null)}
          onConfirm={() => {
            onChange({
              ...module,
              buttons: buttons.filter((item) => item.id !== pendingButtonId),
            })
            setPendingButtonId(null)
          }}
        />
      ) : null}
      <label className="admin__check">
        <input
          type="checkbox"
          checked={module.visible.image}
          onChange={(event) =>
            onChange({
              ...module,
              visible: { ...module.visible, image: event.target.checked },
            })
          }
        />
        {copy.optionalImage}
      </label>
      {module.visible.image ? (
        <GalleryField
          urls={module.gallery}
          onChange={(gallery) => onChange({ ...module, gallery })}
        />
      ) : (
        <p className="admin__gallery-empty">{copy.imageOffHint}</p>
      )}
    </div>
  )
}
