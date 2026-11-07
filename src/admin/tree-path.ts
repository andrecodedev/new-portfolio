/** IDs de nós filhos na árvore: `parentId::key` ou `parentId::key::extra` */

export function treeChildId(parentId: string, ...keys: string[]) {
  return [parentId, ...keys].join('::')
}

export function treeRootId(editingId: string | null) {
  if (!editingId) return null
  return editingId.split('::')[0] ?? null
}

export function treeParts(editingId: string | null): string[] {
  if (!editingId) return []
  return editingId.split('::').slice(1)
}

export function isTreeChildOf(editingId: string | null, parentId: string) {
  return Boolean(editingId && (editingId === parentId || editingId.startsWith(`${parentId}::`)))
}
