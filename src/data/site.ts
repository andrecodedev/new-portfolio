export const ASSETS = {
  logo: '/logo.png',
  hireMe: '/hireMe.png',
  avatar: '/avatar.png',
  notebook: '/notebook.png',
  history: '/history.png',
  studies: '/studingProject.png',
  contact: '/contact.png',
  email: '/email.png',
  github: '/github.png',
  linkedin: '/linkedin.png',
  instagram: '/instagram.png',
  youtube: '/youtube.png',
} as const

export const SOCIAL_LINKS = [
  {
    src: ASSETS.email,
    href: 'mailto:contato.andrecodedev@gmail.com',
    label: 'Email',
  },
  {
    src: ASSETS.github,
    href: 'https://github.com/andrecodedev',
    label: 'GitHub',
  },
  {
    src: ASSETS.linkedin,
    href: 'https://www.linkedin.com/in/andrecodedev',
    label: 'LinkedIn',
  },
  {
    src: ASSETS.instagram,
    href: 'https://instagram.com/',
    label: 'Instagram',
  },
  {
    src: ASSETS.youtube,
    href: 'https://youtube.com/',
    label: 'YouTube',
  },
] as const

export type SitePageId = 'home' | 'work' | 'about' | 'reading' | 'contact'

export type ContentPageId = Exclude<SitePageId, 'home'>

/** Home não entra na lista de content pages, mas tem loader cinza na boot/volta. */
export const HOME_LOADER_BG = 'var(--bg-loader)'

export type PageMeta = {
  id: ContentPageId
  path: string
  loaderBg: string
  image: string
  accent: ContentPageId
}

export const PAGE_META: Record<ContentPageId, PageMeta> = {
  work: {
    id: 'work',
    path: '/work',
    loaderBg: 'var(--loader-work)',
    image: ASSETS.notebook,
    accent: 'work',
  },
  about: {
    id: 'about',
    path: '/about',
    loaderBg: 'var(--loader-about)',
    image: ASSETS.history,
    accent: 'about',
  },
  reading: {
    id: 'reading',
    path: '/reading',
    loaderBg: 'var(--loader-reading)',
    image: ASSETS.studies,
    accent: 'reading',
  },
  contact: {
    id: 'contact',
    path: '/contact',
    loaderBg: 'var(--loader-contact)',
    image: ASSETS.contact,
    accent: 'contact',
  },
} as const

/** Destaca palavras do body com a mesma classe das seções da home. */
export function highlightAccents(text: string, accents: readonly string[]) {
  if (accents.length === 0) {
    return [{ key: 'full', text, accent: false }]
  }

  const escaped = accents.map((word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  )
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return parts
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const isAccent = accents.some(
        (word) => word.toLowerCase() === part.toLowerCase(),
      )
      return { key: `${index}-${part}`, text: part, accent: isAccent }
    })
}

export function getLoaderBgForPath(path: string): string {
  if (path === '/' || path === '') return HOME_LOADER_BG
  const page = Object.values(PAGE_META).find((item) => item.path === path)
  return page?.loaderBg ?? HOME_LOADER_BG
}