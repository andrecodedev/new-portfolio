import { useState } from 'react'
import type { SiteLocale } from '../cms/chrome-content'
import {
  FOOTER_SLOT_IDS,
  type CmsFooterPayload,
  type FooterSlotId,
} from '../cms/footer-content'
import { adminCopy } from './admin-copy'
import EditableTitle from './editable-title'
import FieldWithShow from './field-with-show'
import { ChevronLeftIcon, TreeHeaderIcon, TreeTextIcon } from './icons'
import InspectorShell from './inspector-shell'
import LocaleTabs from './locale-tabs'
import StructureTree, { type StructureTreeNode } from './structure-tree'
import { treeChildId, treeParts } from './tree-path'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type EditorPane = 'structure' | 'inspector'

const FOOTER_ROOT = 'footer'
const LINE1_ID = treeChildId(FOOTER_ROOT, 'line1')
const LINE2_ID = treeChildId(FOOTER_ROOT, 'line2')

type FooterEditorProps = {
  pane: EditorPane
  footerData: CmsFooterPayload
  onChange: (next: CmsFooterPayload) => void
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  onBack: () => void
  editingId: string | null
  onEditingIdChange: (id: string | null) => void
  locales: SiteLocale[]
}

export default function FooterEditor({
  pane,
  footerData,
  onChange,
  saveStatus,
  isDirty,
  onSave,
  onBack,
  editingId,
  onEditingIdChange,
  locales,
}: FooterEditorProps) {
  const enabledLocales = locales.filter((item) => item.enabled)
  const [tab, setTab] = useState(enabledLocales[0]?.code ?? 'pt')
  const copy = adminCopy.dashboard
  const activeTab = enabledLocales.some((item) => item.code === tab)
    ? tab
    : enabledLocales[0]?.code ?? 'pt'
  const parts = treeParts(editingId)

  const saveLabel =
    saveStatus === 'success'
      ? copy.published
      : saveStatus === 'saving'
        ? copy.publishing
        : copy.publishFooter

  const lineNode = (slot: FooterSlotId): StructureTreeNode => {
    if (slot === 'line1') {
      return {
        id: LINE1_ID,
        title: copy.footerLine1,
        description: copy.footerLine1Desc,
        icon: <TreeTextIcon />,
        enabled: footerData.showLine1,
        showToggle: true,
        deletable: true,
      }
    }
    return {
      id: LINE2_ID,
      title: copy.footerLine2,
      description: copy.footerLine2Desc,
      icon: <TreeTextIcon />,
      enabled: footerData.showLine2,
      showToggle: true,
      deletable: true,
    }
  }

  const nextMissingLine = (): FooterSlotId | null => {
    for (const slot of FOOTER_SLOT_IDS) {
      if (!footerData.slots.includes(slot)) return slot
    }
    return null
  }

  if (pane === 'structure') {
    const missing = nextMissingLine()
    const tree: StructureTreeNode[] = [
      {
        id: FOOTER_ROOT,
        title: footerData.sectionName.trim() || copy.footerRootTitle,
        description: copy.footerRootDesc,
        icon: <TreeHeaderIcon />,
        enabled: footerData.enabled,
        showToggle: true,
        draggable: false,
        addLabel: copy.addBlock,
        addOptions: missing
          ? [
              {
                id: missing,
                label: copy.addFooterLine,
                description: copy.addFooterLineDesc,
                icon: <TreeTextIcon />,
              },
            ]
          : [],
        children: footerData.slots.map(lineNode),
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
              value={footerData.sectionName}
              fallback={copy.footerTitle}
              onChange={(sectionName) => onChange({ ...footerData, sectionName })}
            />
            <p className="admin__lead">{copy.footerModulesLead}</p>
          </div>
        </div>

        <StructureTree
          nodes={tree}
          selectedId={editingId}
          onSelect={onEditingIdChange}
          onToggleEnabled={(id, enabled) => {
            if (id === FOOTER_ROOT) {
              onChange({ ...footerData, enabled })
              return
            }
            if (id === LINE1_ID) {
              onChange({ ...footerData, showLine1: enabled })
              return
            }
            if (id === LINE2_ID) {
              onChange({ ...footerData, showLine2: enabled })
            }
          }}
          onDelete={(id) => {
            if (id === LINE1_ID) {
              onChange({
                ...footerData,
                slots: footerData.slots.filter((slot) => slot !== 'line1'),
                showLine1: false,
              })
              if (editingId === id) onEditingIdChange(FOOTER_ROOT)
              return
            }
            if (id === LINE2_ID) {
              onChange({
                ...footerData,
                slots: footerData.slots.filter((slot) => slot !== 'line2'),
                showLine2: false,
              })
              if (editingId === id) onEditingIdChange(FOOTER_ROOT)
            }
          }}
          onAddOption={(parentId, optionId) => {
            if (parentId !== FOOTER_ROOT) return
            if (
              (optionId === 'line1' || optionId === 'line2') &&
              !footerData.slots.includes(optionId)
            ) {
              const slot = optionId as FooterSlotId
              onChange({
                ...footerData,
                slots: [...footerData.slots, slot],
                ...(slot === 'line1'
                  ? { showLine1: true }
                  : { showLine2: true }),
              })
              onEditingIdChange(treeChildId(FOOTER_ROOT, slot))
            }
          }}
          onReorder={(parentId, orderedIds) => {
            if (parentId !== FOOTER_ROOT) return
            const slots = orderedIds
              .map((id) => treeParts(id)[0])
              .filter((slot): slot is FooterSlotId =>
                Boolean(
                  slot && footerData.slots.includes(slot as FooterSlotId),
                ),
              )
            onChange({ ...footerData, slots })
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
      </div>
    )
  }

  if (editingId === FOOTER_ROOT) {
    return (
      <InspectorShell
        titleNode={
          <EditableTitle
            value={footerData.sectionName}
            fallback={copy.footerRootTitle}
            onChange={(sectionName) => onChange({ ...footerData, sectionName })}
          />
        }
        lead={copy.footerRootDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={footerData.enabled}
            onChange={(event) =>
              onChange({ ...footerData, enabled: event.target.checked })
            }
          />
          {footerData.enabled ? copy.showBlock : copy.hideBlock}
        </label>
        <p className="admin__lead">{copy.footerModulesLead}</p>
      </InspectorShell>
    )
  }

  if (parts[0] === 'line1' && footerData.slots.includes('line1')) {
    return (
      <InspectorShell
        title={copy.footerLine1}
        lead={copy.footerLine1Desc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <LocaleTabs
          locales={enabledLocales}
          value={activeTab}
          onChange={setTab}
        />
        <FieldWithShow
          label={copy.footerLine1}
          show={footerData.showLine1}
          onShow={(showLine1) => onChange({ ...footerData, showLine1 })}
          textStyle={footerData.line1Style}
          onTextStyle={(line1Style) => onChange({ ...footerData, line1Style })}
        >
          <input
            className="admin__input"
            type="text"
            value={footerData.line1[activeTab] ?? ''}
            onChange={(event) =>
              onChange({
                ...footerData,
                line1: { ...footerData.line1, [activeTab]: event.target.value },
              })
            }
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (parts[0] === 'line2' && footerData.slots.includes('line2')) {
    return (
      <InspectorShell
        title={copy.footerLine2}
        lead={copy.footerLine2Desc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <LocaleTabs
          locales={enabledLocales}
          value={activeTab}
          onChange={setTab}
        />
        <FieldWithShow
          label={copy.footerLine2}
          show={footerData.showLine2}
          onShow={(showLine2) => onChange({ ...footerData, showLine2 })}
          textStyle={footerData.line2Style}
          onTextStyle={(line2Style) => onChange({ ...footerData, line2Style })}
        >
          <input
            className="admin__input"
            type="text"
            value={footerData.line2[activeTab] ?? ''}
            onChange={(event) =>
              onChange({
                ...footerData,
                line2: { ...footerData.line2, [activeTab]: event.target.value },
              })
            }
          />
        </FieldWithShow>
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
