import type { Locale } from '../i18n/copy'

/**
 * Posts do blog. Para publicar um post novo, adicione um item em BLOG_POSTS
 * (o mais recente primeiro) com o slug (vira /blog/<slug>) e o texto nos 3 idiomas.
 */
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; text: string }

export type BlogPostLocale = {
  title: string
  excerpt: string
  body: BlogBlock[]
}

export type BlogPost = {
  slug: string
  /** AAAA-MM-DD */
  date: string
  tags: string[]
  /** Minutos de leitura (estimado à mão). */
  readMinutes: number
  content: Record<Locale, BlogPostLocale>
}

/** Posts de exemplo: troque pelo seu conteúdo real. */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'bem-vindo-ao-blog',
    date: '2026-11-15',
    tags: ['blog', 'carreira'],
    readMinutes: 2,
    content: {
      pt: {
        title: 'Bem-vindo ao blog',
        excerpt: 'Por que criei este espaço e o que você vai encontrar por aqui.',
        body: [
          { type: 'p', text: 'Este é o primeiro post do blog. A ideia é ter um lugar para registrar o que aprendo e compartilhar conteúdos que acho interessantes.' },
          { type: 'h2', text: 'O que vem por aí' },
          { type: 'list', items: ['Artigos sobre desenvolvimento web', 'Dicas de estudo e carreira', 'Indicações de leituras, vídeos e ferramentas'] },
          { type: 'quote', text: 'Escrever é a melhor forma de descobrir o que eu realmente entendi.' },
          { type: 'p', text: 'Volte de vez em quando: este espaço vai crescer junto com a minha trajetória.' },
        ],
      },
      en: {
        title: 'Welcome to the blog',
        excerpt: 'Why I created this space and what you will find here.',
        body: [
          { type: 'p', text: 'This is the first post on the blog. The idea is to have a place to record what I learn and share content I find interesting.' },
          { type: 'h2', text: 'What is coming' },
          { type: 'list', items: ['Articles about web development', 'Study and career tips', 'Recommendations of reading, videos and tools'] },
          { type: 'quote', text: 'Writing is the best way to find out what I really understood.' },
          { type: 'p', text: 'Come back from time to time: this space will grow along with my journey.' },
        ],
      },
      es: {
        title: 'Bienvenido al blog',
        excerpt: 'Por qué creé este espacio y qué encontrarás aquí.',
        body: [
          { type: 'p', text: 'Este es el primer post del blog. La idea es tener un lugar para registrar lo que aprendo y compartir contenidos que me parecen interesantes.' },
          { type: 'h2', text: 'Lo que viene' },
          { type: 'list', items: ['Artículos sobre desarrollo web', 'Consejos de estudio y carrera', 'Recomendaciones de lecturas, videos y herramientas'] },
          { type: 'quote', text: 'Escribir es la mejor forma de descubrir lo que realmente entendí.' },
          { type: 'p', text: 'Vuelve de vez en cuando: este espacio crecerá junto con mi trayectoria.' },
        ],
      },
    },
  },
  {
    slug: 'checklist-de-responsividade',
    date: '2026-11-10',
    tags: ['css', 'responsivo'],
    readMinutes: 3,
    content: {
      pt: {
        title: 'Checklist de responsividade',
        excerpt: 'Pontos que confiro antes de dar uma tela por pronta no celular.',
        body: [
          { type: 'p', text: 'Responsividade não é só "caber na tela". Antes de considerar uma página pronta, passo por esta lista curta.' },
          { type: 'h2', text: 'A lista' },
          { type: 'list', items: ['Textos legíveis sem zoom (nada gigante nem minúsculo)', 'Espaçamento parecido em cima, embaixo e nas laterais', 'Botões e setas com tamanho proporcional ao resto', 'Conteúdo que vira carrossel em vez de empilhar demais', 'Teste em aparelho real, não só no modo responsivo'] },
          { type: 'code', text: '/* Exemplo: tamanho fluido entre 14px e 19px */\nfont-size: clamp(0.9rem, 0.8rem + 0.45vw, 1.2rem);' },
          { type: 'p', text: 'O teste no aparelho real sempre revela algo que o navegador no computador não mostra.' },
        ],
      },
      en: {
        title: 'Responsiveness checklist',
        excerpt: 'Points I check before calling a screen done on mobile.',
        body: [
          { type: 'p', text: 'Responsiveness is not just "fitting on the screen". Before I consider a page done, I go through this short list.' },
          { type: 'h2', text: 'The list' },
          { type: 'list', items: ['Readable text without zoom (nothing huge or tiny)', 'Similar spacing on top, bottom and sides', 'Buttons and arrows proportional to everything else', 'Content that becomes a carousel instead of stacking too much', 'Testing on a real device, not only in responsive mode'] },
          { type: 'code', text: '/* Example: fluid size between 14px and 19px */\nfont-size: clamp(0.9rem, 0.8rem + 0.45vw, 1.2rem);' },
          { type: 'p', text: 'Testing on a real device always reveals something the desktop browser does not show.' },
        ],
      },
      es: {
        title: 'Checklist de responsividad',
        excerpt: 'Puntos que reviso antes de dar una pantalla por lista en el móvil.',
        body: [
          { type: 'p', text: 'La responsividad no es solo "caber en la pantalla". Antes de considerar una página lista, repaso esta lista corta.' },
          { type: 'h2', text: 'La lista' },
          { type: 'list', items: ['Textos legibles sin zoom (nada enorme ni diminuto)', 'Espaciado parecido arriba, abajo y a los lados', 'Botones y flechas proporcionales al resto', 'Contenido que se vuelve carrusel en vez de apilarse demasiado', 'Prueba en un dispositivo real, no solo en el modo responsivo'] },
          { type: 'code', text: '/* Ejemplo: tamaño fluido entre 14px y 19px */\nfont-size: clamp(0.9rem, 0.8rem + 0.45vw, 1.2rem);' },
          { type: 'p', text: 'La prueba en un dispositivo real siempre revela algo que el navegador de escritorio no muestra.' },
        ],
      },
    },
  },
]

export function findBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function formatBlogDate(date: string, locale: Locale) {
  const tag = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR'
  return new Date(`${date}T12:00:00`).toLocaleDateString(tag, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
