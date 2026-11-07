import { useState } from 'react'
import type { Locale } from '../i18n/copy'
import {
  BUTTON_TARGETS,
  buttonSelectValue,
  createBlankIntroModule,
  createLineButton,
  createLineModule,
  createScrollModule,
  EXTERNAL_LINK_VALUE,
  isExternalHref,
  nextIntroSlot,
  nextLineSlot,
  type Align,
  type CmsHeroPayload,
  type DesktopTextSide,
  type HeroModule,
  type IntroModule,
  type IntroSlotId,
  type LineModule,
  type LineSlotId,
  type MobileAvatarPlace,
  type ScrollModule,
  type ScrollSlotId,
} from '../cms/hero-content'
import { ACCENT_SWATCHES } from '../cms/accent-swatches'
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
  TreeScrollIcon,
  TreeTextIcon,
} from './icons'
import InspectorShell from './inspector-shell'
import MediaPickerField from './media-picker'
import StructureTree, { type StructureTreeNode } from './structure-tree'
import { orderListByIds } from './structure-block'
import { treeChildId, treeParts, treeRootId } from './tree-path'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type EditorPane = 'structure' | 'inspector'

const HERO_ROOT_ID = 'hero'

type HeroEditorProps = {
  pane: EditorPane
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

function defaultModuleTitle(module: HeroModule, copy: typeof adminCopy.dashboard) {
  if (module.kind === 'intro') return copy.introModuleTitle
  if (module.kind === 'scroll') return copy.scrollModuleTitle
  return copy.lineModuleTitle
}

function moduleDesc(module: HeroModule, copy: typeof adminCopy.dashboard) {
  if (module.kind === 'intro') return copy.introGlobalsDesc
  if (module.kind === 'scroll') return copy.scrollGlobalsDesc
  return copy.lineModuleDesc
}

function moduleIcon(module: HeroModule) {
  if (module.kind === 'intro') return <TreePhotoIcon />
  if (module.kind === 'scroll') return <TreeScrollIcon />
  return <TreeTextIcon />
}

export default function HeroEditor({
  pane,
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
  const [pendingAccent, setPendingAccent] = useState<number | null>(null)
  const [pendingButtonId, setPendingButtonId] = useState<string | null>(null)
  const copy = adminCopy.dashboard

  const rootModuleId = treeRootId(editingId)
  const editing =
    rootModuleId && rootModuleId !== HERO_ROOT_ID
      ? heroData.modules.find((module) => module.id === rootModuleId)
      : undefined
  const parts = treeParts(editingId)

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

  const deleteDialog = pendingRemoveId ? (
    <ConfirmDialog
      title={copy.deleteModuleTitle}
      description={copy.deleteModuleDesc}
      confirmLabel={copy.confirmDelete}
      onCancel={() => setPendingRemoveId(null)}
      onConfirm={() => {
        removeModule(pendingRemoveId)
        setPendingRemoveId(null)
      }}
    />
  ) : null

  const setModuleEnabled = (id: string, enabled: boolean) => {
    onChange({
      ...heroData,
      modules: heroData.modules.map((module) =>
        module.id === id ? { ...module, enabled } : module,
      ),
    })
  }

  const introSlotNode = (
    module: IntroModule,
    slot: IntroSlotId,
  ): StructureTreeNode => {
    if (slot === 'photo') {
      return {
        id: treeChildId(module.id, 'photo'),
        title: copy.introPhotoTitle,
        description: copy.introPhotoDesc,
        icon: <TreePhotoIcon />,
        enabled: module.showAvatar,
        showToggle: true,
        deletable: true,
      }
    }
    const map = {
      title1: { title: copy.titleLine1, key: 'titleLine1' as const },
      title2: { title: copy.titleLine2, key: 'titleLine2' as const },
      sub1: { title: copy.subtitleLine1, key: 'subtitleLine1' as const },
      sub2: { title: copy.subtitleLine2, key: 'subtitleLine2' as const },
    }[slot]
    return {
      id: treeChildId(module.id, slot),
      title: map.title,
      icon: <TreeTextIcon />,
      enabled: module.visible[map.key],
      showToggle: true,
      deletable: true,
    }
  }

  const introAddOptions = (module: IntroModule) => {
    const options = []
    if (nextIntroSlot(module.slots, 'photo')) {
      options.push({
        id: 'photo',
        label: copy.addPhoto,
        description: copy.addPhotoDesc,
        icon: <TreePhotoIcon />,
      })
    }
    if (nextIntroSlot(module.slots, 'title')) {
      options.push({
        id: 'title',
        label: copy.addTitleBlock,
        description: copy.addTitleBlockDesc,
        icon: <TreeTextIcon />,
      })
    }
    if (nextIntroSlot(module.slots, 'subtitle')) {
      options.push({
        id: 'subtitle',
        label: copy.addSubtitleBlock,
        description: copy.addSubtitleBlockDesc,
        icon: <TreeTextIcon />,
      })
    }
    return options
  }

  const lineSlotNode = (
    module: LineModule,
    slot: LineSlotId,
  ): StructureTreeNode => {
    if (slot === 'title1' || slot === 'title2') {
      const key = slot === 'title1' ? 'titleLine1' : 'titleLine2'
      return {
        id: treeChildId(module.id, slot),
        title: slot === 'title1' ? copy.titleLine1 : copy.titleLine2,
        icon: <TreeTextIcon />,
        enabled: module.visible[key],
        showToggle: true,
        deletable: true,
      }
    }
    if (slot === 'body') {
      return {
        id: treeChildId(module.id, 'body'),
        title: copy.blockDescription,
        icon: <TreeTextIcon />,
        enabled: module.visible.body,
        showToggle: true,
        deletable: true,
      }
    }
    if (slot === 'accents') {
      return {
        id: treeChildId(module.id, 'accents'),
        title: copy.lineAccentsTitle,
        description: copy.lineAccentsDesc,
        icon: <TreeTextIcon />,
        deletable: true,
      }
    }
    if (slot === 'buttons') {
      return {
        id: treeChildId(module.id, 'buttons'),
        title: copy.lineButtonsTitle,
        description: copy.lineButtonsDesc,
        icon: <TreeButtonIcon />,
        enabled: module.visible.cta,
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
        children: module.buttons.map((button, index) => ({
          id: treeChildId(module.id, 'btn', button.id),
          title: button.label.pt.trim() || `${copy.blockButton} ${index + 1}`,
          icon: <TreeButtonIcon />,
          deletable: true,
        })),
      }
    }
    return {
      id: treeChildId(module.id, 'image'),
      title: copy.lineImageTitle,
      description: copy.lineImageDesc,
      icon: <TreePhotoIcon />,
      enabled: module.visible.image,
      showToggle: true,
      deletable: true,
    }
  }

  const lineAddOptions = (module: LineModule) => {
    const options = []
    if (nextLineSlot(module.slots, 'title')) {
      options.push({
        id: 'title',
        label: copy.addTitleBlock,
        description: copy.addTitleBlockDesc,
        icon: <TreeTextIcon />,
      })
    }
    if (nextLineSlot(module.slots, 'body')) {
      options.push({
        id: 'body',
        label: copy.addBodyBlock,
        description: copy.addBodyBlockDesc,
        icon: <TreeTextIcon />,
      })
    }
    if (nextLineSlot(module.slots, 'accents')) {
      options.push({
        id: 'accents',
        label: copy.addAccentsBlock,
        description: copy.addAccentsBlockDesc,
        icon: <TreeTextIcon />,
      })
    }
    if (nextLineSlot(module.slots, 'buttons')) {
      options.push({
        id: 'buttons',
        label: copy.addButtonsBlock,
        description: copy.addButtonsBlockDesc,
        icon: <TreeButtonIcon />,
      })
    }
    if (nextLineSlot(module.slots, 'image')) {
      options.push({
        id: 'image',
        label: copy.addImageBlock,
        description: copy.addImageBlockDesc,
        icon: <TreePhotoIcon />,
      })
    }
    return options
  }

  const buildModuleNode = (module: HeroModule): StructureTreeNode => {
    const title = module.name.trim() || defaultModuleTitle(module, copy)
    if (module.kind === 'intro') {
      return {
        id: module.id,
        title,
        description: moduleDesc(module, copy),
        icon: moduleIcon(module),
        enabled: module.enabled,
        showToggle: true,
        deletable: true,
        addLabel: copy.addBlock,
        addOptions: introAddOptions(module),
        children: module.slots.map((slot) => introSlotNode(module, slot)),
      }
    }

    if (module.kind === 'scroll') {
      const addOptions = module.slots.includes('label')
        ? []
        : [
            {
              id: 'label',
              label: copy.addScrollLabel,
              description: copy.addScrollLabelDesc,
              icon: <TreeTextIcon />,
            },
          ]
      return {
        id: module.id,
        title,
        description: moduleDesc(module, copy),
        icon: moduleIcon(module),
        enabled: module.enabled,
        showToggle: true,
        deletable: true,
        addLabel: copy.addBlock,
        addOptions,
        children: module.slots.includes('label')
          ? [
              {
                id: treeChildId(module.id, 'label'),
                title: copy.scrollLabel,
                icon: <TreeTextIcon />,
                enabled: module.visible.label,
                showToggle: true,
                deletable: true,
              },
            ]
          : [],
      }
    }

    return {
      id: module.id,
      title,
      description: moduleDesc(module, copy),
      icon: moduleIcon(module),
      enabled: module.enabled,
      showToggle: true,
      deletable: true,
      addLabel: copy.addBlock,
      addOptions: lineAddOptions(module),
      children: module.slots.map((slot) => lineSlotNode(module, slot)),
    }
  }

  const removeIntroSlot = (module: IntroModule, slot: IntroSlotId) => {
    const slots = module.slots.filter((item) => item !== slot)
    if (slot === 'photo') {
      replaceModule({ ...module, slots, showAvatar: false })
      return
    }
    const keyMap = {
      title1: 'titleLine1',
      title2: 'titleLine2',
      sub1: 'subtitleLine1',
      sub2: 'subtitleLine2',
    } as const
    const key = keyMap[slot]
    replaceModule({
      ...module,
      slots,
      visible: { ...module.visible, [key]: false },
    })
  }

  const addIntroSlot = (
    module: IntroModule,
    kind: 'photo' | 'title' | 'subtitle',
  ) => {
    const slot = nextIntroSlot(module.slots, kind)
    if (!slot) return
    const slots = [...module.slots, slot]
    if (slot === 'photo') {
      replaceModule({ ...module, slots, showAvatar: true })
      onEditingIdChange(treeChildId(module.id, slot))
      return
    }
    const keyMap = {
      title1: 'titleLine1',
      title2: 'titleLine2',
      sub1: 'subtitleLine1',
      sub2: 'subtitleLine2',
    } as const
    replaceModule({
      ...module,
      slots,
      visible: { ...module.visible, [keyMap[slot]]: true },
    })
    onEditingIdChange(treeChildId(module.id, slot))
  }

  const removeLineSlot = (module: LineModule, slot: LineSlotId) => {
    const slots = module.slots.filter((item) => item !== slot)
    if (slot === 'title1') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, titleLine1: false },
      })
    } else if (slot === 'title2') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, titleLine2: false },
      })
    } else if (slot === 'body') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, body: false },
      })
    } else if (slot === 'buttons') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, cta: false },
      })
    } else if (slot === 'image') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, image: false },
      })
    } else {
      replaceModule({ ...module, slots })
    }
  }

  const addLineSlotKind = (
    module: LineModule,
    kind: LineSlotId | 'title',
  ) => {
    const slot = nextLineSlot(module.slots, kind)
    if (!slot) return
    const slots = [...module.slots, slot]
    if (slot === 'title1') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, titleLine1: true },
      })
    } else if (slot === 'title2') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, titleLine2: true },
      })
    } else if (slot === 'body') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, body: true },
      })
    } else if (slot === 'buttons') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, cta: true },
      })
    } else if (slot === 'image') {
      replaceModule({
        ...module,
        slots,
        visible: { ...module.visible, image: true },
      })
    } else {
      replaceModule({ ...module, slots })
    }
    onEditingIdChange(treeChildId(module.id, slot))
  }

  if (pane === 'structure') {
    const tree: StructureTreeNode[] = [
      {
        id: HERO_ROOT_ID,
        title: copy.heroRootTitle,
        description: copy.heroRootDesc,
        icon: <TreeHeaderIcon />,
        draggable: false,
        addLabel: copy.addBlock,
        addOptions: [
          {
            id: 'intro',
            label: copy.addIntro,
            description: copy.addIntroDesc,
            icon: <TreePhotoIcon />,
          },
          {
            id: 'line',
            label: copy.addLine,
            description: copy.addLineDesc,
            icon: <TreeTextIcon />,
          },
          {
            id: 'scroll',
            label: copy.addScroll,
            description: copy.addScrollDesc,
            icon: <TreeScrollIcon />,
          },
        ],
        children: heroData.modules.map(buildModuleNode),
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
            <h2>{copy.heroModulesTitle}</h2>
            <p className="admin__lead">{copy.heroModulesLead}</p>
          </div>
        </div>

        <StructureTree
          nodes={tree}
          selectedId={editingId}
          onSelect={onEditingIdChange}
          onToggleEnabled={(id, enabled) => {
            const root = treeRootId(id)
            const module = heroData.modules.find((item) => item.id === root)
            if (!module) return
            const child = treeParts(id)

            if (child.length === 0) {
              setModuleEnabled(id, enabled)
              return
            }

            if (module.kind === 'intro') {
              if (child[0] === 'photo') {
                replaceModule({ ...module, showAvatar: enabled })
                return
              }
              const keyMap = {
                title1: 'titleLine1',
                title2: 'titleLine2',
                sub1: 'subtitleLine1',
                sub2: 'subtitleLine2',
              } as const
              const key = keyMap[child[0] as keyof typeof keyMap]
              if (key) {
                replaceModule({
                  ...module,
                  visible: { ...module.visible, [key]: enabled },
                })
              }
              return
            }

            if (module.kind === 'scroll' && child[0] === 'label') {
              replaceModule({
                ...module,
                visible: { ...module.visible, label: enabled },
              })
              return
            }

            if (module.kind === 'line') {
              if (child[0] === 'title1') {
                replaceModule({
                  ...module,
                  visible: { ...module.visible, titleLine1: enabled },
                })
              } else if (child[0] === 'title2') {
                replaceModule({
                  ...module,
                  visible: { ...module.visible, titleLine2: enabled },
                })
              } else if (child[0] === 'body') {
                replaceModule({
                  ...module,
                  visible: { ...module.visible, body: enabled },
                })
              } else if (child[0] === 'buttons') {
                replaceModule({
                  ...module,
                  visible: { ...module.visible, cta: enabled },
                })
              } else if (child[0] === 'image') {
                replaceModule({
                  ...module,
                  visible: { ...module.visible, image: enabled },
                })
              }
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
            const module = heroData.modules.find((item) => item.id === root)
            if (!module) return
            if (module.kind === 'line' && partsOf[0] === 'btn' && partsOf[1]) {
              setPendingButtonId(partsOf[1])
              return
            }
            if (module.kind === 'intro' && partsOf[0]) {
              removeIntroSlot(module, partsOf[0] as IntroSlotId)
              if (editingId === id) onEditingIdChange(module.id)
              return
            }
            if (module.kind === 'line' && partsOf[0]) {
              removeLineSlot(module, partsOf[0] as LineSlotId)
              if (editingId === id || editingId?.startsWith(`${id}::`)) {
                onEditingIdChange(module.id)
              }
              return
            }
            if (module.kind === 'scroll' && partsOf[0] === 'label') {
              replaceModule({
                ...module,
                slots: [] as ScrollSlotId[],
                visible: { ...module.visible, label: false },
              })
              if (editingId === id) onEditingIdChange(module.id)
            }
          }}
          onAddOption={(parentId, optionId) => {
            if (parentId === HERO_ROOT_ID) {
              if (optionId === 'intro') addModule(createBlankIntroModule())
              else if (optionId === 'line') addModule(createLineModule())
              else if (optionId === 'scroll') addModule(createScrollModule())
              return
            }
            const root = treeRootId(parentId)
            const module = heroData.modules.find((item) => item.id === root)
            if (!module) return

            if (module.kind === 'intro') {
              if (
                optionId === 'photo' ||
                optionId === 'title' ||
                optionId === 'subtitle'
              ) {
                addIntroSlot(module, optionId)
              }
              return
            }

            if (module.kind === 'scroll' && optionId === 'label') {
              replaceModule({
                ...module,
                slots: ['label'],
                visible: { ...module.visible, label: true },
              })
              onEditingIdChange(treeChildId(module.id, 'label'))
              return
            }

            if (module.kind === 'line') {
              if (treeParts(parentId)[0] === 'buttons' && optionId === 'button') {
                const button = createLineButton()
                replaceModule({
                  ...module,
                  buttons: [...module.buttons, button],
                  visible: { ...module.visible, cta: true },
                })
                onEditingIdChange(treeChildId(module.id, 'btn', button.id))
                return
              }
              if (
                optionId === 'title' ||
                optionId === 'body' ||
                optionId === 'accents' ||
                optionId === 'buttons' ||
                optionId === 'image'
              ) {
                addLineSlotKind(module, optionId)
              }
            }
          }}
          onReorder={(parentId, orderedIds) => {
            if (parentId === HERO_ROOT_ID) {
              onChange({
                ...heroData,
                modules: orderListByIds(heroData.modules, orderedIds),
              })
              return
            }
            const root = treeRootId(parentId)
            const module = heroData.modules.find((item) => item.id === root)
            if (!module) return
            if (module.kind === 'line' && treeParts(parentId)[0] === 'buttons') {
              const buttonIds = orderedIds
                .map((id) => treeParts(id)[1])
                .filter(Boolean)
              replaceModule({
                ...module,
                buttons: orderListByIds(module.buttons, buttonIds),
              })
              return
            }
            if (module.kind === 'intro' && parentId === module.id) {
              const slots = orderedIds
                .map((id) => treeParts(id)[0])
                .filter((slot): slot is IntroSlotId =>
                  Boolean(slot && module.slots.includes(slot as IntroSlotId)),
                )
              replaceModule({ ...module, slots })
              return
            }
            if (module.kind === 'line' && parentId === module.id) {
              const slots = orderedIds
                .map((id) => treeParts(id)[0])
                .filter((slot): slot is LineSlotId =>
                  Boolean(slot && module.slots.includes(slot as LineSlotId)),
                )
              replaceModule({ ...module, slots })
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
        {pendingButtonId ? (
          <ConfirmDialog
            title={copy.removeButtonTitle}
            description={copy.removeButtonDesc}
            confirmLabel={copy.confirmRemove}
            onCancel={() => setPendingButtonId(null)}
            onConfirm={() => {
              const module = heroData.modules.find(
                (item) =>
                  item.kind === 'line' &&
                  item.buttons.some((button) => button.id === pendingButtonId),
              )
              if (module?.kind === 'line') {
                replaceModule({
                  ...module,
                  buttons: module.buttons.filter(
                    (item) => item.id !== pendingButtonId,
                  ),
                })
              }
              setPendingButtonId(null)
            }}
          />
        ) : null}
      </div>
    )
  }

  if (editingId === HERO_ROOT_ID) {
    return (
      <InspectorShell
        title={copy.heroRootTitle}
        lead={copy.heroRootDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <p className="admin__lead">{copy.heroModulesLead}</p>
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

  if (editing.kind === 'intro') {
    return (
      <IntroInspector
        module={editing}
        parts={parts}
        tab={tab}
        onTab={setTab}
        onChange={replaceModule}
        onClose={() => onEditingIdChange(null)}
        onDelete={() => setPendingRemoveId(editing.id)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        deleteDialog={deleteDialog}
      />
    )
  }

  if (editing.kind === 'scroll') {
    return (
      <ScrollInspector
        module={editing}
        parts={parts}
        tab={tab}
        onTab={setTab}
        onChange={replaceModule}
        onClose={() => onEditingIdChange(null)}
        onDelete={() => setPendingRemoveId(editing.id)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        deleteDialog={deleteDialog}
      />
    )
  }

  return (
    <LineInspector
      module={editing}
      parts={parts}
      tab={tab}
      onTab={setTab}
      onChange={replaceModule}
      onClose={() => onEditingIdChange(null)}
      onDelete={() => setPendingRemoveId(editing.id)}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
      deleteDialog={deleteDialog}
      pendingAccent={pendingAccent}
      setPendingAccent={setPendingAccent}
      pendingButtonId={pendingButtonId}
      setPendingButtonId={setPendingButtonId}
    />
  )
}

function IntroInspector({
  module,
  parts,
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
}: {
  module: IntroModule
  parts: string[]
  tab: Locale
  onTab: (locale: Locale) => void
  onChange: (next: IntroModule) => void
  onClose: () => void
  onDelete: () => void
  saveLabel: string
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  deleteDialog: React.ReactNode
}) {
  const copy = adminCopy.dashboard
  const current = module.copy[tab]
  const patchCopy = (partial: Partial<typeof current>) => {
    onChange({
      ...module,
      copy: { ...module.copy, [tab]: { ...current, ...partial } },
    })
  }

  if (parts[0] === 'photo') {
    return (
      <InspectorShell
        title={copy.introPhotoTitle}
        lead={copy.introPhotoDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
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
        <MediaPickerField
          urls={module.gallery}
          onChange={(gallery) => onChange({ ...module, gallery })}
        />
      </InspectorShell>
    )
  }

  const textField =
    parts[0] === 'title1'
      ? ({
          label: copy.titleLine1,
          showKey: 'titleLine1' as const,
          styleKey: 'titleLine1' as const,
          value: current.titleLine1,
          setValue: (titleLine1: string) => patchCopy({ titleLine1 }),
        })
      : parts[0] === 'title2'
        ? ({
            label: copy.titleLine2,
            showKey: 'titleLine2' as const,
            styleKey: 'titleLine2' as const,
            value: current.titleLine2,
            setValue: (titleLine2: string) => patchCopy({ titleLine2 }),
          })
        : parts[0] === 'sub1'
          ? ({
              label: copy.subtitleLine1,
              showKey: 'subtitleLine1' as const,
              styleKey: 'subtitleLine1' as const,
              value: current.subtitleLine1,
              setValue: (subtitleLine1: string) => patchCopy({ subtitleLine1 }),
            })
          : parts[0] === 'sub2'
            ? ({
                label: copy.subtitleLine2,
                showKey: 'subtitleLine2' as const,
                styleKey: 'subtitleLine2' as const,
                value: current.subtitleLine2,
                setValue: (subtitleLine2: string) => patchCopy({ subtitleLine2 }),
              })
            : null

  if (textField) {
    return (
      <InspectorShell
        title={textField.label}
        lead={copy.introTextsDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={textField.label}
          show={module.visible[textField.showKey]}
          onShow={(value) =>
            onChange({
              ...module,
              visible: { ...module.visible, [textField.showKey]: value },
            })
          }
          textStyle={module.textStyles[textField.styleKey]}
          onTextStyle={(style) =>
            onChange({
              ...module,
              textStyles: { ...module.textStyles, [textField.styleKey]: style },
            })
          }
        >
          <input
            className="admin__input"
            value={textField.value}
            onChange={(event) => textField.setValue(event.target.value)}
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  return (
    <InspectorShell
      titleNode={
        <EditableTitle
          value={module.name}
          fallback={copy.introModuleTitle}
          onChange={(name) => onChange({ ...module, name })}
        />
      }
      lead={copy.introGlobalsDesc}
      onClose={onClose}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
      onDelete={onDelete}
      deleteDialog={deleteDialog}
    >
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
        <span>
          {copy.textAlign} ({copy.alignMobile})
        </span>
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
    </InspectorShell>
  )
}

function ScrollInspector({
  module,
  parts,
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
}: {
  module: ScrollModule
  parts: string[]
  tab: Locale
  onTab: (locale: Locale) => void
  onChange: (next: ScrollModule) => void
  onClose: () => void
  onDelete: () => void
  saveLabel: string
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  deleteDialog: React.ReactNode
}) {
  const copy = adminCopy.dashboard

  if (parts[0] === 'label') {
    return (
      <InspectorShell
        title={copy.scrollLabel}
        lead={copy.scrollModuleDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={copy.scrollLabel}
          show={module.visible.label}
          onShow={(label) =>
            onChange({ ...module, visible: { ...module.visible, label } })
          }
          textStyle={module.labelStyle}
          onTextStyle={(labelStyle) => onChange({ ...module, labelStyle })}
        >
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
        </FieldWithShow>
      </InspectorShell>
    )
  }

  return (
    <InspectorShell
      titleNode={
        <EditableTitle
          value={module.name}
          fallback={copy.scrollModuleTitle}
          onChange={(name) => onChange({ ...module, name })}
        />
      }
      lead={copy.scrollGlobalsDesc}
      onClose={onClose}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
      onDelete={onDelete}
      deleteDialog={deleteDialog}
    >
      <label className="admin__check">
        <input
          type="checkbox"
          checked={module.visible.line}
          onChange={(event) =>
            onChange({
              ...module,
              visible: { ...module.visible, line: event.target.checked },
            })
          }
        />
        {copy.showScrollLine}
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
    </InspectorShell>
  )
}

function LineInspector({
  module,
  parts,
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
  pendingAccent,
  setPendingAccent,
  pendingButtonId,
  setPendingButtonId,
}: {
  module: LineModule
  parts: string[]
  tab: Locale
  onTab: (locale: Locale) => void
  onChange: (next: LineModule) => void
  onClose: () => void
  onDelete: () => void
  saveLabel: string
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  deleteDialog: React.ReactNode
  pendingAccent: number | null
  setPendingAccent: (value: number | null) => void
  pendingButtonId: string | null
  setPendingButtonId: (value: string | null) => void
}) {
  const copy = adminCopy.dashboard
  const accentWords = module.accents[tab] ?? []
  const buttons = module.buttons ?? []
  const buttonId = parts[0] === 'btn' ? parts[1] : null
  const button = buttonId
    ? buttons.find((item) => item.id === buttonId)
    : undefined

  if (parts[0] === 'title1' || parts[0] === 'title2') {
    const lineIndex = parts[0] === 'title1' ? 0 : 1
    const showKey = parts[0] === 'title1' ? 'titleLine1' : 'titleLine2'
    const styleKey = showKey
    const label = parts[0] === 'title1' ? copy.titleLine1 : copy.titleLine2
    return (
      <InspectorShell
        title={label}
        lead={copy.lineModuleDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={label}
          show={module.visible[showKey]}
          onShow={(value) =>
            onChange({
              ...module,
              visible: { ...module.visible, [showKey]: value },
            })
          }
          textStyle={module.textStyles[styleKey]}
          onTextStyle={(style) =>
            onChange({
              ...module,
              textStyles: { ...module.textStyles, [styleKey]: style },
            })
          }
        >
          <input
            className="admin__input"
            value={module.title[tab][lineIndex]}
            onChange={(event) => {
              const next: [string, string] = [...module.title[tab]]
              next[lineIndex] = event.target.value
              onChange({
                ...module,
                title: { ...module.title, [tab]: next },
              })
            }}
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (parts[0] === 'body') {
    return (
      <InspectorShell
        title={copy.blockDescription}
        lead={copy.lineModuleDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
      >
        <FieldWithShow
          label={copy.blockDescription}
          show={module.visible.body}
          onShow={(body) =>
            onChange({ ...module, visible: { ...module.visible, body } })
          }
          textStyle={module.textStyles.body}
          onTextStyle={(body) =>
            onChange({
              ...module,
              textStyles: { ...module.textStyles, body },
            })
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
      </InspectorShell>
    )
  }

  if (parts[0] === 'accents') {
    return (
      <InspectorShell
        title={copy.lineAccentsTitle}
        lead={copy.lineAccentsDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={onTab}
        deleteDialog={
          pendingAccent !== null ? (
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
          ) : null
        }
      >
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
        deleteDialog={
          pendingButtonId ? (
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
                onClose()
              }}
            />
          ) : null
        }
      >
        <FieldWithShow
          label={copy.blockButton}
          show
          onShow={() => {}}
          hideToggle
          textStyle={button.labelStyle}
          onTextStyle={(labelStyle) =>
            onChange({
              ...module,
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
                ...module,
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
          value={button.style}
          onChange={(style) =>
            onChange({
              ...module,
              buttons: buttons.map((item) =>
                item.id === button.id ? { ...item, style } : item,
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
              ...module,
              buttons: buttons.map((item) =>
                item.id === button.id ? { ...item, to: nextTo } : item,
              ),
            })
          }}
        />
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
      </InspectorShell>
    )
  }

  if (parts[0] === 'buttons') {
    return (
      <InspectorShell
        title={copy.lineButtonsTitle}
        lead={copy.lineButtonsDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={module.visible.cta}
            onChange={(event) =>
              onChange({
                ...module,
                visible: { ...module.visible, cta: event.target.checked },
              })
            }
          />
          {copy.showButtons}
        </label>
        <p className="admin__lead">{copy.lineButtonsDesc}</p>
      </InspectorShell>
    )
  }

  if (parts[0] === 'image') {
    return (
      <InspectorShell
        title={copy.lineImageTitle}
        lead={copy.lineImageDesc}
        onClose={onClose}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <FieldWithShow
          label={copy.galleryTitle}
          show={module.visible.image}
          onShow={(image) =>
            onChange({ ...module, visible: { ...module.visible, image } })
          }
        >
          {module.visible.image ? (
            <MediaPickerField
              urls={module.gallery}
              onChange={(gallery) => onChange({ ...module, gallery })}
            />
          ) : (
            <p className="admin__gallery-empty">{copy.imageOffHint}</p>
          )}
        </FieldWithShow>
      </InspectorShell>
    )
  }

  return (
    <InspectorShell
      titleNode={
        <EditableTitle
          value={module.name}
          fallback={copy.lineModuleTitle}
          onChange={(name) => onChange({ ...module, name })}
        />
      }
      lead={copy.lineModuleDesc}
      onClose={onClose}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
      onDelete={onDelete}
      deleteDialog={deleteDialog}
    >
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
    </InspectorShell>
  )
}
