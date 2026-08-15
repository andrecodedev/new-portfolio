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
    hire: SpotCopy
    contact: SpotCopy
  }
  pages: {
    work: PageCopy
    about: PageCopy
    reading: PageCopy
    hire: PageCopy
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
    hire: {
      ariaLabel: 'Contrato',
      titleLines: ['Contrate meus', 'serviços'],
      body: 'Um espaço para fechar projeto com clareza e compromisso. Briefing, prazo e proposta no mesmo lugar.',
      accents: ['clareza', 'compromisso'],
      cta: 'Meu contrato',
    },
    contact: {
      ariaLabel: 'Contato',
      titleLines: ['Vamos', 'conversar'],
      body: 'Uma dúvida, um recado ou uma conversa: estou por aqui. Respondo com atenção e sem enrolação.',
      accents: ['dúvida', 'atenção'],
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
    hire: {
      menuLabel: 'Contrato',
      menuDescription: 'Contrate meu serviço por aqui.',
      title: 'Sobre o contrato.',
      body: 'Aqui você contrata meu serviço de forma direta. Conta o projeto, alinha o prazo e recebe uma proposta.',
      accents: ['contrata', 'proposta'],
      imageAlt: 'Ilustração de contrato',
    },
    contact: {
      menuLabel: 'Contato',
      menuDescription: 'Uma dúvida, um recado.',
      title: 'Fale comigo.',
      body: 'Se quiser tirar uma dúvida, deixar um recado ou só conversar, estou por aqui. Escreve quando fizer sentido.',
      accents: ['dúvida', 'conversar'],
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
    hire: {
      ariaLabel: 'Contract',
      titleLines: ['Hire my', 'services'],
      body: 'A space to close a project with clarity and commitment. Briefing, timeline, and proposal in the same place.',
      accents: ['clarity', 'commitment'],
      cta: 'My contract',
    },
    contact: {
      ariaLabel: 'Contact',
      titleLines: ["Let's", 'talk'],
      body: 'A question, a note, or a conversation: I am here. I reply with care and without the runaround.',
      accents: ['question', 'care'],
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
    hire: {
      menuLabel: 'Contract',
      menuDescription: 'Hire my service from here.',
      title: 'About the contract.',
      body: 'This is where you hire my service directly. Share the project, align the timeline, and get a proposal.',
      accents: ['hire', 'proposal'],
      imageAlt: 'Contract illustration',
    },
    contact: {
      menuLabel: 'Contact',
      menuDescription: 'A hello, a question, a note.',
      title: 'Talk to me.',
      body: 'If you want to ask something or just talk, I am around. Write when it feels right.',
      accents: ['ask', 'talk'],
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
    hire: {
      ariaLabel: 'Contrato',
      titleLines: ['Contrata mis', 'servicios'],
      body: 'Un espacio para cerrar un proyecto con claridad y compromiso. Briefing, plazo y propuesta en el mismo lugar.',
      accents: ['claridad', 'compromiso'],
      cta: 'Mi contrato',
    },
    contact: {
      ariaLabel: 'Contacto',
      titleLines: ['Hablemos', 'un rato'],
      body: 'Una duda, un recado o una conversación: estoy por aquí. Respondo con atención y sin rodeos.',
      accents: ['duda', 'atención'],
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
    hire: {
      menuLabel: 'Contrato',
      menuDescription: 'Contrata mi servicio por aquí.',
      title: 'Sobre el contrato.',
      body: 'Aquí contratas mi servicio de forma directa. Cuentas el proyecto, alineas el plazo y recibes una propuesta.',
      accents: ['contratas', 'propuesta'],
      imageAlt: 'Ilustración de contrato',
    },
    contact: {
      menuLabel: 'Contacto',
      menuDescription: 'Una duda, un recado.',
      title: 'Habla conmigo.',
      body: 'Si quieres resolver una duda, dejar un recado o solo conversar, estoy por aquí. Escribe cuando tenga sentido.',
      accents: ['duda', 'conversar'],
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
