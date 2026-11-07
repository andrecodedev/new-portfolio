/** Props de hit-target no preview (Nuvemshop-style outline + clique) */
export function cmsEditAttrs(id: string, label: string, selectedId?: string | null) {
  return {
    'data-cms-edit': id,
    'data-cms-label': label,
    'data-cms-active': selectedId === id ? ('true' as const) : undefined,
  }
}

export function cmsEditClass(selectedId: string | null | undefined, id: string) {
  return selectedId === id ? 'cms-edit cms-edit--on' : 'cms-edit'
}
