import { useState } from 'react'
import { ACCENT_SWATCHES } from '../cms/accent-swatches'
import {
  BUTTON_TARGETS,
  buttonSelectValue,
  EXTERNAL_LINK_VALUE,
  isExternalHref,
} from '../cms/hero-content'
import {
  createGateButton,
  createGateSlide,
  type CmsGatePayload,
  type GateSlide,
} from '../cms/gate-content'
import { LOCALES, type Locale } from '../i18n/copy'
import { adminCopy } from './admin-copy'
import ConfirmDialog from './confirm-dialog'
import GalleryField from './gallery-field'
import { ChevronRightIcon } from './icons'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

type GateEditorProps = {
  gateData: CmsGatePayload
  onChange: (next: CmsGatePayload) => void
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  onBack: () => void
  editingId: string | null
  onEditingIdChange: (id: string | null) => void
}

export default function GateEditor({
  gateData,
  onChange,
  saveStatus,
  isDirty,
  onSave,
  onBack,
  editingId,
  onEditingIdChange,
}: GateEditorProps) {
  const [tab, setTab] = useState<Locale>('pt')
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [pendingButtonId, setPendingButtonId] = useState<string | null>(null)
  const copy = adminCopy.dashboard
  const editing = gateData.slides.find((slide) => slide.id === editingId)

  const saveLabel =
    saveStatus === 'success'
      ? copy.published
      : saveStatus === 'saving'
        ? copy.publishing
        : copy.publishGate

  const replaceSlide = (next: GateSlide) => {
    onChange({
      ...gateData,
      slides: gateData.slides.map((slide) => (slide.id === next.id ? next : slide)),
    })
  }

  const addSlide = () => {
    const slide = createGateSlide()
    onChange({ ...gateData, slides: [...gateData.slides, slide] })
    onEditingIdChange(slide.id)
  }

  const removeSlide = (id: string) => {
    onChange({
      ...gateData,
      slides: gateData.slides.filter((slide) => slide.id !== id),
    })
    onEditingIdChange(null)
  }

  const moveSlide = (id: string, direction: -1 | 1) => {
    const index = gateData.slides.findIndex((slide) => slide.id === id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= gateData.slides.length) return
    const slides = [...gateData.slides]
    const [item] = slides.splice(index, 1)
    slides.splice(nextIndex, 0, item)
    onChange({ ...gateData, slides })
  }

  const setSlideEnabled = (id: string, enabled: boolean) => {
    onChange({
      ...gateData,
      slides: gateData.slides.map((slide) =>
        slide.id === id ? { ...slide, enabled } : slide,
      ),
    })
  }

  const deleteDialog = pendingRemoveId ? (
    <ConfirmDialog
      title={copy.deleteSlideTitle}
      description={copy.deleteSlideDesc}
      confirmLabel={copy.confirmDelete}
      onCancel={() => setPendingRemoveId(null)}
      onConfirm={() => {
        removeSlide(pendingRemoveId)
        setPendingRemoveId(null)
      }}
    />
  ) : null

  if (!editing) {
    return (
      <div>
        <div className="admin__editor-head">
          <button className="admin__btn admin__btn--ghost" type="button" onClick={onBack}>
            {copy.back}
          </button>
          <div>
            <h2>{copy.gateModulesTitle}</h2>
            <p className="admin__lead">{copy.gateModulesLead}</p>
          </div>
        </div>
        <div className="admin__modules">
          {gateData.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`admin__module-wrap${slide.enabled ? '' : ' admin__module-wrap--off'}`}
            >
              <button
                className="admin__module"
                type="button"
                onClick={() => onEditingIdChange(slide.id)}
              >
                <span>
                  <h3>
                    {copy.slideModuleTitle} {index + 1}
                  </h3>
                  <p>
                    {slide.enabled ? copy.moduleVisible : copy.moduleHidden}
                    {' · '}
                    {copy.slideModuleDesc}
                  </p>
                </span>
                <ChevronRightIcon />
              </button>
              <div className="admin__block-actions">
                <label className="admin__check admin__check--action">
                  <input
                    type="checkbox"
                    checked={slide.enabled}
                    onChange={(event) =>
                      setSlideEnabled(slide.id, event.target.checked)
                    }
                  />
                  {copy.moduleVisible}
                </label>
                <button
                  type="button"
                  className="admin__icon-btn"
                  disabled={index === 0}
                  onClick={() => moveSlide(slide.id, -1)}
                >
                  {copy.moveUp}
                </button>
                <button
                  type="button"
                  className="admin__icon-btn"
                  disabled={index === gateData.slides.length - 1}
                  onClick={() => moveSlide(slide.id, 1)}
                >
                  {copy.moveDown}
                </button>
                <button
                  type="button"
                  className="admin__icon-btn admin__icon-btn--danger"
                  onClick={() => setPendingRemoveId(slide.id)}
                >
                  {copy.deleteModule}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="admin__add-row">
          <button className="admin__btn admin__btn--ghost" type="button" onClick={addSlide}>
            + {copy.addSlide}
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

  const buttons = editing.buttons
  const editingIndex = gateData.slides.findIndex((slide) => slide.id === editing.id)
  const hasMedia = editing.mediaUrl.trim().length > 0

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
        <h2>
          {copy.slideModuleTitle} {editingIndex + 1}
        </h2>
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

      <div className="admin__form">
        <label className="admin__label">
          {copy.gateKicker}
          <input
            className="admin__input"
            value={editing.kicker[tab]}
            onChange={(event) =>
              replaceSlide({
                ...editing,
                kicker: { ...editing.kicker, [tab]: event.target.value },
              })
            }
          />
        </label>
        <label className="admin__label">
          {copy.gateHeadline}
          <input
            className="admin__input"
            value={editing.title[tab]}
            onChange={(event) =>
              replaceSlide({
                ...editing,
                title: { ...editing.title, [tab]: event.target.value },
              })
            }
          />
        </label>
        <label className="admin__label">
          {copy.gateBody}
          <textarea
            className="admin__textarea"
            rows={4}
            value={editing.body[tab]}
            onChange={(event) =>
              replaceSlide({
                ...editing,
                body: { ...editing.body, [tab]: event.target.value },
              })
            }
          />
        </label>

        <div className="admin__align-row">
          <span>{copy.gateMedia}</span>
          <div className="admin__align">
            <button
              type="button"
              className={`admin__align-btn${editing.mediaKind === 'image' ? ' admin__align-btn--on' : ''}`}
              disabled={hasMedia && editing.mediaKind === 'video'}
              title={
                hasMedia && editing.mediaKind === 'video'
                  ? copy.gateMediaLocked
                  : undefined
              }
              onClick={() => replaceSlide({ ...editing, mediaKind: 'image' })}
            >
              {copy.gateMediaImage}
            </button>
            <button
              type="button"
              className={`admin__align-btn${editing.mediaKind === 'video' ? ' admin__align-btn--on' : ''}`}
              disabled={hasMedia && editing.mediaKind === 'image'}
              title={
                hasMedia && editing.mediaKind === 'image'
                  ? copy.gateMediaLocked
                  : undefined
              }
              onClick={() => replaceSlide({ ...editing, mediaKind: 'video' })}
            >
              {copy.gateMediaVideo}
            </button>
          </div>
        </div>

        <GalleryField
          urls={editing.mediaUrl ? [editing.mediaUrl] : []}
          onChange={(urls) => replaceSlide({ ...editing, mediaUrl: urls[0] ?? '' })}
          folder="gate"
          kind={editing.mediaKind}
          accept={
            editing.mediaKind === 'video'
              ? 'video/mp4,video/webm'
              : 'image/png,image/jpeg,image/webp,image/gif,image/avif'
          }
        />

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
                aria-selected={editing.accent === swatch.id}
                className={`admin__swatch${editing.accent === swatch.id ? ' admin__swatch--on' : ''}`}
                data-accent={swatch.id}
                onClick={() => replaceSlide({ ...editing, accent: swatch.id })}
              />
            ))}
          </div>
        </div>

        <div className="admin__repeat">
          <div className="admin__repeat-head">
            <span className="admin__label">{copy.buttonsTitle}</span>
            <button
              className="admin__btn admin__btn--ghost"
              type="button"
              onClick={() =>
                replaceSlide({
                  ...editing,
                  buttons: [...buttons, createGateButton()],
                })
              }
            >
              + {copy.addCta}
            </button>
          </div>
          {buttons.map((button) => (
            <div key={button.id} className="admin__repeat-card">
              <label className="admin__label">
                {copy.blockButton}
                <input
                  className="admin__input"
                  value={button.label[tab]}
                  onChange={(event) =>
                    replaceSlide({
                      ...editing,
                      buttons: buttons.map((item) =>
                        item.id === button.id
                          ? {
                              ...item,
                              label: { ...item.label, [tab]: event.target.value },
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
                    replaceSlide({
                      ...editing,
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
                <input
                  className="admin__input"
                  value={button.to}
                  onChange={(event) =>
                    replaceSlide({
                      ...editing,
                      buttons: buttons.map((item) =>
                        item.id === button.id ? { ...item, to: event.target.value } : item,
                      ),
                    })
                  }
                />
              ) : null}
              <button
                type="button"
                className="admin__icon-btn admin__icon-btn--danger"
                onClick={() => setPendingButtonId(button.id)}
              >
                {copy.removeBlock}
              </button>
            </div>
          ))}
        </div>
      </div>

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
      {pendingButtonId ? (
        <ConfirmDialog
          title={copy.removeButtonTitle}
          description={copy.removeButtonDesc}
          confirmLabel={copy.confirmRemove}
          onCancel={() => setPendingButtonId(null)}
          onConfirm={() => {
            replaceSlide({
              ...editing,
              buttons: buttons.filter((item) => item.id !== pendingButtonId),
            })
            setPendingButtonId(null)
          }}
        />
      ) : null}
      {deleteDialog}
    </div>
  )
}
