import { useState, type ReactNode } from 'react'
import {
  CHROME_BLOCK_IDS,
  createRainWord,
  defaultFabStyle,
  type ChromeBlockId,
  type CmsChromePayload,
  type FabStyle,
  type SiteLocale,
} from '../cms/chrome-content'
import { STYLE_SIZES, type StyleSize } from '../cms/style-tokens'
import { adminCopy } from './admin-copy'
import ButtonStyleControls from './button-style-controls'
import ColorField from './color-field'
import ConfirmDialog from './confirm-dialog'
import EditableTitle from './editable-title'
import IconSelect from './icon-select'
import {
  ChevronLeftIcon,
  TreeButtonIcon,
  TreeHeaderIcon,
  TreeLinkIcon,
  TreeMenuIcon,
  TreeScrollIcon,
  TreeTextIcon,
} from './icons'
import InspectorShell from './inspector-shell'
import MediaPickerField from './media-picker'
import SizePresetControls from './size-preset-controls'
import StructureTree, { type StructureTreeNode } from './structure-tree'
import { orderListByIds } from './structure-block'
import StyledTextField from './styled-text-field'
import { treeChildId, treeParts, treeRootId } from './tree-path'

const FAB_BORDER_WIDTH: Record<StyleSize, number> = {
  sm: 0,
  md: 1,
  lg: 3,
}

const FAB_RADIUS: Record<StyleSize, number> = {
  sm: 4,
  md: 8,
  lg: 20,
}

