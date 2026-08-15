export type Locale = 'pt' | 'en' | 'es'

export type AccentedCopy = {
  body: string
  accents: readonly string[]
}

export type PageCopy = AccentedCopy & {
  menuLabel: string
  menuDescription: string
  title: string
  imageAlt: string
}

export type SpotCopy = AccentedCopy & {
  ariaLabel: string
  titleLines: readonly [string, string]
  cta: string
}

export type Dictionary = {
  htmlLang: string
  chrome: {
    menu: string
    close: string
    hireMe: string
    openMenu: string
    closeMenu: string
    language: string
    tools: string
    openSettings: string
    themeLight: string
    themeDark: string
    copyrightLine1: string
    copyrightLine2: string
    backToTop: string
    loading: string
  }
  navHome: {
    label: string
    description: string
  }
  home: {
    heroTitleLines: readonly [string, string]
    heroSubtitleLines: readonly [string, string]
    works: AccentedCopy & {
      titleLines: readonly [string, string]
      cta: string
      ariaLabel: string
    }
    about: SpotCopy
    reading: SpotCopy
    contact: SpotCopy
  }
  pages: {
    work: PageCopy
    about: PageCopy
    reading: PageCopy
    contact: PageCopy
  }
}

const pt: Dictionary = {
  htmlLang: 'pt-BR',
  chrome: {
    menu: 'Menu',
    close: 'Fechar',
    hireMe: 'Me contate',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    language: 'Idioma',
    tools: 'Ferramentas do site',
    openSettings: 'Abrir configurações',
    themeLight: 'Ativar tema claro',
    themeDark: 'Ativar tema escuro',
    copyrightLine1: 'Direitos Autorais © 2024 - 2026 andrevitordev.vercel.app',
    copyrightLine2: 'Todos os direitos reservados.',
    backToTop: 'Voltar ao topo',
    loading: 'Carregando',
  },
  navHome: {
    label: 'Home',
    description: 'Voltar para a página inicial.',
  },
  home: {
    heroTitleLines: ['Olá, eu sou', 'André Vitor.'],
    heroSubtitleLines: [
      'Desenvolvedor web júnior,',
      'do código à experiência do usuário.',
    ],
    works: {
      ariaLabel: 'Trabalhos',
      titleLines: ['Meus trabalhos e', 'estatísticas'],
      body: 'Uma visão geral da minha trajetória, reunindo projetos, estatísticas e contribuições que marcam o caminho até aqui.',
      accents: ['projetos', 'estatísticas'],
      cta: 'Meus trabalhos',
    },
    about: {
      ariaLabel: 'História',
      titleLines: ['Conheça um pouco da', 'minha história'],
      body: 'Da formação técnica à prática no dia a dia, construo experiências web com curiosidade, disciplina e vontade de entregar algo que funcione de verdade. Quanto mais desafiador, melhor.',
      accents: ['funcione', 'desafiador'],
      cta: 'Minha história',
    },
    reading: {
      ariaLabel: 'Estudos e projetos',
      titleLines: ['Veja meus estudos e', 'projetos'],
      body: 'Evoluo na prática: projetos, experimentos e iterações constantes. Aplico o que aprendo em código real, buscando clareza e qualidade.',
      accents: ['clareza', 'qualidade'],
      cta: 'Meus estudos',
    },
    contact: {
      ariaLabel: 'Vamos trabalhar juntos',
      titleLines: ['Vamos trabalhar', 'juntos'],
      body: 'Se você tem um projeto ambicioso, uma ideia ousada ou só quer trocar uma ideia, vamos conversar. Aberto a novos desafios.',
      accents: ['ambicioso', 'ousada'],
      cta: 'Fale comigo',
    },
  },
  pages: {
    work: {
      menuLabel: 'Trabalho',
      menuDescription: 'Como eu construo e entrego.',
      title: 'Sobre meu trabalho.',
      body: 'Do front ao detalhe da experiência, construo interfaces acessíveis e produtos que resolvem problema de verdade. Aqui estão trabalhos, contribuições e resultados da jornada. Quanto mais desafiador, melhor.',
      accents: ['interfaces', 'desafiador'],
      imageAlt: 'Ilustração de notebook',
    },
    about: {
      menuLabel: 'Sobre',
      menuDescription: 'Quem sou e de onde venho.',
      title: 'Sobre minha história.',
      body: 'Desenvolvedor web júnior na TEC4U, com base técnica na ETEC e graduação em ADS na FACENS. Apaixonado por tecnologia desde cedo, construo projetos web com foco em aprendizado contínuo e impacto real.',
      accents: ['aprendizado', 'impacto'],
      imageAlt: 'Ilustração de história',
    },
    reading: {
      menuLabel: 'Estudos',
      menuDescription: 'Prática, experimentos e evolução.',
      title: 'Sobre meus estudos e projetos.',
      body: 'Evoluo na prática: projetos, experimentos e hábitos constantes. Aplico práticas modernas no código do dia a dia, sempre buscando entregar com clareza e qualidade.',
      accents: ['clareza', 'qualidade'],
      imageAlt: 'Ilustração de estudos e projetos',
    },
    contact: {
      menuLabel: 'Contato',
      menuDescription: 'Vamos construir algo juntos.',
      title: 'Contato.',
      body: 'Vamos falar sobre projetos, ideias e oportunidades. Aberto a colaborações e desafios que peçam cuidado técnico e vontade de construir.',
      accents: ['colaborações', 'desafios'],
      imageAlt: 'Ilustração de contato',
    },
  },
}

