import { supabase } from '../lib/supabase-client'
import { uploadPublicMedia } from './upload-image'

export const CMS_MEDIA_KEY = 'media_library'

export type MediaAsset = {
  id: string
  url: string
  name: string
  createdAt: string
}

export type MediaLibraryPayload = {
  version: 1
  items: MediaAsset[]
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `media-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function defaultMediaLibrary(): MediaLibraryPayload {
  return { version: 1, items: [] }
}

export function parseMediaLibrary(payload: unknown): MediaLibraryPayload {
  const fallback = defaultMediaLibrary()
  if (!payload || typeof payload !== 'object') return fallback
  const row = payload as Record<string, unknown>
  if (!Array.isArray(row.items)) return fallback
  const items = row.items
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const media = item as Record<string, unknown>
      if (typeof media.url !== 'string' || !media.url.trim()) return null
      return {
        id: typeof media.id === 'string' ? media.id : newId(),
        url: media.url.trim(),
        name:
          typeof media.name === 'string' && media.name.trim()
            ? media.name.trim()
            : media.url.split('/').pop() || 'arquivo',
        createdAt:
          typeof media.createdAt === 'string'
            ? media.createdAt
            : new Date().toISOString(),
      } satisfies MediaAsset
    })
    .filter((item): item is MediaAsset => item !== null)
  return { version: 1, items }
}

export async function fetchMediaLibrary(): Promise<MediaLibraryPayload> {
  const fallback = defaultMediaLibrary()
  if (!supabase) return fallback
  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_MEDIA_KEY)
    .maybeSingle()
  if (error || !data) return fallback
  return parseMediaLibrary(data.payload)
}

export async function saveMediaLibrary(payload: MediaLibraryPayload) {
  if (!supabase) {
    // Bypass / local: keep in memory via caller state only.
    return
  }
  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_MEDIA_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function uploadToMediaLibrary(
  file: File,
  library: MediaLibraryPayload,
  folder = 'library',
): Promise<MediaLibraryPayload> {
  const url = await uploadPublicMedia(file, folder)
  const asset: MediaAsset = {
    id: newId(),
    url,
    name: file.name,
    createdAt: new Date().toISOString(),
  }
  const next = { version: 1 as const, items: [asset, ...library.items] }
  await saveMediaLibrary(next)
  return next
}

export function addUrlToMediaLibrary(
  url: string,
  library: MediaLibraryPayload,
  name?: string,
): MediaLibraryPayload {
  const trimmed = url.trim()
  if (!trimmed) return library
  if (library.items.some((item) => item.url === trimmed)) return library
  const asset: MediaAsset = {
    id: newId(),
    url: trimmed,
    name: name || trimmed.split('/').pop() || 'arquivo',
    createdAt: new Date().toISOString(),
  }
  return { version: 1, items: [asset, ...library.items] }
}
