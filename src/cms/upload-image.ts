import { supabase } from '../lib/supabase-client'

export const MEDIA_BUCKET = 'avatars'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'avif',
  'mp4',
  'webm',
] as const

function fileExt(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return (ALLOWED as readonly string[]).includes(ext) ? ext : 'jpg'
}

export async function uploadPublicImage(file: File, folder = 'hero') {
  return uploadPublicMedia(file, folder)
}

export async function uploadPublicMedia(file: File, folder = 'hero') {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  if (!isImage && !isVideo) {
    throw new Error('Envie uma imagem ou um vídeo')
  }
  const maxBytes = isVideo ? 20 * 1024 * 1024 : MAX_BYTES
  if (file.size > maxBytes) {
    throw new Error(
      isVideo ? 'O vídeo deve ter no máximo 20 MB.' : 'A imagem deve ter no máximo 5 MB',
    )
  }

  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${fileExt(file.name)}`
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(data.path).data.publicUrl
}