function nearestFabSize(
  px: number,
  map: Record<StyleSize, number>,
): StyleSize {
  let best: StyleSize = 'md'
  let bestDiff = Number.POSITIVE_INFINITY
  for (const size of STYLE_SIZES) {
    const diff = Math.abs(map[size] - px)
    if (diff < bestDiff) {
      best = size
      bestDiff = diff
    }
  }
  return best
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type EditorPane = 'structure' | 'inspector'

const CHROME_ROOT = 'chrome'

type ChromeEditorProps = {
  pane: EditorPane
  chromeData: CmsChromePayload
  onChange: (next: CmsChromePayload) => void
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  onBack: () => void
  editingId: string | null
  onEditingIdChange: (id: string | null) => void
  onOpenGate?: () => void
}

const BLOCKS: {
  id: Exclude<ChromeBlockId, 'rain'>
  titleKey: 'chromeBackTopTitle' | 'chromeNewsTitle' | 'chromeLangTitle' | 'chromeThemeTitle'
  descKey: 'chromeBackTopDesc' | 'chromeNewsDesc' | 'chromeLangDesc' | 'chromeThemeDesc'
  flag: 'showBackToTop' | 'showNewsFab' | 'showLanguage' | 'showTheme'
  fabKey?: 'backToTop' | 'newsFab' | 'themeFab'
  icon: 'backTop' | 'news' | 'language' | 'theme'
}[] = [
  {
    id: 'backTop',
    titleKey: 'chromeBackTopTitle',
    descKey: 'chromeBackTopDesc',
    flag: 'showBackToTop',
    fabKey: 'backToTop',
    icon: 'backTop',
  },
  {
    id: 'news',
    titleKey: 'chromeNewsTitle',
    descKey: 'chromeNewsDesc',
    flag: 'showNewsFab',
    fabKey: 'newsFab',
    icon: 'news',
  },
  {
    id: 'language',
    titleKey: 'chromeLangTitle',
    descKey: 'chromeLangDesc',
    flag: 'showLanguage',
    icon: 'language',
  },
  {
    id: 'theme',
    titleKey: 'chromeThemeTitle',
    descKey: 'chromeThemeDesc',
    flag: 'showTheme',
    fabKey: 'themeFab',
    icon: 'theme',
  },
]

function blockIcon(kind: (typeof BLOCKS)[number]['icon']) {
  if (kind === 'backTop') return <TreeButtonIcon />
  if (kind === 'news') return <TreeMenuIcon />
  if (kind === 'language') return <TreeTextIcon />
  return <TreeLinkIcon />
}

function FabStyleFields({
  value,
  onChange,
}: {
  value: FabStyle
  onChange: (next: FabStyle) => void
}) {
  const copy = adminCopy.dashboard
  return (
    <>
      <IconSelect
        label={copy.fabIcon}
        value={value.iconId}
        onChange={(iconId) => onChange({ ...value, iconId })}
      />
      <ColorField
        label={copy.fabIconColor}
        value={value.iconColor}
        onChange={(iconColor) => onChange({ ...value, iconColor })}
      />
      <ColorField
        label={copy.fabBg}
        value={value.background}
        onChange={(background) => onChange({ ...value, background })}
      />
      <ColorField
        label={copy.fabBorder}
        value={value.borderColor}
        onChange={(borderColor) => onChange({ ...value, borderColor })}
      />
      <SizePresetControls
        label={copy.fabBorderWidth}
        value={nearestFabSize(value.borderWidth, FAB_BORDER_WIDTH)}
        onChange={(size) =>
          onChange({ ...value, borderWidth: FAB_BORDER_WIDTH[size] })
        }
      />
      <SizePresetControls
        label={copy.fabRadius}
        value={nearestFabSize(value.borderRadius, FAB_RADIUS)}
        onChange={(size) =>
          onChange({ ...value, borderRadius: FAB_RADIUS[size] })
        }
      />
    </>
  )
}

export default function ChromeEditor({
  pane,
  chromeData,
  onChange,
  saveStatus,
  isDirty,
  onSave,
  onBack,
  editingId,
  onEditingIdChange,
  onOpenGate,
}: ChromeEditorProps) {
  const copy = adminCopy.dashboard
  const [pendingLocaleCode, setPendingLocaleCode] = useState<string | null>(null)

  const saveLabel =
    saveStatus === 'success'
      ? copy.published
      : saveStatus === 'saving'
        ? copy.publishing
        : copy.publishChrome

  const rootId = treeRootId(editingId)
  const parts = treeParts(editingId)
  const editingBlock =
    rootId &&
    rootId !== 'rain' &&
    chromeData.blocksOrder.includes(rootId as ChromeBlockId)
      ? BLOCKS.find((block) => block.id === rootId)
      : undefined
  const editingRain = rootId === 'rain' && parts.length === 0
  const rainWordId = rootId === 'rain' && parts[0] ? parts[0] : null
  const editingRainWord = rainWordId
    ? chromeData.rain.words.find((word) => word.id === rainWordId)
    : undefined
  const localeCode =
    rootId === 'language' && parts[0] ? parts[0] : null
  const editingLocale = localeCode
    ? chromeData.locales.find((item) => item.code === localeCode)
    : undefined

  const updateFab = (key: 'backToTop' | 'newsFab' | 'themeFab', next: FabStyle) => {
    onChange({ ...chromeData, [key]: next })
  }

  const updateLocale = (code: string, patch: Partial<SiteLocale>) => {
    onChange({
      ...chromeData,
      locales: chromeData.locales.map((item) =>
        item.code === code ? { ...item, ...patch } : item,
      ),
    })
  }

  const addLocale = () => {
    const code = `lang${chromeData.locales.length + 1}`
    onChange({
      ...chromeData,
      locales: [
        ...chromeData.locales,
        {
          code,
          label: code.toUpperCase(),
          flagEmoji: '🏳️',
          imageUrl: '',
          enabled: true,
          labelStyle: { size: 'md', color: '' },
        },
      ],
    })
    onEditingIdChange(treeChildId('language', code))
  }

  const deleteLocaleDialog = pendingLocaleCode ? (
    <ConfirmDialog
      title={copy.deleteLocaleTitle}
      description={copy.deleteLocaleDesc}
      confirmLabel={copy.confirmDelete}
      onCancel={() => setPendingLocaleCode(null)}
      onConfirm={() => {
        onChange({
          ...chromeData,
          locales: chromeData.locales.filter(
            (item) => item.code !== pendingLocaleCode,
          ),
        })
        if (
          editingId &&
          treeRootId(editingId) === 'language' &&
          treeParts(editingId)[0] === pendingLocaleCode
        ) {
          onEditingIdChange(null)
        }
        setPendingLocaleCode(null)
      }}
    />
  ) : null

  if (pane === 'structure') {
    const blockById = Object.fromEntries(
      BLOCKS.map((block) => [block.id, block]),
    ) as Record<Exclude<ChromeBlockId, 'rain'>, (typeof BLOCKS)[number]>

    const buildBlockNode = (blockId: ChromeBlockId): StructureTreeNode => {
      if (blockId === 'rain') {
        return {
          id: 'rain',
          title: copy.chromeRainTitle,
          description: copy.chromeRainDesc,
          icon: <TreeScrollIcon />,
          enabled: chromeData.rain.enabled,
          showToggle: true,
          deletable: true,
          addLabel: copy.addBlock,
          addOptions: [
            {
              id: 'word',
              label: copy.addRainWord,
              description: copy.addRainWordDesc,
              icon: <TreeTextIcon />,
            },
          ],
          children: chromeData.rain.words.map((word) => ({
            id: treeChildId('rain', word.id),
            title: word.text.trim() || copy.chromeRainWordTitle,
            description: copy.chromeRainWordDesc,
            icon: <TreeTextIcon />,
            enabled: word.enabled,
            showToggle: true,
            deletable: true,
          })),
        }
      }

      const block = blockById[blockId]
      const base: StructureTreeNode = {
        id: block.id,
        title: copy[block.titleKey],
        description: copy[block.descKey],
        icon: blockIcon(block.icon),
        enabled: chromeData[block.flag],
        showToggle: true,
        deletable: true,
      }

      if (block.id !== 'language') return base

      return {
        ...base,
        addLabel: copy.addBlock,
        addOptions: [
          {
            id: 'locale',
            label: copy.addLocale,
            description: copy.addLocaleDesc,
            icon: <TreeTextIcon />,
          },
        ],
        children: chromeData.locales.map((locale) => ({
          id: treeChildId('language', locale.code),
          title: locale.label.trim() || locale.code,
          description: copy.chromeLocaleItemDesc,
          icon: <TreeTextIcon />,
          enabled: locale.enabled,
          showToggle: true,
          deletable: chromeData.locales.length > 1,
        })),
      }
    }

    const orderedBlocks = chromeData.blocksOrder.filter((id) =>
      CHROME_BLOCK_IDS.includes(id),
    )
    const missingBlocks = CHROME_BLOCK_IDS.filter(
      (id) => !orderedBlocks.includes(id),
    )
    const chromeAddOptions = missingBlocks.map((id) => {
      const labels: Record<ChromeBlockId, { label: string; icon: ReactNode }> = {
        backTop: { label: copy.addChromeBackTop, icon: <TreeButtonIcon /> },
        news: { label: copy.addChromeNews, icon: <TreeMenuIcon /> },
        language: { label: copy.addChromeLang, icon: <TreeTextIcon /> },
        theme: { label: copy.addChromeTheme, icon: <TreeLinkIcon /> },
        rain: { label: copy.addChromeRain, icon: <TreeScrollIcon /> },
      }
      return {
        id,
        label: labels[id].label,
        icon: labels[id].icon,
      }
    })

    const tree: StructureTreeNode[] = [
      {
        id: CHROME_ROOT,
        title: chromeData.sectionName.trim() || copy.chromeRootTitle,
        description: copy.chromeRootDesc,
        icon: <TreeHeaderIcon />,
        draggable: false,
        addLabel: copy.addBlock,
        addOptions: chromeAddOptions,
        children: orderedBlocks.map(buildBlockNode),
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
              value={chromeData.sectionName}
              fallback={copy.chromeTitle}
              onChange={(sectionName) => onChange({ ...chromeData, sectionName })}
            />
            <p className="admin__lead">{copy.chromeModulesLead}</p>
          </div>
        </div>

        <StructureTree
          nodes={tree}
          selectedId={editingId}
          onSelect={onEditingIdChange}
          onToggleEnabled={(id, enabled) => {
            if (id === 'rain') {
              onChange({
                ...chromeData,
                rain: { ...chromeData.rain, enabled },
              })
              return
            }
            const block = BLOCKS.find((item) => item.id === id)
            if (block) {
              onChange({ ...chromeData, [block.flag]: enabled })
              return
            }
            if (treeRootId(id) === 'rain') {
              const wordId = treeParts(id)[0]
              if (!wordId) return
              onChange({
                ...chromeData,
                rain: {
                  ...chromeData.rain,
                  words: chromeData.rain.words.map((word) =>
                    word.id === wordId ? { ...word, enabled } : word,
                  ),
                },
              })
              return
            }
            if (treeRootId(id) === 'language') {
              const code = treeParts(id)[0]
              if (code) updateLocale(code, { enabled })
            }
          }}
          onDelete={(id) => {
            if (id === 'rain') {
              onChange({
                ...chromeData,
                blocksOrder: chromeData.blocksOrder.filter(
                  (item) => item !== 'rain',
                ),
                rain: { ...chromeData.rain, enabled: false },
              })
              if (editingId === id || editingId?.startsWith('rain::')) {
                onEditingIdChange(CHROME_ROOT)
              }
              return
            }
            if (CHROME_BLOCK_IDS.includes(id as ChromeBlockId)) {
              const blockId = id as Exclude<ChromeBlockId, 'rain'>
              const block = blockById[blockId]
              onChange({
                ...chromeData,
                blocksOrder: chromeData.blocksOrder.filter(
                  (item) => item !== blockId,
                ),
                [block.flag]: false,
              })
              if (editingId === id || editingId?.startsWith(`${id}::`)) {
                onEditingIdChange(CHROME_ROOT)
              }
              return
            }
            if (treeRootId(id) === 'rain') {
              const wordId = treeParts(id)[0]
              if (!wordId) return
              onChange({
                ...chromeData,
                rain: {
                  ...chromeData.rain,
                  words: chromeData.rain.words.filter(
                    (word) => word.id !== wordId,
                  ),
                },
              })
              if (editingId === id) onEditingIdChange('rain')
              return
            }
            if (treeRootId(id) !== 'language') return
            const code = treeParts(id)[0]
            if (code && chromeData.locales.length > 1) {
              setPendingLocaleCode(code)
            }
          }}
          onAddOption={(parentId, optionId) => {
            if (
              parentId === CHROME_ROOT &&
              CHROME_BLOCK_IDS.includes(optionId as ChromeBlockId)
            ) {
              const blockId = optionId as ChromeBlockId
              if (chromeData.blocksOrder.includes(blockId)) return
              if (blockId === 'rain') {
                onChange({
                  ...chromeData,
                  blocksOrder: [...chromeData.blocksOrder, 'rain'],
                  rain: { ...chromeData.rain, enabled: true },
                })
                onEditingIdChange('rain')
                return
              }
              const block = blockById[blockId]
              onChange({
                ...chromeData,
                blocksOrder: [...chromeData.blocksOrder, blockId],
                [block.flag]: true,
              })
              onEditingIdChange(blockId)
              return
            }
            if (parentId === 'rain' && optionId === 'word') {
              const word = createRainWord(copy.chromeRainWordTitle)
              onChange({
                ...chromeData,
                rain: {
                  ...chromeData.rain,
                  words: [...chromeData.rain.words, word],
                },
              })
              onEditingIdChange(treeChildId('rain', word.id))
              return
            }
            if (parentId === 'language' && optionId === 'locale') {
              addLocale()
            }
          }}
          onReorder={(parentId, orderedIds) => {
            if (parentId === CHROME_ROOT) {
              const next = orderedIds.filter((id): id is ChromeBlockId =>
                chromeData.blocksOrder.includes(id as ChromeBlockId),
              )
              onChange({ ...chromeData, blocksOrder: next })
              return
            }
            if (parentId === 'rain') {
              const wordIds = orderedIds
                .map((id) => treeParts(id)[0])
                .filter(Boolean)
              onChange({
                ...chromeData,
                rain: {
                  ...chromeData.rain,
                  words: orderListByIds(chromeData.rain.words, wordIds),
                },
              })
              return
            }
            if (parentId !== 'language') return
            const codes = orderedIds
              .map((id) => treeParts(id)[0])
              .filter(Boolean)
            const byCode = new Map(
              chromeData.locales.map((locale) => [locale.code, locale]),
            )
            const next = codes
              .map((code) => byCode.get(code))
              .filter((item): item is SiteLocale => Boolean(item))
            if (next.length === chromeData.locales.length) {
              onChange({ ...chromeData, locales: next })
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
        {deleteLocaleDialog}
      </div>
    )
  }

  if (editingId === CHROME_ROOT) {
    return (
      <InspectorShell
        titleNode={
          <EditableTitle
            value={chromeData.sectionName}
            fallback={copy.chromeRootTitle}
            onChange={(sectionName) => onChange({ ...chromeData, sectionName })}
          />
        }
        lead={copy.chromeRootDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <p className="admin__lead">{copy.chromeModulesLead}</p>
      </InspectorShell>
    )
  }

  if (editingRainWord) {
    return (
      <InspectorShell
        title={editingRainWord.text.trim() || copy.chromeRainWordTitle}
        lead={copy.chromeRainWordDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        onDelete={() => {
          onChange({
            ...chromeData,
            rain: {
              ...chromeData.rain,
              words: chromeData.rain.words.filter(
                (word) => word.id !== editingRainWord.id,
              ),
            },
          })
          onEditingIdChange('rain')
        }}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={editingRainWord.enabled}
            onChange={(event) =>
              onChange({
                ...chromeData,
                rain: {
                  ...chromeData.rain,
                  words: chromeData.rain.words.map((word) =>
                    word.id === editingRainWord.id
                      ? { ...word, enabled: event.target.checked }
                      : word,
                  ),
                },
              })
            }
          />
          {copy.showField}
        </label>
        <label className="admin__label">
          {copy.chromeRainWordTitle}
          <input
            className="admin__input"
            type="text"
            value={editingRainWord.text}
            onChange={(event) =>
              onChange({
                ...chromeData,
                rain: {
                  ...chromeData.rain,
                  words: chromeData.rain.words.map((word) =>
                    word.id === editingRainWord.id
                      ? { ...word, text: event.target.value }
                      : word,
                  ),
                },
              })
            }
          />
        </label>
      </InspectorShell>
    )
  }

  if (editingRain) {
    return (
      <InspectorShell
        title={copy.chromeRainTitle}
        lead={copy.chromeRainDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={chromeData.rain.enabled}
            onChange={(event) =>
              onChange({
                ...chromeData,
                rain: { ...chromeData.rain, enabled: event.target.checked },
              })
            }
          />
          {chromeData.rain.enabled ? copy.showBlock : copy.hideBlock}
        </label>
        <ColorField
          label={copy.chromeRainColor}
          value={chromeData.rain.color}
          onChange={(color) =>
            onChange({
              ...chromeData,
              rain: { ...chromeData.rain, color },
            })
          }
        />
      </InspectorShell>
    )
  }

  if (editingLocale) {
    return (
      <InspectorShell
        title={editingLocale.label.trim() || editingLocale.code}
        lead={copy.chromeLocaleItemDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        onDelete={
          chromeData.locales.length > 1
            ? () => setPendingLocaleCode(editingLocale.code)
            : undefined
        }
        deleteDialog={deleteLocaleDialog}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={editingLocale.enabled}
            onChange={(event) =>
              updateLocale(editingLocale.code, {
                enabled: event.target.checked,
              })
            }
          />
          {copy.showField}
        </label>
        <label className="admin__label">
          {copy.langCode}
          <input
            className="admin__input"
            type="text"
            value={editingLocale.code}
            onChange={(event) => {
              const nextCode =
                event.target.value.trim().toLowerCase() || editingLocale.code
              updateLocale(editingLocale.code, { code: nextCode })
              if (nextCode !== editingLocale.code) {
                onEditingIdChange(treeChildId('language', nextCode))
              }
            }}
          />
        </label>
        <StyledTextField
          label={copy.langLabel}
          value={editingLocale.label}
          onChange={(label) => updateLocale(editingLocale.code, { label })}
          textStyle={editingLocale.labelStyle}
          onTextStyle={(labelStyle) =>
            updateLocale(editingLocale.code, { labelStyle })
          }
        />
        {chromeData.languageMode === 'flag' ? (
          <label className="admin__label">
            {copy.langFlag}
            <input
              className="admin__input"
              type="text"
              value={editingLocale.flagEmoji}
              onChange={(event) =>
                updateLocale(editingLocale.code, {
                  flagEmoji: event.target.value,
                })
              }
            />
          </label>
        ) : (
          <MediaPickerField
            label={copy.langImage}
            urls={editingLocale.imageUrl ? [editingLocale.imageUrl] : []}
            folder="locales"
            onChange={(urls) =>
              updateLocale(editingLocale.code, { imageUrl: urls[0] ?? '' })
            }
          />
        )}
      </InspectorShell>
    )
  }

  if (!editingBlock) {
    return (
      <div className="admin__inspector-empty">
        <h2>{copy.inspectorEmptyTitle}</h2>
        <p className="admin__lead">{copy.inspectorEmptyDesc}</p>
      </div>
    )
  }

  const enabled = chromeData[editingBlock.flag]
  const fab =
    editingBlock.fabKey != null
      ? chromeData[editingBlock.fabKey] ?? defaultFabStyle()
      : null

  if (editingBlock.id === 'language') {
    return (
      <InspectorShell
        title={copy[editingBlock.titleKey]}
        lead={copy.chromeLocalesDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <label className="admin__check">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) =>
              onChange({
                ...chromeData,
                [editingBlock.flag]: event.target.checked,
              })
            }
          />
          {enabled ? copy.showBlock : copy.hideBlock}
        </label>
        <span className="admin__label">{copy.langMode}</span>
        <div className="admin-style-sizes">
          <button
            type="button"
            className={`admin__align-btn${
              chromeData.languageMode === 'flag' ? ' admin__align-btn--on' : ''
            }`}
            onClick={() => onChange({ ...chromeData, languageMode: 'flag' })}
          >
            {copy.langModeFlag}
          </button>
          <button
            type="button"
            className={`admin__align-btn${
              chromeData.languageMode === 'image' ? ' admin__align-btn--on' : ''
            }`}
            onClick={() => onChange({ ...chromeData, languageMode: 'image' })}
          >
            {copy.langModeImage}
          </button>
        </div>
      </InspectorShell>
    )
  }

  return (
    <InspectorShell
      title={copy[editingBlock.titleKey]}
      lead={copy[editingBlock.descKey]}
      onClose={() => onEditingIdChange(null)}
      saveLabel={saveLabel}
      saveStatus={saveStatus}
      isDirty={isDirty}
      onSave={onSave}
    >
      <label className="admin__check">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) =>
            onChange({
              ...chromeData,
              [editingBlock.flag]: event.target.checked,
            })
          }
        />
        {enabled ? copy.showBlock : copy.hideBlock}
      </label>

      {editingBlock.id === 'news' && onOpenGate ? (
        <>
          <p className="admin__lead">{copy.editGateFromChromeLead}</p>
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={onOpenGate}
          >
            {copy.editGateFromChrome}
          </button>
        </>
      ) : null}

      {fab && editingBlock.fabKey ? (
        <FabStyleFields
          value={fab}
          onChange={(next) => updateFab(editingBlock.fabKey!, next)}
        />
      ) : null}

      {editingBlock.id === 'theme' ? (
        <ButtonStyleControls
          value={chromeData.sideToolsButton}
          onChange={(sideToolsButton) =>
            onChange({ ...chromeData, sideToolsButton })
          }
        />
      ) : null}
    </InspectorShell>
  )
}
