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
  GATE_SLOT_IDS,
  type CmsGatePayload,
  type GateSlide,
  type GateSlotId,
} from '../cms/gate-content'
import type { Locale } from '../i18n/copy'
import { adminCopy } from './admin-copy'
import AdminSelect from './admin-select'
import ButtonStyleControls from './button-style-controls'
import ConfirmDialog from './confirm-dialog'
import EditableTitle from './editable-title'
import FieldWithShow from './field-with-show'
import {
  ChevronLeftIcon,
  TreeButtonIcon,
  TreeHeaderIcon,
  TreePhotoIcon,
  TreeTextIcon,
} from './icons'
import InspectorShell from './inspector-shell'
import MediaPickerField from './media-picker'
import StructureTree, { type StructureTreeNode } from './structure-tree'
import { orderListByIds } from './structure-block'
import { treeChildId, treeParts, treeRootId } from './tree-path'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type EditorPane = 'structure' | 'inspector'

const GATE_ROOT_ID = 'gate'

type GateEditorProps = {
  pane: EditorPane
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
  pane,
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

  const rootSlideId = treeRootId(editingId)
  const editing =
    rootSlideId && rootSlideId !== GATE_ROOT_ID
      ? gateData.slides.find((slide) => slide.id === rootSlideId)
      : undefined
  const parts = treeParts(editingId)

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

  const buttonDeleteDialog = pendingButtonId ? (
    <ConfirmDialog
      title={copy.removeButtonTitle}
      description={copy.removeButtonDesc}
      confirmLabel={copy.confirmRemove}
      onCancel={() => setPendingButtonId(null)}
      onConfirm={() => {
        const slide = gateData.slides.find((item) =>
          item.buttons.some((button) => button.id === pendingButtonId),
        )
        if (slide) {
          replaceSlide({
            ...slide,
            buttons: slide.buttons.filter((item) => item.id !== pendingButtonId),
          })
        }
        if (
          editingId &&
          treeParts(editingId)[0] === 'btn' &&
          treeParts(editingId)[1] === pendingButtonId
        ) {
          onEditingIdChange(null)
        }
        setPendingButtonId(null)
      }}
    />
  ) : null

  const slotNode = (
    slide: GateSlide,
    slot: GateSlotId,
  ): StructureTreeNode => {
    if (slot === 'kicker') {
      return {
        id: treeChildId(slide.id, 'kicker'),
        title: copy.gateKicker,
        icon: <TreeTextIcon />,
        enabled: slide.visible.kicker,
        showToggle: true,
        deletable: true,
      }
    }
    if (slot === 'title') {
      return {
        id: treeChildId(slide.id, 'title'),
        title: copy.gateHeadline,
        icon: <TreeTextIcon />,
        enabled: slide.visible.title,
        showToggle: true,
        deletable: true,
      }
    }
    if (slot === 'body') {
      return {
        id: treeChildId(slide.id, 'body'),
        title: copy.gateBody,
        icon: <TreeTextIcon />,
        enabled: slide.visible.body,
        showToggle: true,
        deletable: true,
      }
    }
    if (slot === 'media') {
      return {
        id: treeChildId(slide.id, 'media'),
        title: copy.gateMedia,
        description: copy.gateMediaDesc,
        icon: <TreePhotoIcon />,
        enabled: slide.visible.media,
        showToggle: true,
        deletable: true,
      }
    }
    return {
      id: treeChildId(slide.id, 'buttons'),
      title: copy.gateButtonsTitle,
      description: copy.gateButtonsDesc,
      icon: <TreeButtonIcon />,
      enabled: slide.visible.buttons,
      showToggle: true,
      deletable: true,
      addLabel: copy.addBlock,
      addOptions: [
        {
          id: 'button',
          label: copy.addCta,
          description: copy.addCtaDesc,
          icon: <TreeButtonIcon />,
        },
      ],
      children: slide.buttons.map((button, buttonIndex) => ({
        id: treeChildId(slide.id, 'btn', button.id),
        title:
          button.label.pt.trim() || `${copy.blockButton} ${buttonIndex + 1}`,
        icon: <TreeButtonIcon />,
        deletable: true,
      })),
    }
  }

  const slideAddOptions = (slide: GateSlide) => {
    const missing = GATE_SLOT_IDS.filter((slot) => !slide.slots.includes(slot))
    const labels: Record<
      GateSlotId,
      { label: string; icon: React.ReactNode }
    > = {
      kicker: { label: copy.addGateKicker, icon: <TreeTextIcon /> },
      title: { label: copy.addGateHeadline, icon: <TreeTextIcon /> },
      body: { label: copy.addGateBody, icon: <TreeTextIcon /> },
      media: { label: copy.addGateMedia, icon: <TreePhotoIcon /> },
      buttons: { label: copy.addGateButtons, icon: <TreeButtonIcon /> },
    }
    return missing.map((slot) => ({
      id: slot,
      label: labels[slot].label,
      icon: labels[slot].icon,
    }))
  }

  const buildSlideNode = (slide: GateSlide, index: number): StructureTreeNode => {
    const title = slide.name.trim() || `${copy.slideModuleTitle} ${index + 1}`
    return {
      id: slide.id,
      title,
      description: copy.slideModuleDesc,
      icon: <TreeHeaderIcon />,
      enabled: slide.enabled,
      showToggle: true,
      deletable: true,
      addLabel: copy.addBlock,
      addOptions: slideAddOptions(slide),
      children: slide.slots.map((slot) => slotNode(slide, slot)),
    }
  }

  if (pane === 'structure') {
    const tree: StructureTreeNode[] = [
      {
        id: GATE_ROOT_ID,
        title: gateData.sectionName.trim() || copy.gateRootTitle,
        description: copy.gateRootDesc,
        icon: <TreeHeaderIcon />,
        draggable: false,
        addLabel: copy.addBlock,
        addOptions: [
          {
            id: 'slide',
            label: copy.addSlide,
            description: copy.addSlideDesc,
            icon: <TreeHeaderIcon />,
          },
        ],
        children: gateData.slides.map(buildSlideNode),
      },
    ]

    return (
      <div>
        <div className="admin__editor-head admin__editor-head--structure">
          <button className="admin__back" type="button" onClick={onBack}>
            <ChevronLeftIcon />
            {copy.back}
          </button>
          <div>
            <EditableTitle
              value={gateData.sectionName}
              fallback={copy.gateTitle}
              onChange={(sectionName) => onChange({ ...gateData, sectionName })}
            />
            <p className="admin__lead">{copy.gateModulesLead}</p>
          </div>
        </div>

        <StructureTree
          nodes={tree}
          selectedId={editingId}
          onSelect={onEditingIdChange}
          onToggleEnabled={(id, enabled) => {
            const root = treeRootId(id)
            const slide = gateData.slides.find((item) => item.id === root)
            if (!slide) return
            const child = treeParts(id)

            if (child.length === 0) {
              setSlideEnabled(id, enabled)
              return
            }

            if (child[0] === 'kicker') {
              replaceSlide({
                ...slide,
                visible: { ...slide.visible, kicker: enabled },
              })
            } else if (child[0] === 'title') {
              replaceSlide({
                ...slide,
                visible: { ...slide.visible, title: enabled },
              })
            } else if (child[0] === 'body') {
              replaceSlide({
                ...slide,
                visible: { ...slide.visible, body: enabled },
              })
            } else if (child[0] === 'media') {
              replaceSlide({
                ...slide,
                visible: { ...slide.visible, media: enabled },
              })
            } else if (child[0] === 'buttons') {
              replaceSlide({
                ...slide,
                visible: { ...slide.visible, buttons: enabled },
              })
            }
          }}
          onDelete={(id) => {
            const root = treeRootId(id)
            const partsOf = treeParts(id)
            if (!root) return
            if (partsOf.length === 0) {
              setPendingRemoveId(root)
              return
            }
            if (partsOf[0] === 'btn' && partsOf[1]) {
              setPendingButtonId(partsOf[1])
              return
            }
            const slide = gateData.slides.find((item) => item.id === root)
            if (!slide) return
            const slot = partsOf[0] as GateSlotId
            if (!GATE_SLOT_IDS.includes(slot) || !slide.slots.includes(slot)) {
              return
            }
            replaceSlide({
              ...slide,
              slots: slide.slots.filter((item) => item !== slot),
              visible: { ...slide.visible, [slot]: false },
            })
            if (editingId === id || editingId?.startsWith(`${id}::`)) {
              onEditingIdChange(slide.id)
            }
          }}
          onAddOption={(parentId, optionId) => {
            if (parentId === GATE_ROOT_ID && optionId === 'slide') {
              addSlide()
              return
            }
            const root = treeRootId(parentId)
            const slide = gateData.slides.find((item) => item.id === root)
            if (!slide) return
            if (
              treeParts(parentId)[0] === 'buttons' &&
              optionId === 'button'
            ) {
              const button = createGateButton()
              replaceSlide({
                ...slide,
                buttons: [...slide.buttons, button],
                visible: { ...slide.visible, buttons: true },
              })
              onEditingIdChange(treeChildId(slide.id, 'btn', button.id))
              return
            }
            if (
              parentId === slide.id &&
              GATE_SLOT_IDS.includes(optionId as GateSlotId) &&
              !slide.slots.includes(optionId as GateSlotId)
            ) {
              const slot = optionId as GateSlotId
              replaceSlide({
                ...slide,
                slots: [...slide.slots, slot],
                visible: { ...slide.visible, [slot]: true },
              })
              onEditingIdChange(treeChildId(slide.id, slot))
            }
          }}
          onReorder={(parentId, orderedIds) => {
            if (parentId === GATE_ROOT_ID) {
              onChange({
                ...gateData,
                slides: orderListByIds(gateData.slides, orderedIds),
              })
              return
            }
            const root = treeRootId(parentId)
            const slide = gateData.slides.find((item) => item.id === root)
            if (!slide) return
            if (treeParts(parentId)[0] === 'buttons') {
              const buttonIds = orderedIds
                .map((id) => treeParts(id)[1])
                .filter(Boolean)
              replaceSlide({
                ...slide,
                buttons: orderListByIds(slide.buttons, buttonIds),
              })
              return
            }
            if (parentId === slide.id) {
              const slots = orderedIds
                .map((id) => treeParts(id)[0])
                .filter((slot): slot is GateSlotId =>
                  Boolean(slot && slide.slots.includes(slot as GateSlotId)),
                )
              replaceSlide({ ...slide, slots })
            }
          }}
        />

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
        {buttonDeleteDialog}
      </div>
    )
  }

  if (editingId === GATE_ROOT_ID) {
    return (
      <InspectorShell
        titleNode={
          <EditableTitle
            value={gateData.sectionName}
            fallback={copy.gateRootTitle}
            onChange={(sectionName) => onChange({ ...gateData, sectionName })}
          />
        }
        lead={copy.gateRootDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <p className="admin__lead">{copy.gateModulesLead}</p>
      </InspectorShell>
    )
  }

  if (!editing) {
    return (
      <div className="admin__inspector-empty">
        <h2>{copy.inspectorEmptyTitle}</h2>
        <p className="admin__lead">{copy.inspectorEmptyDesc}</p>
      </div>
    )
  }

  return (
    <SlideInspector
      slide={editing}
      parts={parts}
      slideIndex={gateData.slides.findIndex((item) => item.id === editing.id)}
      tab={tab}
      onTab={setTab}
      onChange={replaceSlide}
      onClose={() => onEditingIdChange(null)}
      onDelete={() => setPendingRemoveId(editing.id)}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
      deleteDialog={deleteDialog}
      setPendingButtonId={setPendingButtonId}
      buttonDeleteDialog={buttonDeleteDialog}
    />
  )
}

function SlideInspector({
  slide,
  parts,
  slideIndex,
  tab,
  onTab,
  onChange,
  onClose,
  onDelete,
  saveLabel,
  saveStatus,
  isDirty,
  onSave,
  deleteDialog,
  setPendingButtonId,
  buttonDeleteDialog,
}: {
  slide: GateSlide
  parts: string[]
  slideIndex: number
  tab: Locale
  onTab: (locale: Locale) => void
  onChange: (next: GateSlide) => void
  onClose: () => void
  onDelete: () => void
  saveLabel: string
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  deleteDialog: React.ReactNode
  setPendingButtonId: (value: string | null) => void
  buttonDeleteDialog: React.ReactNode
}) {
  const copy = adminCopy.dashboard
  const defaultSlideName = `${copy.slideModuleTitle} ${slideIndex + 1}`
  const hasMedia = slide.mediaUrl.trim().length > 0
  const buttons = slide.buttons
  const buttonId = parts[0] === 'btn' ? parts[1] : null
  const button = buttonId
    ? buttons.find((item) => item.id === buttonId)
    : undefined

  if (parts[0] === 'kicker') {
    return (
      <InspectorShell
        title={copy.gateKicker}
        lead={copy.slideModuleDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={copy.gateKicker}
          show={slide.visible.kicker}
          onShow={(kicker) =>
            onChange({
              ...slide,
              visible: { ...slide.visible, kicker },
            })
          }
          textStyle={slide.textStyles.kicker}
          onTextStyle={(kicker) =>
            onChange({
              ...slide,
              textStyles: { ...slide.textStyles, kicker },
            })
          }
        >
          <input
            className="admin__input"
            value={slide.kicker[tab]}
            onChange={(event) =>
              onChange({
                ...slide,
                kicker: { ...slide.kicker, [tab]: event.target.value },
              })
            }
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (parts[0] === 'title') {
    return (
      <InspectorShell
        title={copy.gateHeadline}
        lead={copy.slideModuleDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={copy.gateHeadline}
          show={slide.visible.title}
          onShow={(title) =>
            onChange({
              ...slide,
              visible: { ...slide.visible, title },
            })
          }
          textStyle={slide.textStyles.title}
          onTextStyle={(title) =>
            onChange({
              ...slide,
              textStyles: { ...slide.textStyles, title },
            })
          }
        >
          <input
            className="admin__input"
            value={slide.title[tab]}
            onChange={(event) =>
              onChange({
                ...slide,
                title: { ...slide.title, [tab]: event.target.value },
              })
            }
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (parts[0] === 'body') {
    return (
      <InspectorShell
        title={copy.gateBody}
        lead={copy.slideModuleDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={copy.gateBody}
          show={slide.visible.body}
          onShow={(body) =>
            onChange({
              ...slide,
              visible: { ...slide.visible, body },
            })
          }
          textStyle={slide.textStyles.body}
          onTextStyle={(body) =>
            onChange({
              ...slide,
              textStyles: { ...slide.textStyles, body },
            })
          }
        >
          <textarea
            className="admin__textarea"
            rows={4}
            value={slide.body[tab]}
            onChange={(event) =>
              onChange({
                ...slide,
                body: { ...slide.body, [tab]: event.target.value },
              })
            }
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (parts[0] === 'media') {
    return (
      <InspectorShell
        title={copy.gateMedia}
        lead={copy.gateMediaDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <FieldWithShow
          label={copy.gateMedia}
          show={slide.visible.media}
          onShow={(media) =>
            onChange({
              ...slide,
              visible: { ...slide.visible, media },
            })
          }
        >
          <div className="admin__align-row">
            <span>{copy.showMedia}</span>
            <div className="admin__align">
              <button
                type="button"
                className={`admin__align-btn${slide.mediaKind === 'image' ? ' admin__align-btn--on' : ''}`}
                disabled={hasMedia && slide.mediaKind === 'video'}
                title={
                  hasMedia && slide.mediaKind === 'video'
                    ? copy.gateMediaLocked
                    : undefined
                }
                onClick={() => onChange({ ...slide, mediaKind: 'image' })}
              >
                {copy.gateMediaImage}
              </button>
              <button
                type="button"
                className={`admin__align-btn${slide.mediaKind === 'video' ? ' admin__align-btn--on' : ''}`}
                disabled={hasMedia && slide.mediaKind === 'image'}
                title={
                  hasMedia && slide.mediaKind === 'image'
                    ? copy.gateMediaLocked
                    : undefined
                }
                onClick={() => onChange({ ...slide, mediaKind: 'video' })}
              >
                {copy.gateMediaVideo}
              </button>
            </div>
          </div>

          <MediaPickerField
            urls={slide.mediaUrl ? [slide.mediaUrl] : []}
            onChange={(urls) =>
              onChange({ ...slide, mediaUrl: urls[0] ?? '' })
            }
            folder="gate"
            kind={slide.mediaKind}
            accept={
              slide.mediaKind === 'video'
                ? 'video/mp4,video/webm'
                : 'image/png,image/jpeg,image/webp,image/gif,image/avif'
            }
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (button) {
    return (
      <InspectorShell
        title={button.label[tab].trim() || copy.blockButton}
        lead={copy.addCtaDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
        onDelete={() => setPendingButtonId(button.id)}
        deleteDialog={buttonDeleteDialog}
      >
        <FieldWithShow
          label={copy.blockButton}
          show
          onShow={() => {}}
          hideToggle
          textStyle={button.labelStyle}
          onTextStyle={(labelStyle) =>
            onChange({
              ...slide,
              buttons: buttons.map((item) =>
                item.id === button.id ? { ...item, labelStyle } : item,
              ),
            })
          }
        >
          <input
            className="admin__input"
            value={button.label[tab]}
            onChange={(event) =>
              onChange({
                ...slide,
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
        </FieldWithShow>
        <ButtonStyleControls
          value={button.buttonStyle}
          onChange={(buttonStyle) =>
            onChange({
              ...slide,
              buttons: buttons.map((item) =>
                item.id === button.id ? { ...item, buttonStyle } : item,
              ),
            })
          }
        />
        <AdminSelect
          label={copy.buttonLink}
          value={buttonSelectValue(button.to)}
          options={[
            ...BUTTON_TARGETS.map((target) => ({
              id: target.to,
              label: target.label,
            })),
            { id: EXTERNAL_LINK_VALUE, label: copy.linkExternal },
          ]}
          onChange={(value) => {
            const nextTo =
              value === EXTERNAL_LINK_VALUE
                ? isExternalHref(button.to)
                  ? button.to
                  : 'https://'
                : value
            onChange({
              ...slide,
              buttons: buttons.map((item) =>
                item.id === button.id ? { ...item, to: nextTo } : item,
              ),
            })
          }}
        />
        {buttonSelectValue(button.to) === EXTERNAL_LINK_VALUE ? (
          <input
            className="admin__input"
            value={button.to}
            onChange={(event) =>
              onChange({
                ...slide,
                buttons: buttons.map((item) =>
                  item.id === button.id
                    ? { ...item, to: event.target.value }
                    : item,
                ),
              })
            }
          />
        ) : null}
      </InspectorShell>
    )
  }

  if (parts[0] === 'buttons') {
    return (
      <InspectorShell
        title={copy.gateButtonsTitle}
        lead={copy.gateButtonsDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={slide.visible.buttons}
            onChange={(event) =>
              onChange({
                ...slide,
                visible: { ...slide.visible, buttons: event.target.checked },
              })
            }
          />
          {copy.showButtons}
        </label>
        <p className="admin__lead">{copy.gateButtonsDesc}</p>
      </InspectorShell>
    )
  }

  return (
    <InspectorShell
      titleNode={
        <EditableTitle
          value={slide.name}
          fallback={defaultSlideName}
          onChange={(name) => onChange({ ...slide, name })}
        />
      }
      lead={copy.gateSlideGlobalsDesc}
      onClose={onClose}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
      onDelete={onDelete}
      deleteDialog={deleteDialog}
    >
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
              aria-selected={slide.accent === swatch.id}
              className={`admin__swatch${slide.accent === swatch.id ? ' admin__swatch--on' : ''}`}
              data-accent={swatch.id}
              onClick={() => onChange({ ...slide, accent: swatch.id })}
            />
          ))}
        </div>
      </div>
    </InspectorShell>
  )
}