const en: Dictionary = {
  htmlLang: 'en',
  chrome: {
    menu: 'Menu',
    close: 'Close',
    hireMe: 'Hire me',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    tools: 'Site tools',
    openSettings: 'Open settings',
    themeLight: 'Switch to light theme',
    themeDark: 'Switch to dark theme',
    copyrightLine1: 'Copyright © 2024 - 2026 andrevitordev.vercel.app',
    copyrightLine2: 'All rights reserved.',
    backToTop: 'Back to top',
    loading: 'Loading',
  },
  navHome: {
    label: 'Home',
    description: 'Back to the home page.',
  },
  home: {
    heroTitleLines: ['Hi, I am', 'André Vitor.'],
    heroSubtitleLines: [
      'Junior web developer,',
      'from code to user experience.',
    ],
    works: {
      ariaLabel: 'Works',
      titleLines: ['My work and', 'stats'],
      body: 'A snapshot of my path so far, bringing together projects, stats, and contributions that mark the journey.',
      accents: ['projects', 'stats'],
      cta: 'My work',
    },
    about: {
      ariaLabel: 'About',
      titleLines: ['Get to know a bit of', 'my story'],
      body: 'From technical school to day-to-day practice, I build web experiences with curiosity, discipline, and a drive to ship something that works for real. The more challenging, the better.',
      accents: ['works', 'challenging'],
      cta: 'My story',
    },
    reading: {
      ariaLabel: 'Studies and projects',
      titleLines: ['See my studies and', 'projects'],
      body: 'I grow by doing: projects, experiments, and constant iteration. I apply what I learn in real code, aiming for clarity and quality.',
      accents: ['clarity', 'quality'],
      cta: 'My studies',
    },
    contact: {
      ariaLabel: "Let's work together",
      titleLines: ["Let's work", 'together'],
      body: "If you have an ambitious project, a bold idea, or just want to chat, let's talk. Open to new challenges.",
      accents: ['ambitious', 'bold'],
      cta: 'Talk to me',
    },
  },
  pages: {
    work: {
      menuLabel: 'Work',
      menuDescription: 'How I build and ship.',
      title: 'About my work.',
      body: 'From the front end to the details of the experience, I build accessible interfaces and products that solve real problems. Here are works, contributions, and results from the journey. The more challenging, the better.',
      accents: ['interfaces', 'challenging'],
      imageAlt: 'Laptop illustration',
    },
    about: {
      menuLabel: 'About',
      menuDescription: 'Who I am and where I come from.',
      title: 'About my story.',
      body: 'Junior web developer at TEC4U, with a technical foundation from ETEC and an ADS degree at FACENS. Passionate about technology from early on, I build web projects focused on continuous learning and real impact.',
      accents: ['learning', 'impact'],
      imageAlt: 'Story illustration',
    },
    reading: {
      menuLabel: 'Studies',
      menuDescription: 'Practice, experiments, and growth.',
      title: 'About my studies and projects.',
      body: 'I grow by doing: projects, experiments, and steady habits. I apply modern practices in day-to-day code, always aiming to ship with clarity and quality.',
      accents: ['clarity', 'quality'],
      imageAlt: 'Studies and projects illustration',
    },
    contact: {
      menuLabel: 'Contact',
      menuDescription: "Let's build something together.",
      title: 'Contact.',
      body: "Let's talk about projects, ideas, and opportunities. Open to collaborations and challenges that call for technical care and a will to build.",
      accents: ['collaborations', 'challenges'],
      imageAlt: 'Contact illustration',
    },
  },
}

