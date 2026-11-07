import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { adminCopy } from './admin-copy'
import {
  DragHandleIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
} from './icons'

export type StructureBlockItem = {
  id: string
  enabled: boolean
  title: string
  description: string
  deletable?: boolean
  draggable?: boolean
}

type StructureBlockListProps = {
  items: readonly StructureBlockItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleEnabled: (id: string, enabled: boolean) => void
  onReorder: (orderedIds: string[]) => void
  onDelete: (id: string) => void
}

type DragState = {
  id: string
  fromIndex: number
  insertIndex: number
  title: string
  description: string
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

function layoutMidY(
  list: HTMLDivElement,
  node: HTMLDivElement,
) {
  return (
    list.getBoundingClientRect().top -
    list.scrollTop +
    node.offsetTop +
    node.offsetHeight / 2
  )
}

function insertIndexFromPointer(
  clientY: number,
  items: readonly StructureBlockItem[],
  fromIndex: number,
  list: HTMLDivElement | null,
  itemRefs: Map<string, HTMLDivElement>,
) {
  if (!list) return fromIndex

  const others = items
    .map((item, index) => ({ item, index }))
    .filter((entry) => entry.index !== fromIndex)

  let slot = others.length
  for (let i = 0; i < others.length; i += 1) {
    const node = itemRefs.get(others[i].item.id)
    if (!node) continue
    if (clientY < layoutMidY(list, node)) {
      slot = i
      break
    }
  }

  return slot
}

export default function StructureBlockList({
  items,
  selectedId,
  onSelect,
  onToggleEnabled,
  onReorder,
  onDelete,
}: StructureBlockListProps) {
  const copy = adminCopy.dashboard
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<string, HTMLDivElement>())
  const itemsRef = useRef(items)
  const onReorderRef = useRef(onReorder)
  const dragRef = useRef<DragState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  itemsRef.current = items
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
        itemsRef.current,
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
      if (current) {
        const ids = itemsRef.current.map((item) => item.id)
        const [moved] = ids.splice(current.fromIndex, 1)
        ids.splice(current.insertIndex, 0, moved)
        onReorderRef.current(ids)
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
  }, [drag?.id])

  const startDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    item: StructureBlockItem,
    index: number,
  ) => {
    if (item.draggable === false) return
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()

    const wrap = itemRefs.current.get(item.id)
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const styles = listRef.current
      ? getComputedStyle(listRef.current)
      : null
    const gap = styles ? Number.parseFloat(styles.rowGap || styles.gap || '8') : 8

    const next: DragState = {
      id: item.id,
      fromIndex: index,
      insertIndex: index,
      title: item.title,
      description: item.description,
      enabled: item.enabled,
      selected: item.id === selectedId,
      width: rect.width,
      height: rect.height,
      gap: Number.isFinite(gap) ? gap : 8,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      x: rect.left,
      y: rect.top,
    }

    dragRef.current = next
    setDrag(next)
  }

  const step = drag ? drag.height + drag.gap : 0

  return (
    <>
      <div
        ref={listRef}
        className={`admin__modules${drag ? ' admin__modules--dragging' : ''}`}
      >
        {items.map((item, index) => {
          const isDragging = drag?.id === item.id
          const shift =
            drag && !isDragging
              ? shiftForIndex(index, drag.fromIndex, drag.insertIndex, step)
              : 0

          return (
            <div
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node)
                else itemRefs.current.delete(item.id)
              }}
              className={[
                'admin__module-wrap',
                item.enabled ? '' : 'admin__module-wrap--off',
                isDragging ? 'admin__module-wrap--dragging' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                drag
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
                className={`admin__module${item.id === selectedId ? ' admin__module--on' : ''}`}
              >
                {item.draggable === false ? (
                  <span className="admin__drag admin__drag--static" aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    className="admin__drag"
                    title={copy.dragBlock}
                    aria-label={copy.dragBlock}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => startDrag(event, item, index)}
                  >
                    <DragHandleIcon />
                  </button>
                )}

                <button
                  type="button"
                  className="admin__module-main"
                  onClick={() => onSelect(item.id)}
                >
                  <span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </span>
                </button>

                <div className="admin__module-tools">
                  <button
                    type="button"
                    className={`admin__tool-btn${item.enabled ? '' : ' admin__tool-btn--off'}`}
                    title={item.enabled ? copy.hideBlock : copy.showBlock}
                    aria-label={item.enabled ? copy.hideBlock : copy.showBlock}
                    aria-pressed={item.enabled}
                    onClick={(event) => {
                      event.stopPropagation()
                      onToggleEnabled(item.id, !item.enabled)
                    }}
                  >
                    {item.enabled ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                  {item.deletable === false ? null : (
                    <button
                      type="button"
                      className="admin__tool-btn admin__tool-btn--danger"
                      title={copy.deleteModule}
                      aria-label={copy.deleteModule}
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(item.id)
                      }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {drag
        ? createPortal(
            <div
              className={[
                'admin__module-ghost',
                drag.selected ? 'admin__module-ghost--on' : '',
                drag.enabled ? '' : 'admin__module-ghost--off',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                width: drag.width,
                height: drag.height,
                transform: `translate3d(${drag.x}px, ${drag.y}px, 0) scale(1.04)`,
              }}
            >
              <div className="admin__module admin__module--ghost">
                <span className="admin__drag admin__drag--ghost">
                  <DragHandleIcon />
                </span>
                <span className="admin__module-main">
                  <span>
                    <h3>{drag.title}</h3>
                    <p>{drag.description}</p>
                  </span>
                </span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export function orderListByIds<T extends { id: string }>(
  list: readonly T[],
  orderedIds: string[],
): T[] {
  const map = new Map(list.map((item) => [item.id, item]))
  const ordered: T[] = []
  for (const id of orderedIds) {
    const item = map.get(id)
    if (item) ordered.push(item)
  }
  for (const item of list) {
    if (!orderedIds.includes(item.id)) ordered.push(item)
  }
  return ordered
}
