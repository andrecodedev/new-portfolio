import type { CSSProperties } from 'react'
import {
  DESIGN_FONT_OPTIONS,
  DESIGN_ICON_STYLES,
  DESIGN_ICON_WEIGHTS,
  ICON_STROKE,
  ICON_TILE_RADIUS_PX,
  ICON_TILE_WASH,
  type CmsDesignPayload,
  type DesignFontId,
  type DesignIconStyle,
  type DesignIconWeight,
} from '../cms/design-content'
import { SiteIcon } from '../cms/icon-registry'
import { adminCopy } from './admin-copy'
import AdminSelect from './admin-select'
import ColorField from './color-field'
import EditableTitle from './editable-title'
import { ChevronLeftIcon, GearIcon } from './icons'
import InspectorShell from './inspector-shell'
import SizePresetControls from './size-preset-controls'
import StructureTree, { type StructureTreeNode } from './structure-tree'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type EditorPane = 'structure' | 'inspector'

const DESIGN_ROOT = 'design'

type DesignEditorProps = {
  pane: EditorPane
  designData: CmsDesignPayload
  onChange: (next: CmsDesignPayload) => void
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  onBack: () => void
  editingId: string | null
  onEditingIdChange: (id: string | null) => void
}

export default function DesignEditor({
  pane,
  designData,
  onChange,
  saveStatus,
  isDirty,
  onSave,
  onBack,
  editingId,
  onEditingIdChange,
}: DesignEditorProps) {
  const copy = adminCopy.dashboard
  const saveLabel =
    saveStatus === 'success'
      ? copy.published
      : saveStatus === 'saving'
        ? copy.publishing
        : copy.publishDesign

  const patchStage = (partial: Partial<CmsDesignPayload['stage']>) => {
    onChange({ ...designData, stage: { ...designData.stage, ...partial } })
  }
  const patchColors = (partial: Partial<CmsDesignPayload['colors']>) => {
    onChange({ ...designData, colors: { ...designData.colors, ...partial } })
  }
  const patchType = (partial: Partial<CmsDesignPayload['typography']>) => {
    onChange({
      ...designData,
      typography: { ...designData.typography, ...partial },
    })
  }
  const patchIcons = (partial: Partial<CmsDesignPayload['icons']>) => {
    onChange({
      ...designData,
      icons: { ...designData.icons, ...partial },
    })
  }

  if (pane === 'structure') {
    const tree: StructureTreeNode[] = [
      {
        id: DESIGN_ROOT,
        title: designData.sectionName.trim() || copy.designRootTitle,
        description: copy.designRootDesc,
        icon: <GearIcon />,
        draggable: false,
        defaultExpanded: true,
        children: [
          {
            id: 'typography',
            title: copy.designTypeTitle,
            description: copy.designTypeDesc,
            icon: <GearIcon />,
            draggable: false,
          },
          {
            id: 'icons',
            title: copy.designIconsTitle,
            description: copy.designIconsDesc,
            icon: <GearIcon />,
            draggable: false,
          },
          {
            id: 'colors',
            title: copy.designColorsTitle,
            description: copy.designColorsDesc,
            icon: <GearIcon />,
            draggable: false,
          },
          {
            id: 'stage',
            title: copy.designStageTitle,
            description: copy.designStageDesc,
            icon: <GearIcon />,
            draggable: false,
          },
        ],
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
              value={designData.sectionName}
              fallback={copy.designTitle}
              onChange={(sectionName) => onChange({ ...designData, sectionName })}
            />
            <p className="admin__lead">{copy.designModulesLead}</p>
          </div>
        </div>

        <StructureTree
          nodes={tree}
          selectedId={editingId}
          onSelect={onEditingIdChange}
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
      </div>
    )
  }

  if (!editingId || editingId === DESIGN_ROOT) {
    return (
      <InspectorShell
        title={copy.designRootTitle}
        lead={copy.designRootDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <p className="admin__lead">{copy.designModulesLead}</p>
      </InspectorShell>
    )
  }

  if (editingId === 'typography') {
    return (
      <InspectorShell
        title={copy.designTypeTitle}
        lead={copy.designTypeDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <div className="admin-type-sample" aria-hidden="true">
          <p
            className="admin-type-sample__title"
            style={{
              fontFamily: fontStackOf(designData.typography.titleFont),
            }}
          >
            {copy.designTypeSampleTitle}
          </p>
          <p
            className="admin-type-sample__lead"
            style={{
              fontFamily: fontStackOf(designData.typography.subtitleFont),
            }}
          >
            {copy.designTypeSampleLead}
          </p>
          <p
            className="admin-type-sample__body"
            style={{
              fontFamily: fontStackOf(designData.typography.bodyFont),
            }}
          >
            {copy.designTypeSampleBody}
          </p>
          <p
            className="admin-type-sample__ui"
            style={{
              fontFamily: fontStackOf(designData.typography.uiFont),
            }}
          >
            {copy.designTypeSampleUi}
          </p>
        </div>

        <FontSelect
          label={copy.designFontTitle}
          hint={copy.designFontTitleHint}
          value={designData.typography.titleFont}
          onChange={(titleFont) => patchType({ titleFont })}
        />
        <FontSelect
          label={copy.designFontSubtitle}
          hint={copy.designFontSubtitleHint}
          value={designData.typography.subtitleFont}
          onChange={(subtitleFont) => patchType({ subtitleFont })}
        />
        <FontSelect
          label={copy.designFontBody}
          hint={copy.designFontBodyHint}
          value={designData.typography.bodyFont}
          onChange={(bodyFont) => patchType({ bodyFont })}
        />
        <FontSelect
          label={copy.designFontUi}
          hint={copy.designFontUiHint}
          value={designData.typography.uiFont}
          onChange={(uiFont) => patchType({ uiFont })}
        />
      </InspectorShell>
    )
  }

  if (editingId === 'icons') {
    const tiled = designData.icons.style === 'tile'
    const previewStyle = {
      ['--cms-accent']: designData.colors.accent,
      ['--icon-tile-wash']: tiled
        ? ICON_TILE_WASH[designData.icons.wash]
        : '0%',
      ['--icon-tile-radius']: tiled
        ? `${ICON_TILE_RADIUS_PX[designData.icons.radius]}px`
        : '0px',
      ['--icon-stroke']: ICON_STROKE[designData.icons.weight],
      ['--icon-glyph-scale']: tiled ? '0.55' : '1',
    } as CSSProperties

    return (
      <InspectorShell
        title={copy.designIconsTitle}
        lead={copy.designIconsDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <div className="admin-icon-sample" style={previewStyle} aria-hidden="true">
          <span className="admin-icon-sample__label">{copy.designIconSample}</span>
          <div className="admin-icon-sample__row">
            {(['chat', 'code', 'spark', 'github', 'layers'] as const).map(
              (id) => (
                <SiteIcon key={id} id={id} className="admin-icon-sample__icon" />
              ),
            )}
          </div>
        </div>

        <AdminSelect
          label={copy.designIconStyle}
          value={designData.icons.style}
          onChange={(style) =>
            patchIcons({ style: style as DesignIconStyle })
          }
          options={DESIGN_ICON_STYLES.map((item) => ({
            id: item.id,
            label: item.label,
          }))}
        />
        <AdminSelect
          label={copy.designIconWeight}
          value={designData.icons.weight}
          onChange={(weight) =>
            patchIcons({ weight: weight as DesignIconWeight })
          }
          options={DESIGN_ICON_WEIGHTS.map((item) => ({
            id: item.id,
            label: item.label,
          }))}
        />
        <SizePresetControls
          label={copy.designIconWash}
          value={designData.icons.wash}
          onChange={(wash) => patchIcons({ wash })}
        />
        <SizePresetControls
          label={copy.designIconRadius}
          value={designData.icons.radius}
          onChange={(radius) => patchIcons({ radius })}
        />
      </InspectorShell>
    )
  }

  if (editingId === 'colors') {
    return (
      <InspectorShell
        title={copy.designColorsTitle}
        lead={copy.designColorsDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <ColorField
          label={copy.designColorText}
          value={designData.colors.text}
          onChange={(text) => patchColors({ text })}
        />
        <ColorField
          label={copy.designColorMuted}
          value={designData.colors.muted}
          onChange={(muted) => patchColors({ muted })}
        />
        <ColorField
          label={copy.designColorAccent}
          value={designData.colors.accent}
          onChange={(accent) => patchColors({ accent })}
        />
        <ColorField
          label={copy.designColorBgStage}
          value={designData.stage.bgStage}
          onChange={(bgStage) => patchStage({ bgStage })}
        />
        <ColorField
          label={copy.designColorBgOuter}
          value={designData.stage.bgOuter}
          onChange={(bgOuter) => patchStage({ bgOuter })}
        />
      </InspectorShell>
    )
  }

  if (editingId === 'stage') {
    return (
      <InspectorShell
        title={copy.designStageTitle}
        lead={copy.designStageDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <SizePresetControls
          label={copy.designRespiroDesktop}
          value={designData.stage.respiroDesktop}
          onChange={(respiroDesktop) => patchStage({ respiroDesktop })}
        />
        <SizePresetControls
          label={copy.designRespiroMobile}
          value={designData.stage.respiroMobile}
          onChange={(respiroMobile) => patchStage({ respiroMobile })}
        />
        <SizePresetControls
          label={copy.designStageRadius}
          value={designData.stage.radius}
          onChange={(radius) => patchStage({ radius })}
        />
      </InspectorShell>
    )
  }

  return (
    <div className="admin__inspector-empty">
      <h2>{copy.inspectorEmptyTitle}</h2>
      <p className="admin__lead">{copy.inspectorEmptyDesc}</p>
    </div>
  )
}

function fontStackOf(id: DesignFontId) {
  return (
    DESIGN_FONT_OPTIONS.find((font) => font.id === id)?.stack ??
    DESIGN_FONT_OPTIONS[0].stack
  )
}

function FontSelect({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: DesignFontId
  onChange: (next: DesignFontId) => void
}) {
  return (
    <>
      <AdminSelect
        label={label}
        value={value}
        onChange={onChange}
        options={DESIGN_FONT_OPTIONS.map((font) => ({
          id: font.id,
          label: font.label,
          description: 'Aa Bb Cc 0123',
          previewStyle: { fontFamily: font.stack },
        }))}
      />
      {hint ? <p className="admin__lead admin__lead--tight">{hint}</p> : null}
    </>
  )
}
