import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { adminCopy } from './admin-copy'
import {
  ChevronRightIcon,
  DragHandleIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  TrashIcon,
} from './icons'

export type StructureTreeAddOption = {
  id: string
  label: string
  description?: string
  icon?: ReactNode
}

export type StructureTreeNode = {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  enabled?: boolean
  showToggle?: boolean
  deletable?: boolean
  draggable?: boolean
  children?: StructureTreeNode[]
  /** Por padrão fechado */
  defaultExpanded?: boolean
  /** Opções do mini-modal "Adicionar bloco" */
  addOptions?: StructureTreeAddOption[]
  addLabel?: string
}

type StructureTreeProps = {
  nodes: StructureTreeNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleEnabled?: (id: string, enabled: boolean) => void
  onDelete?: (id: string) => void
  onAddOption?: (parentId: string, optionId: string) => void
  /** Reordena irmãos sob o parentId (`null` = raiz) */
  onReorder?: (parentId: string | null, orderedIds: string[]) => void
}

type DragState = {
  parentId: string | null
  id: string
  fromIndex: number
  insertIndex: number
  title: string
  description: string
  icon?: ReactNode
  enabled: boolean
  selected: boolean
  width: number
  height: number
  gap: number
  offsetX: number
  offsetY: number
  x: number
  y: number
}

function selectionBelongsToNode(
  node: StructureTreeNode,
  selectedId: string | null,
): boolean {
  if (!selectedId) return false
  if (node.id === selectedId) return true
  if (selectedId.startsWith(`${node.id}::`)) return true
  return (node.children ?? []).some((child) =>
    selectionBelongsToNode(child, selectedId),
  )
}

function shiftForIndex(
  index: number,
  fromIndex: number,
  insertIndex: number,
  distance: number,
) {
  if (fromIndex === insertIndex) return 0
  if (fromIndex < insertIndex) {
    if (index > fromIndex && index <= insertIndex) return -distance
    return 0
  }
  if (index >= insertIndex && index < fromIndex) return distance
  return 0
}

function layoutMidY(list: HTMLElement, node: HTMLElement) {
  return (
    list.getBoundingClientRect().top -
    list.scrollTop +
    node.offsetTop +
    node.offsetHeight / 2
  )
}

function insertIndexFromPointer(
  clientY: number,
  ids: string[],
  fromIndex: number,
  list: HTMLElement | null,
  itemRefs: Map<string, HTMLElement>,
) {
  if (!list) return fromIndex
  const others = ids
    .map((id, index) => ({ id, index }))
    .filter((entry) => entry.index !== fromIndex)

  let slot = others.length
  for (let i = 0; i < others.length; i += 1) {
    const node = itemRefs.get(others[i].id)
    if (!node) continue
    if (clientY < layoutMidY(list, node)) {
      slot = i
      break
    }
  }
  return slot
}