const es: Dictionary = {
  htmlLang: 'es',
  chrome: {
    menu: 'Menu',
    close: 'Cerrar',
    hireMe: 'Contáctame',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    language: 'Idioma',
    tools: 'Herramientas del sitio',
    openSettings: 'Abrir ajustes',
    themeLight: 'Activar tema claro',
    themeDark: 'Activar tema oscuro',
    copyrightLine1: 'Derechos de autor © 2024 - 2026 andrevitordev.vercel.app',
    copyrightLine2: 'Todos los derechos reservados.',
    backToTop: 'Volver arriba',
    loading: 'Cargando',
  },
  navHome: {
    label: 'Home',
    description: 'Volver a la página de inicio.',
  },
  home: {
    heroTitleLines: ['Hola, soy', 'André Vitor.'],
    heroSubtitleLines: [
      'Desarrollador web junior,',
      'del código a la experiencia del usuario.',
    ],
    works: {
      ariaLabel: 'Trabajos',
      titleLines: ['Mis trabajos y', 'estadísticas'],
      body: 'Una visión general de mi trayectoria, reuniendo proyectos, estadísticas y contribuciones que marcan el camino hasta aquí.',
      accents: ['proyectos', 'estadísticas'],
      cta: 'Mis trabajos',
    },
    about: {
      ariaLabel: 'Historia',
      titleLines: ['Conoce un poco de', 'mi historia'],
      body: 'De la formación técnica a la práctica del día a día, construyo experiencias web con curiosidad, disciplina y ganas de entregar algo que funcione de verdad. Cuanto más desafiante, mejor.',
      accents: ['funcione', 'desafiante'],
      cta: 'Mi historia',
    },
    reading: {
      ariaLabel: 'Estudios y proyectos',
      titleLines: ['Mira mis estudios y', 'proyectos'],
      body: 'Evoluciono en la práctica: proyectos, experimentos e iteraciones constantes. Aplico lo que aprendo en código real, buscando claridad y calidad.',
      accents: ['claridad', 'calidad'],
      cta: 'Mis estudios',
    },
    contact: {
      ariaLabel: 'Trabajemos juntos',
      titleLines: ['Trabajemos', 'juntos'],
      body: 'Si tienes un proyecto ambicioso, una idea audaz o solo quieres charlar, hablemos. Abierto a nuevos desafíos.',
      accents: ['ambicioso', 'audaz'],
      cta: 'Habla conmigo',
    },
  },
  pages: {
    work: {
      menuLabel: 'Trabajo',
      menuDescription: 'Cómo construyo y entrego.',
      title: 'Sobre mi trabajo.',
      body: 'Del front al detalle de la experiencia, construyo interfaces accesibles y productos que resuelven problemas de verdad. Aquí están trabajos, contribuciones y resultados del camino. Cuanto más desafiante, mejor.',
      accents: ['interfaces', 'desafiante'],
      imageAlt: 'Ilustración de notebook',
    },
    about: {
      menuLabel: 'Sobre',
      menuDescription: 'Quién soy y de dónde vengo.',
      title: 'Sobre mi historia.',
      body: 'Desarrollador web junior en TEC4U, con base técnica en la ETEC y graduación en ADS en FACENS. Apasionado por la tecnología desde temprano, construyo proyectos web con foco en aprendizaje continuo e impacto real.',
      accents: ['aprendizaje', 'impacto'],
      imageAlt: 'Ilustración de historia',
    },
    reading: {
      menuLabel: 'Estudios',
      menuDescription: 'Práctica, experimentos y evolución.',
      title: 'Sobre mis estudios y proyectos.',
      body: 'Evoluciono en la práctica: proyectos, experimentos y hábitos constantes. Aplico prácticas modernas en el código del día a día, siempre buscando entregar con claridad y calidad.',
      accents: ['claridad', 'calidad'],
      imageAlt: 'Ilustración de estudios y proyectos',
    },
    contact: {
      menuLabel: 'Contacto',
      menuDescription: 'Construyamos algo juntos.',
      title: 'Contacto.',
      body: 'Hablemos de proyectos, ideas y oportunidades. Abierto a colaboraciones y desafíos que pidan cuidado técnico y ganas de construir.',
      accents: ['colaboraciones', 'desafíos'],
      imageAlt: 'Ilustración de contacto',
    },
  },
}

export const DICTIONARIES: Record<Locale, Dictionary> = {
  pt,
  en,
  es,
}

export const LOCALES: readonly Locale[] = ['pt', 'en', 'es'] as const

export const LOCALE_LABELS: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'pt' || value === 'en' || value === 'es'
}
