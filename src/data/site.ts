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
  { src: ASSETS.email, href: 'mailto:andre@example.com', label: 'Email' },
  { src: ASSETS.github, href: 'https://github.com/', label: 'GitHub' },
  { src: ASSETS.linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
  { src: ASSETS.instagram, href: 'https://instagram.com/', label: 'Instagram' },
  { src: ASSETS.youtube, href: 'https://youtube.com/', label: 'YouTube' },
] as const

export const PAGE_COPY =
  'Do design de interação a sistemas de design escaláveis, aplicativos de página única a algo mais experimental com WebGL. Ajudo pessoas incríveis a criar projetos web ambiciosos, mas acessíveis. Quanto mais ousados, melhor.'

export type SitePageId = 'home' | 'work' | 'about' | 'reading' | 'contact'

export type SitePage = {
  id: SitePageId
  path: string
  menuLabel: string
  menuDescription: string
  /** Cor do loader ao entrar nesta página */
  loaderBg: string
  title: string
  body: string
  image: string
  imageAlt: string
}

/** Home não entra na lista de “content pages”, mas tem loader cinza na boot/volta. */
export const HOME_LOADER_BG = 'var(--bg-loader)'

export const SITE_PAGES: Record<Exclude<SitePageId, 'home'>, SitePage> = {
  work: {
    id: 'work',
    path: '/work',
    menuLabel: 'Work',
    menuDescription: 'My approach to development.',
    loaderBg: 'var(--loader-work)',
    title: 'About my work.',
    body: PAGE_COPY,
    image: ASSETS.notebook,
    imageAlt: 'Notebook illustration',
  },
  about: {
    id: 'about',
    path: '/about',
    menuLabel: 'About',
    menuDescription: 'A little about me and my background.',
    loaderBg: 'var(--loader-about)',
    title: 'About my history.',
    body: PAGE_COPY,
    image: ASSETS.history,
    imageAlt: 'History illustration',
  },
  reading: {
    id: 'reading',
    path: '/reading',
    menuLabel: 'Writing',
    menuDescription: 'My latest writing on tech and language.',
    loaderBg: 'var(--loader-reading)',
    title: 'About my studying and project.',
    body: PAGE_COPY,
    image: ASSETS.studies,
    imageAlt: 'Studies and projects illustration',
  },
  contact: {
    id: 'contact',
    path: '/contact',
    menuLabel: 'Contact',
    menuDescription: 'Let’s work together.',
    loaderBg: 'var(--loader-contact)',
    title: 'Contact.',
    body: PAGE_COPY,
    image: ASSETS.contact,
    imageAlt: 'Contact illustration',
  },
} as const

export const NAV_LINKS = [
  {
    label: 'Home',
    path: '/',
    description: 'Back to the home page.',
    loaderBg: HOME_LOADER_BG,
    accent: null,
  },
  {
    label: SITE_PAGES.about.menuLabel,
    path: SITE_PAGES.about.path,
    description: SITE_PAGES.about.menuDescription,
    loaderBg: SITE_PAGES.about.loaderBg,
    accent: 'about' as const,
  },
  {
    label: SITE_PAGES.work.menuLabel,
    path: SITE_PAGES.work.path,
    description: SITE_PAGES.work.menuDescription,
    loaderBg: SITE_PAGES.work.loaderBg,
    accent: 'work' as const,
  },
  {
    label: SITE_PAGES.reading.menuLabel,
    path: SITE_PAGES.reading.path,
    description: SITE_PAGES.reading.menuDescription,
    loaderBg: SITE_PAGES.reading.loaderBg,
    accent: 'reading' as const,
  },
  {
    label: SITE_PAGES.contact.menuLabel,
    path: SITE_PAGES.contact.path,
    description: SITE_PAGES.contact.menuDescription,
    loaderBg: SITE_PAGES.contact.loaderBg,
    accent: 'contact' as const,
  },
] as const

export function getLoaderBgForPath(path: string): string {
  if (path === '/' || path === '') return HOME_LOADER_BG
  const page = Object.values(SITE_PAGES).find((item) => item.path === path)
  return page?.loaderBg ?? HOME_LOADER_BG
}