function AddBlockControl({
  parentId,
  label,
  options,
  onAddOption,
}: {
  parentId: string
  label: string
  options: StructureTreeAddOption[]
  onAddOption: (parentId: string, optionId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (options.length === 0) return null

  return (
    <div className="admin-tree__add" ref={rootRef}>
      <button
        type="button"
        className="admin-tree__add-btn"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <PlusIcon />
        <span>{label}</span>
      </button>
      {open ? (
        <div className="admin-tree__popover" role="menu">
          <div className="admin-tree__popover-head">
            {adminCopy.dashboard.addBlockOthers}
          </div>
          <ul className="admin-tree__popover-list">
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className="admin-tree__popover-item"
                  role="menuitem"
                  onClick={() => {
                    onAddOption(parentId, option.id)
                    setOpen(false)
                  }}
                >
                  {option.icon ? (
                    <span className="admin-tree__type-icon" aria-hidden="true">
                      {option.icon}
                    </span>
                  ) : null}
                  <span>
                    <strong>{option.label}</strong>
                    {option.description ? <em>{option.description}</em> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function TreeNodeRow({
  node,
  parentId,
  index,
  selectedId,
  drag,
  itemRefs,
  onSelect,
  onToggleEnabled,
  onDelete,
  onAddOption,
  onReorder,
  onStartDrag,
}: {
  node: StructureTreeNode
  parentId: string | null
  index: number
  selectedId: string | null
  drag: DragState | null
  itemRefs: React.MutableRefObject<Map<string, HTMLElement>>
  onSelect: (id: string) => void
  onToggleEnabled?: (id: string, enabled: boolean) => void
  onDelete?: (id: string) => void
  onAddOption?: (parentId: string, optionId: string) => void
  onReorder?: (parentId: string | null, orderedIds: string[]) => void
  onStartDrag: (
    event: ReactPointerEvent<HTMLButtonElement>,
    node: StructureTreeNode,
    parentId: string | null,
    index: number,
  ) => void
}) {
  const copy = adminCopy.dashboard
  const childNodes = node.children ?? []
  const addOptions = node.addOptions ?? []
  const canExpand = childNodes.length > 0 || addOptions.length > 0
  const [expanded, setExpanded] = useState(Boolean(node.defaultExpanded))
  const selected = node.id === selectedId
  const hasSelectedDescendant = selectionBelongsToNode(node, selectedId)
  const enabled = node.enabled !== false
  const draggable = node.draggable !== false && Boolean(onReorder)
  const isDragging = drag?.id === node.id && drag.parentId === parentId
  const step = drag && drag.parentId === parentId ? drag.height + drag.gap : 0
  const shift =
    drag && drag.parentId === parentId && !isDragging
      ? shiftForIndex(index, drag.fromIndex, drag.insertIndex, step)
      : 0

  useEffect(() => {
    if (hasSelectedDescendant && canExpand) setExpanded(true)
  }, [hasSelectedDescendant, canExpand, selectedId])

  useEffect(() => {
    if (!selected) return
    const el = itemRefs.current.get(node.id)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selected, itemRefs, node.id])

  return (
    <div
      className={[
        'admin-tree__branch',
        isDragging ? 'admin-tree__branch--dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        drag && drag.parentId === parentId
          ? {
              transform: `translateY(${shift}px)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }
          : undefined
      }
    >
      <div
        ref={(el) => {
          if (el) itemRefs.current.set(node.id, el)
          else itemRefs.current.delete(node.id)
        }}
        className={[
          'admin-tree__row',
          selected ? 'admin-tree__row--on' : '',
          enabled ? '' : 'admin-tree__row--off',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {canExpand ? (
          <button
            type="button"
            className={`admin-tree__caret${expanded ? ' admin-tree__caret--open' : ''}`}
            title={expanded ? 'Recolher' : 'Expandir'}
            aria-label={expanded ? 'Recolher' : 'Expandir'}
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation()
              setExpanded((value) => !value)
            }}
          >
            <ChevronRightIcon />
          </button>
        ) : (
          <span className="admin-tree__caret admin-tree__caret--spacer" aria-hidden="true" />
        )}

        {draggable ? (
          <button
            type="button"
            className="admin-tree__drag"
            title={copy.dragBlock}
            aria-label={copy.dragBlock}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => onStartDrag(event, node, parentId, index)}
          >
            <DragHandleIcon />
          </button>
        ) : (
          <span className="admin-tree__drag admin-tree__drag--static" aria-hidden="true" />
        )}

        {node.icon ? (
          <span className="admin-tree__type-icon" aria-hidden="true">
            {node.icon}
          </span>
        ) : null}

        <button
          type="button"
          className="admin-tree__main"
          onClick={() => {
            onSelect(node.id)
            if (canExpand) setExpanded(true)
          }}
        >
          <span className="admin-tree__title">{node.title}</span>
          {node.description ? (
            <span className="admin-tree__desc">{node.description}</span>
          ) : null}
        </button>

        <div className="admin-tree__tools">
          {node.showToggle && onToggleEnabled ? (
            <button
              type="button"
              className={`admin__tool-btn${enabled ? '' : ' admin__tool-btn--off'}`}
              title={enabled ? copy.hideBlock : copy.showBlock}
              aria-label={enabled ? copy.hideBlock : copy.showBlock}
              aria-pressed={enabled}
              onClick={(event) => {
                event.stopPropagation()
                onToggleEnabled(node.id, !enabled)
              }}
            >
              {enabled ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          ) : null}
          {node.deletable && onDelete ? (
            <button
              type="button"
              className="admin__tool-btn admin__tool-btn--danger"
              title={copy.deleteModule}
              aria-label={copy.deleteModule}
              onClick={(event) => {
                event.stopPropagation()
                onDelete(node.id)
              }}
            >
              <TrashIcon />
            </button>
          ) : null}
        </div>
      </div>

      {expanded && canExpand ? (
        <TreeChildren
          parentId={node.id}
          nodes={childNodes}
          selectedId={selectedId}
          addLabel={node.addLabel}
          addOptions={addOptions}
          onSelect={onSelect}
          onToggleEnabled={onToggleEnabled}
          onDelete={onDelete}
          onAddOption={onAddOption}
          onReorder={onReorder}
        />
      ) : null}
    </div>
  )
}

function TreeChildren({
  parentId,
  nodes,
  selectedId,
  addLabel,
  addOptions,
  onSelect,
  onToggleEnabled,
  onDelete,
  onAddOption,
  onReorder,
}: {
  parentId: string | null
  nodes: StructureTreeNode[]
  selectedId: string | null
  addLabel?: string
  addOptions?: StructureTreeAddOption[]
  onSelect: (id: string) => void
  onToggleEnabled?: (id: string, enabled: boolean) => void
  onDelete?: (id: string) => void
  onAddOption?: (parentId: string, optionId: string) => void
  onReorder?: (parentId: string | null, orderedIds: string[]) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<string, HTMLElement>())
  const nodesRef = useRef(nodes)
  const onReorderRef = useRef(onReorder)
  const dragRef = useRef<DragState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const options = addOptions ?? []

  nodesRef.current = nodes
  onReorderRef.current = onReorder

  useEffect(() => {
    dragRef.current = drag
  }, [drag])

  useEffect(() => {
    if (!drag) return

    const onPointerMove = (event: PointerEvent) => {
      const current = dragRef.current
      if (!current) return
      const insertIndex = insertIndexFromPointer(
        event.clientY,
        nodesRef.current.map((node) => node.id),
        current.fromIndex,
        listRef.current,
        itemRefs.current,
      )
      const next: DragState = {
        ...current,
        insertIndex,
        x: event.clientX - current.offsetX,
        y: event.clientY - current.offsetY,
      }
      dragRef.current = next
      setDrag(next)
    }

    const finish = () => {
      const current = dragRef.current
      if (current && onReorderRef.current) {
        const ids = nodesRef.current.map((node) => node.id)
        const [moved] = ids.splice(current.fromIndex, 1)
        ids.splice(current.insertIndex, 0, moved)
        onReorderRef.current(current.parentId, ids)
      }
      dragRef.current = null
      setDrag(null)
    }

    const cancel = () => {
      dragRef.current = null
      setDrag(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', cancel)
    }
  }, [drag?.id, drag?.parentId])

  const onStartDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    node: StructureTreeNode,
    dragParentId: string | null,
    index: number,
  ) => {
    if (node.draggable === false || !onReorder) return
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()

    const wrap = itemRefs.current.get(node.id)
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const styles = listRef.current ? getComputedStyle(listRef.current) : null
    const gap = styles
      ? Number.parseFloat(styles.rowGap || styles.gap || '4')
      : 4

    const next: DragState = {
      parentId: dragParentId,
      id: node.id,
      fromIndex: index,
      insertIndex: index,
      title: node.title,
      description: node.description ?? '',
      icon: node.icon,
      enabled: node.enabled !== false,
      selected: node.id === selectedId,
      width: rect.width,
      height: rect.height,
      gap: Number.isFinite(gap) ? gap : 4,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      x: rect.left,
      y: rect.top,
    }
    dragRef.current = next
    setDrag(next)
  }

  return (
    <>
      <div
        ref={listRef}
        className={`admin-tree__children${drag ? ' admin-tree__children--dragging' : ''}`}
      >
        {nodes.map((node, index) => (
          <TreeNodeRow
            key={node.id}
            node={node}
            parentId={parentId}
            index={index}
            selectedId={selectedId}
            drag={drag}
            itemRefs={itemRefs}
            onSelect={onSelect}
            onToggleEnabled={onToggleEnabled}
            onDelete={onDelete}
            onAddOption={onAddOption}
            onReorder={onReorder}
            onStartDrag={onStartDrag}
          />
        ))}
        {parentId && options.length > 0 && onAddOption ? (
          <AddBlockControl
            parentId={parentId}
            label={addLabel || adminCopy.dashboard.addBlock}
            options={options}
            onAddOption={onAddOption}
          />
        ) : null}
      </div>

      {drag && drag.parentId === parentId
        ? createPortal(
            <div
              className={[
                'admin-tree__ghost',
                drag.selected ? 'admin-tree__ghost--on' : '',
                drag.enabled ? '' : 'admin-tree__ghost--off',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                width: drag.width,
                height: drag.height,
                transform: `translate3d(${drag.x}px, ${drag.y}px, 0) scale(1.03)`,
              }}
            >
              <div className="admin-tree__row admin-tree__row--ghost">
                <span className="admin-tree__caret admin-tree__caret--spacer" />
                <span className="admin-tree__drag admin-tree__drag--ghost">
                  <DragHandleIcon />
                </span>
                {drag.icon ? (
                  <span className="admin-tree__type-icon">{drag.icon}</span>
                ) : null}
                <span className="admin-tree__main">
                  <span className="admin-tree__title">{drag.title}</span>
                  {drag.description ? (
                    <span className="admin-tree__desc">{drag.description}</span>
                  ) : null}
                </span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default function StructureTree({
  nodes,
  selectedId,
  onSelect,
  onToggleEnabled,
  onDelete,
  onAddOption,
  onReorder,
}: StructureTreeProps) {
  return (
    <div className="admin-tree">
      <TreeChildren
        parentId={null}
        nodes={nodes}
        selectedId={selectedId}
        onSelect={onSelect}
        onToggleEnabled={onToggleEnabled}
        onDelete={onDelete}
        onAddOption={onAddOption}
        onReorder={onReorder}
      />
    </div>
  )
}
