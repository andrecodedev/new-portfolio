import {
  DESIGN_FONT_OPTIONS,
  type CmsDesignPayload,
  type DesignFontId,
} from '../cms/design-content'
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
        <FontSelect
          label={copy.designFontTitle}
          value={designData.typography.titleFont}
          onChange={(titleFont) => patchType({ titleFont })}
        />
        <FontSelect
          label={copy.designFontSubtitle}
          value={designData.typography.subtitleFont}
          onChange={(subtitleFont) => patchType({ subtitleFont })}
        />
        <FontSelect
          label={copy.designFontBody}
          value={designData.typography.bodyFont}
          onChange={(bodyFont) => patchType({ bodyFont })}
        />
        <FontSelect
          label={copy.designFontUi}
          value={designData.typography.uiFont}
          onChange={(uiFont) => patchType({ uiFont })}
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

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: DesignFontId
  onChange: (next: DesignFontId) => void
}) {
  return (
    <AdminSelect
      label={label}
      value={value}
      onChange={onChange}
      options={DESIGN_FONT_OPTIONS.map((font) => ({
        id: font.id,
        label: font.label,
      }))}
    />
  )
}
