import { ACHIEVEMENT_IMAGES, EXPERIENCE_LOGOS } from '../data/about'

export type Locale = 'pt' | 'en' | 'es'

export type AccentedCopy = {
  body: string
  accents: readonly string[]
}

export type PageCopy = AccentedCopy & {
  menuLabel: string
  menuDescription: string
  menuAccents: readonly string[]
  title: string
  imageAlt: string
}

export type WorkStat = {
  value: string
  label: string
  hint: string
}

export type AchievementEntry = {
  image: string
  title: string
  description: string
}

export type ExperienceEntry = {
  logo: string
  title: string
  company: string
  position: string
  startDate: string
  endDate: string
  time: string
  location: string
  description: string
}

export type HighlightEntry = {
  id: string
  title: string
  description: string
}

export type AboutPageCopy = PageCopy & {
  hero: {
    projectsCta: string
    cvCta: string
  }
  videoAriaLabel: string
  tabs: {
    achievements: string
    video: string
    experience: string
    details: string
  }
  /** Galeria de momentos (acordeão): título e nome de cada painel, na ordem das imagens. */
  moments: {
    heading: string
    labels: readonly string[]
  }
  achievements: readonly AchievementEntry[]
  experience: readonly ExperienceEntry[]
  highlights: {
    subtitle: string
    items: readonly HighlightEntry[]
  }
}

export type ReadingPageCopy = PageCopy & {
  studies: {
    heading: string
    items: readonly { title: string; subtitle: string }[]
  }
}

export type BlogPageCopy = PageCopy & {
  listHeading: string
  empty: string
  readMore: string
  backToList: string
  minRead: string
  publishedOn: string
  moreHeading: string
}

export type WorkPageCopy = PageCopy & {
  stats: readonly WorkStat[]
  github: {
    heading: string
    yearLast: string
    statsAlt: string
    langsAlt: string
    legendLess: string
    legendMore: string
  }
  gallery: {
    heading: string
  }
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
    news: string
    openNews: string
  }
  gate: {
    hireKicker: string
    hireTitle: string
    hireBody: string
    hireCta: string
    youtubeKicker: string
    youtubeTitle: string
    youtubeBody: string
    youtubeCta: string
    youtubeStudiesCta: string
    next: string
    prev: string
  }
  navHome: {
    label: string
    description: string
    accents: readonly string[]
  }
  notFound: {
    code: string
    title: string
    titleLines: readonly [string, string]
    body: string
    cta: string
  }
  home: {
    heroTitleLines: readonly [string, string]
    heroSubtitleLines: readonly [string, string]
    heroSubtitleAccents: readonly string[]
    works: AccentedCopy & {
      titleLines: readonly [string, string]
      cta: string
      ariaLabel: string
    }
    about: SpotCopy
    reading: SpotCopy
    blog: SpotCopy
    hire: SpotCopy
    contact: SpotCopy
  }
  pages: {
    work: WorkPageCopy
    about: AboutPageCopy
    reading: ReadingPageCopy
    blog: BlogPageCopy
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
    themeLight: 'Mudar para o tema claro',
    themeDark: 'Mudar para o tema escuro',
    copyrightLine1: 'Direitos Autorais © 2024 - 2026 andrevitordev.vercel.app',
    copyrightLine2: 'Todos os direitos reservados.',
    backToTop: 'Voltar ao topo',
    loading: 'Carregando',
    news: 'Novidades',
    openNews: 'Abrir novidades',
  },
  gate: {
    hireKicker: 'Contrato',
    hireTitle: 'Tem um projeto?',
    hireBody:
      'Contrate pelo contrato: briefing, prazo e proposta no mesmo lugar, com clareza e compromisso.',
    hireCta: 'Ir para o contrato',
    youtubeKicker: 'YouTube',
    youtubeTitle: 'Canal no YouTube',
    youtubeBody:
      'Aulas, bastidores e o que estou construindo em público. Se quiser acompanhar o processo, o canal está aberto.',
    youtubeCta: 'Ver o canal',
    youtubeStudiesCta: 'Ver mais',
    next: 'Próxima novidade',
    prev: 'Novidade anterior',
  },
  navHome: {
    label: 'Home',
    description: 'Voltar para a página inicial.',
    accents: ['página', 'inicial'],
  },
  notFound: {
    code: '404',
    title: 'Página não encontrada.',
    titleLines: ['Página não', 'encontrada.'],
    body: 'Esse endereço não existe neste portfólio. Volta pra home e segue pelo menu.',
    cta: 'Voltar à home',
  },
  home: {
    heroTitleLines: ['Olá, eu sou', 'André Vitor.'],
    heroSubtitleLines: [
      'Desenvolvedor web júnior,',
      'do código à experiência do usuário.',
    ],
    heroSubtitleAccents: ['código', 'experiência'],
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
    blog: {
      ariaLabel: 'Blog',
      titleLines: ['Leia meu blog e', 'meus posts'],
      body: 'Um espaço para registrar o que aprendo e compartilhar o que acho interessante: artigos, dicas e reflexões sobre tecnologia, código e carreira.',
      accents: ['aprendo', 'interessante'],
      cta: 'Meu blog',
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
      menuAccents: ['construo', 'entrego'],
      title: 'Sobre meu trabalho.',
      body: 'Do front ao detalhe da experiência, construo interfaces acessíveis e produtos que resolvem problema de verdade. Aqui estão trabalhos, contribuições e resultados da jornada. Quanto mais desafiador, melhor.',
      accents: ['interfaces', 'desafiador'],
      imageAlt: 'Ilustração de notebook',
      stats: [
        { value: '5+', label: 'Anos de Estudo Intensivo', hint: 'Base de conhecimento!' },
        { value: '12K+', label: 'Horas de Codificação', hint: 'Foco e persistência!' },
        { value: '900+', label: 'Total de Commits', hint: 'Evolução constante!' },
        { value: '35+', label: 'Repositórios no GitHub', hint: 'Código aberto!' },
        { value: '1,5K+', label: 'Cafés Consumidos', hint: 'Energia para codar!' },
      ],
      github: {
        heading: 'Atividade no GitHub',
        yearLast: 'Último Ano',
        statsAlt: 'Estatísticas do GitHub',
        langsAlt: 'Linguagens mais usadas',
        legendLess: 'Menos',
        legendMore: 'Mais',
      },
      gallery: {
        heading: 'Projetos em destaque',
      },
    },
    about: {
      menuLabel: 'Sobre',
      menuDescription: 'Quem sou e de onde venho.',
      menuAccents: ['sou', 'venho'],
      title: 'Sobre minha história.',
      body: 'Desenvolvedor web júnior na TEC4U, com base técnica na ETEC e graduação em ADS na FACENS. Apaixonado por tecnologia desde cedo, construo projetos web com foco em aprendizado contínuo e impacto real.',
      accents: ['aprendizado', 'impacto'],
      imageAlt: 'Ilustração de história',
      hero: {
        projectsCta: 'Ver Projetos',
        cvCta: 'Baixar Currículo',
      },
      videoAriaLabel: 'Vídeo de apresentação',
      tabs: {
        achievements: 'Conquistas Profissionais',
        video: 'Vídeo Pitch',
        experience: 'Experiências Profissionais',
        details: 'Minha trajetória',
      },
      moments: {
        heading: 'Momentos',
        labels: ['Na faculdade', 'Com o time', 'Em eventos', 'Na mentoria', 'No dia a dia'],
      },
      achievements: [
        {
          image: ACHIEVEMENT_IMAGES.prouni,
          title: 'Bolsa ProUni Integral',
          description: 'Conquista da bolsa integral ProUni para cursar Análise e Desenvolvimento de Sistemas na FACENS.',
        },
        {
          image: ACHIEVEMENT_IMAGES.mentoria,
          title: 'Mentoria Acadêmica',
          description: 'Atuação como mentor acadêmico na FACENS, auxiliando alunos em algoritmos e programação.',
        },
        {
          image: ACHIEVEMENT_IMAGES.onebitcode,
          title: 'OneBitCode',
          description: 'Estudo continuamente na plataforma OneBitCode, onde tenho acesso vitalício. Utilizo para elevar meu conhecimento em desenvolvimento web e novas tecnologias.',
        },
        {
          image: ACHIEVEMENT_IMAGES.dio,
          title: 'DIO - Bootcamps & Labs',
          description: 'Estou sempre estudando na DIO, onde tenho acesso vitalício. Uso a plataforma para elevar meu conhecimento em desenvolvimento web, backend e novas tecnologias.',
        },
        {
          image: ACHIEVEMENT_IMAGES.origamid,
          title: 'Origamid - Formação Frontend',
          description: 'Sou aluno vitalício da Origamid e sigo estudando para aprimorar minhas habilidades em frontend, UI/UX e novas tecnologias.',
        },
        {
          image: ACHIEVEMENT_IMAGES.udemy,
          title: 'Udemy - Cursos Profissionais',
          description: 'Estou sempre fazendo cursos na Udemy para elevar meu conhecimento em React, Node.js, banco de dados, produtividade e muito mais.',
        },
        {
          image: ACHIEVEMENT_IMAGES.portugues,
          title: 'Português - C1 (Fluente)',
          description: 'Idioma nativo, com domínio completo na comunicação escrita e falada, inclusive em contextos técnicos.',
        },
        {
          image: ACHIEVEMENT_IMAGES.ingles,
          title: 'Inglês (EUA) - B1 (Intermediário)',
          description: 'Estudos no CCBEU e prática constante com documentações técnicas, leitura e comunicação em inglês.',
        },
        {
          image: ACHIEVEMENT_IMAGES.english4tech,
          title: 'English4Tech',
          description: 'Estudo inglês voltado para tecnologia na plataforma English4Tech, aprimorando vocabulário técnico e comunicação em contextos de desenvolvimento.',
        },
        {
          image: ACHIEVEMENT_IMAGES.espanhol,
          title: 'Espanhol - B1 (Intermediário)',
          description: 'Conhecimento intermediário do idioma, aplicado em comunicação e leitura de conteúdos técnicos.',
        },
        {
          image: ACHIEVEMENT_IMAGES.senai,
          title: 'SENAI',
          description: 'Participação em cursos profissionalizantes oferecidos pelo SENAI.',
        },
        {
          image: ACHIEVEMENT_IMAGES.etec,
          title: 'Formação Técnica - ETEC',
          description: 'Conclusão do curso técnico em Análise e Desenvolvimento de Sistemas pela ETEC São Roque.',
        },
        {
          image: ACHIEVEMENT_IMAGES.one,
          title: 'Oracle Next Education',
          description: 'Participação e conclusão de formações do programa Oracle Next Education (ONE).',
        },
        {
          image: ACHIEVEMENT_IMAGES.tec4u,
          title: 'TEC4U Digital',
          description: 'Fui chamado para entrevista de estágio na TEC4U Digital e acabei sendo contratado diretamente como desenvolvedor júnior, atuando em projetos web reais.',
        },
      ],
      experience: [
        {
          logo: EXPERIENCE_LOGOS.tec4u,
          title: 'Desenvolvedor Júnior - Web Developer',
          company: 'TEC4U Digital',
          position: 'Autônomo',
          startDate: 'Ago de 2025',
          endDate: 'Atualmente',
          time: 'O momento',
          location: 'Vila Olímpia, São Paulo, SP, Brasil (Remoto)',
          description: 'Atuo como desenvolvedor júnior em projetos web, auxiliando na criação de interfaces, ajustes de layout e implementação de funcionalidades. A experiência reforça habilidades como organização, colaboração, raciocínio lógico e adaptabilidade.',
        },
        {
          logo: EXPERIENCE_LOGOS.facens,
          title: 'Mentor Acadêmico',
          company: 'FACENS - Centro Universitário',
          position: 'Trainee',
          startDate: 'Mar de 2025',
          endDate: 'Ago de 2025',
          time: '6 meses',
          location: 'Sorocaba, SP, Brasil (Remoto)',
          description: 'Atuei como mentor acadêmico em algoritmos e lógica de programação, auxiliando alunos iniciantes na resolução de exercícios, esclarecimento de dúvidas e desenvolvimento de boas práticas. A experiência reforça habilidades como didática, comunicação, paciência e liderança.',
        },
        {
          logo: EXPERIENCE_LOGOS.viladonpatto,
          title: 'Ajudante de Garçom',
          company: 'Vila Don Patto',
          position: 'Freelance',
          startDate: 'Mai de 2024',
          endDate: 'Mai de 2025',
          time: '1 ano',
          location: 'Catarina Fashion Outlet, São Roque, SP, Brasil (Presencial)',
          description: 'Atuei no atendimento ao cliente em ambiente de alto fluxo, prestando suporte aos garçons na organização das mesas, entrega de pedidos e manutenção do salão. A experiência reforçou habilidades como agilidade, proatividade, trabalho em equipe e atenção aos detalhes.',
        },
        {
          logo: EXPERIENCE_LOGOS.pernambucanas,
          title: 'Assistente Administrativo',
          company: 'CD Pernambucanas',
          position: 'Aprendiz',
          startDate: 'Fev de 2024',
          endDate: 'Ago de 2024',
          time: '7 meses',
          location: 'Araçariguama, SP, Brasil (Presencial)',
          description: 'Atuei no setor de transportes do centro de distribuição, prestando suporte administrativo às operações logísticas, com foco no controle de chaves, emissão de notas fiscais e comunicação com filiais. Durante o período, participei da criação de um novo Painel de Controle de Chaves em 3D e na otimização de planilhas em Excel. A experiência contribuiu para o desenvolvimento de organização, proatividade, noções de logística e comunicação profissional.',
        },
        {
          logo: EXPERIENCE_LOGOS.agropaineiras,
          title: 'Assistente de Vendas',
          company: 'Agro Pecuária Paineiras',
          position: 'Meio Período',
          startDate: 'Jan de 2018',
          endDate: 'Set de 2023',
          time: '6 anos',
          location: 'Araçariguama, SP, Brasil (Presencial)',
          description: 'Atuei no setor de vendas e atendimento ao cliente em um pet shop de médio porte, realizando atendimento no balcão, caixa e telefone, além de apoiar na organização da loja, controle de estoque, recebimento de mercadorias e cuidados básicos com os animais. Desenvolvi habilidades como empatia, responsabilidade, trabalho em equipe e atendimento ao cliente.',
        },
      ],
      highlights: {
        subtitle: 'Conheça a pessoa por trás do código: de onde vim, por onde passei e o que me move.',
        items: [
          {
            id: 'who',
            title: 'Quem sou eu',
            description: 'Me chamo André Vitor, sou desenvolvedor web júnior e estudante de Análise e Desenvolvimento de Sistemas.\n\nGosto de tecnologia, mas gosto ainda mais de gente. Me considero uma boa pessoa: prestativo, curioso e que prefere construir junto. Tudo o que conto aqui é o caminho que me trouxe até este ponto.',
          },
          {
            id: 'start',
            title: 'Meus primeiros passos',
            description: 'Comecei a trabalhar cedo. De 2018 a 2023 atuei em meio período na Agro Pecuária Paineiras, em Araçariguama, atendendo clientes no balcão, no caixa e no telefone, cuidando do estoque e dos animais.\n\nFoi ali que aprendi o valor da responsabilidade, da empatia e de tratar cada pessoa com atenção, lições que levo para o código.',
          },
          {
            id: 'base',
            title: 'A base técnica',
            description: 'Fiz o curso técnico em Análise e Desenvolvimento de Sistemas na ETEC São Roque e participei de cursos profissionalizantes no SENAI e do programa Oracle Next Education.\n\nFoi nessa fase que a curiosidade virou direção: escolhi a tecnologia como caminho e passei a estudar por conta própria em plataformas como OneBitCode, DIO, Origamid e Udemy.',
          },
          {
            id: 'scholarship',
            title: 'A bolsa que abriu portas',
            description: 'Conquistei a bolsa integral do ProUni para cursar o bacharelado em Análise e Desenvolvimento de Sistemas na FACENS.\n\nPara mim foi mais que uma vaga na faculdade: foi a confirmação de que esforço constante abre portas.',
          },
          {
            id: 'areas',
            title: 'Passando por outras áreas',
            description: 'Antes de viver só de tecnologia, passei por áreas bem diferentes. Em 2024 fui aprendiz no setor de transportes do CD Pernambucanas, com logística, notas fiscais e planilhas, e trabalhei como ajudante de garçom na Vila Don Patto, em ambiente de alto fluxo.\n\nEssa bagagem me ensinou organização, agilidade e trabalho em equipe, e me deu uma visão real de como as pessoas e os negócios funcionam.',
          },
          {
            id: 'mentor',
            title: 'Ensinar para aprender',
            description: 'Em 2025 fui mentor acadêmico na FACENS, ajudando alunos iniciantes em algoritmos e lógica de programação.\n\nEnsinar me obrigou a dominar os fundamentos e me mostrou como compartilhar conhecimento faz todo mundo crescer, inclusive quem ensina.',
          },
          {
            id: 'tec4u',
            title: 'Virando dev de verdade',
            description: 'Fui chamado para uma entrevista de estágio na TEC4U Digital e acabei contratado diretamente como desenvolvedor júnior.\n\nHoje atuo em projetos web reais, criando interfaces e funcionalidades, e sigo estudando todos os dias para evoluir.',
          },
          {
            id: 'curiosity',
            title: 'Fora do código',
            description: 'Quando não estou programando, gosto de ler e de jogar. A leitura me ajuda a pensar com calma e a enxergar os problemas por outros ângulos, e os jogos treinam estratégia, paciência e trabalho em equipe.\n\nTambém gosto de aprender coisas novas só por curiosidade, mesmo quando não têm nada a ver com tecnologia.',
          },
          {
            id: 'pillars',
            title: 'O que me move',
            description: 'Meus pilares são a curiosidade, a parceria, a resiliência e a vontade de criar algo útil para as pessoas.\n\nAcredito em aprender sem parar, em construir junto, em não desistir diante de um problema e em usar a tecnologia com propósito. Quero ser lembrado como alguém bom de código e, principalmente, bom de convivência.',
          },
        ],
      },
    },
    reading: {
      menuLabel: 'Estudos',
      menuDescription: 'Prática, experimentos e evolução.',
      menuAccents: ['Prática', 'evolução'],
      title: 'Sobre meus estudos e projetos.',
      body: 'Evoluo na prática: projetos, experimentos e hábitos constantes. Aplico práticas modernas no código do dia a dia, sempre buscando entregar com clareza e qualidade.',
      accents: ['clareza', 'qualidade'],
      imageAlt: 'Ilustração de estudos e projetos',
      studies: {
        heading: 'O que estudo',
        items: [
        { title: 'React', subtitle: 'Interfaces e componentes' },
        { title: 'Node.js', subtitle: 'APIs e back-end' },
        { title: 'TypeScript', subtitle: 'Código mais seguro' },
        { title: 'Banco de dados', subtitle: 'SQL e modelagem' },
        { title: 'UX e UI', subtitle: 'Design centrado no usuário' },
        { title: 'Clean Code', subtitle: 'Código legível e simples' },
        ],
      },
    },
    blog: {
      menuLabel: 'Blog',
      menuDescription: 'Artigos e conteúdos que acho interessantes.',
      menuAccents: ['Artigos', 'conteúdos'],
      title: 'Meu blog.',
      body: 'Aqui eu escrevo sobre o que aprendo e o que acho interessante: artigos, dicas e reflexões sobre tecnologia, código e carreira.',
      accents: ['aprendo', 'interessante'],
      imageAlt: 'Ilustração de um artigo com caneta',
      listHeading: 'Últimos posts',
      empty: 'Nenhum post publicado ainda.',
      readMore: 'Ler artigo',
      backToList: 'Voltar ao blog',
      minRead: 'min de leitura',
      publishedOn: 'Publicado em',
      moreHeading: 'Continue lendo',
    },
    hire: {
      menuLabel: 'Contrato',
      menuDescription: 'Contrate meu serviço por aqui.',
      menuAccents: ['Contrate', 'serviço'],
      title: 'Sobre o contrato.',
      body: 'Aqui você contrata meu serviço de forma direta. Conta o projeto, alinha o prazo e recebe uma proposta.',
      accents: ['contrata', 'proposta'],
      imageAlt: 'Ilustração de contrato',
    },
    contact: {
      menuLabel: 'Contato',
      menuDescription: 'Uma dúvida, um recado.',
      menuAccents: ['dúvida', 'recado'],
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
    news: 'News',
    openNews: 'Open news',
  },
  gate: {
    hireKicker: 'Contract',
    hireTitle: 'Got a project?',
    hireBody:
      'Hire through the contract page: briefing, timeline, and a proposal in one place, with clarity and commitment.',
    hireCta: 'Go to the contract',
    youtubeKicker: 'YouTube',
    youtubeTitle: 'YouTube channel',
    youtubeBody:
      'Lessons, behind the scenes, and what I am building in public. If you want to follow the process, the channel is open.',
    youtubeCta: 'Watch the channel',
    youtubeStudiesCta: 'See more',
    next: 'Next news',
    prev: 'Previous news',
  },
  navHome: {
    label: 'Home',
    description: 'Back to the home page.',
    accents: ['home', 'page'],
  },
  notFound: {
    code: '404',
    title: 'Page not found.',
    titleLines: ['Page not', 'found.'],
    body: 'This address is not part of this portfolio. Head home and browse from the menu.',
    cta: 'Back to home',
  },
  home: {
    heroTitleLines: ['Hi, I am', 'André Vitor.'],
    heroSubtitleLines: [
      'Junior web developer,',
      'from code to user experience.',
    ],
    heroSubtitleAccents: ['code', 'experience'],
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
    blog: {
      ariaLabel: 'Blog',
      titleLines: ['Read my blog and', 'my posts'],
      body: 'A space to record what I learn and share what I find interesting: articles, tips and thoughts on technology, code and career.',
      accents: ['learn', 'interesting'],
      cta: 'My blog',
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
      menuAccents: ['build', 'ship'],
      title: 'About my work.',
      body: 'From the front end to the details of the experience, I build accessible interfaces and products that solve real problems. Here are works, contributions, and results from the journey. The more challenging, the better.',
      accents: ['interfaces', 'challenging'],
      imageAlt: 'Laptop illustration',
      stats: [
        { value: '5+', label: 'Years of Intensive Study', hint: 'Knowledge base!' },
        { value: '12K+', label: 'Hours of Coding', hint: 'Focus and persistence!' },
        { value: '900+', label: 'Total Commits', hint: 'Constant evolution!' },
        { value: '35+', label: 'Repositories on GitHub', hint: 'Open source!' },
        { value: '1.5K+', label: 'Coffees Consumed', hint: 'Energy to code!' },
      ],
      github: {
        heading: 'GitHub Activity',
        yearLast: 'Last Year',
        statsAlt: 'GitHub Statistics',
        langsAlt: 'Most used languages',
        legendLess: 'Less',
        legendMore: 'More',
      },
      gallery: {
        heading: 'Featured projects',
      },
    },
    about: {
      menuLabel: 'About',
      menuDescription: 'Who I am and where I come from.',
      menuAccents: ['Who', 'where'],
      title: 'About my story.',
      body: 'Junior web developer at TEC4U, with a technical foundation from ETEC and an ADS degree at FACENS. Passionate about technology from early on, I build web projects focused on continuous learning and real impact.',
      accents: ['learning', 'impact'],
      imageAlt: 'Story illustration',
      hero: {
        projectsCta: 'See Projects',
        cvCta: 'Download CV',
      },
      videoAriaLabel: 'Introduction video',
      tabs: {
        achievements: 'Professional Achievements',
        video: 'Pitch Video',
        experience: 'Professional Experience',
        details: 'My journey',
      },
      moments: {
        heading: 'Moments',
        labels: ['At college', 'With the team', 'At events', 'Mentoring', 'Day to day'],
      },
      achievements: [
        {
          image: ACHIEVEMENT_IMAGES.prouni,
          title: 'Full ProUni Scholarship',
          description: 'Won a full ProUni scholarship to pursue Systems Analysis and Development at FACENS.',
        },
        {
          image: ACHIEVEMENT_IMAGES.mentoria,
          title: 'Academic Mentoring',
          description: 'Acting as an academic mentor at FACENS, helping students with algorithms and programming.',
        },
        {
          image: ACHIEVEMENT_IMAGES.onebitcode,
          title: 'OneBitCode',
          description: 'Continually studying on the OneBitCode platform, where I have lifetime access. I use it to level up my knowledge in web development and new technologies.',
        },
        {
          image: ACHIEVEMENT_IMAGES.dio,
          title: 'DIO - Bootcamps & Labs',
          description: 'I am always studying at DIO, where I have lifetime access. I use the platform to increase my knowledge in web development, backend, and new technologies.',
        },
        {
          image: ACHIEVEMENT_IMAGES.origamid,
          title: 'Origamid - Frontend Path',
          description: 'I am a lifetime student at Origamid and keep studying to improve my skills in frontend, UI/UX, and new technologies.',
        },
        {
          image: ACHIEVEMENT_IMAGES.udemy,
          title: 'Udemy - Professional Courses',
          description: 'I am always taking courses on Udemy to level up my knowledge in React, Node.js, databases, productivity, and more.',
        },
        {
          image: ACHIEVEMENT_IMAGES.portugues,
          title: 'Portuguese - C1 (Fluent)',
          description: 'Native language, with full fluency in written and spoken communication, including technical contexts.',
        },
        {
          image: ACHIEVEMENT_IMAGES.ingles,
          title: 'English (US) - B1 (Intermediate)',
          description: 'Studies at CCBEU and constant practice with technical documentation, reading, and communication in English.',
        },
        {
          image: ACHIEVEMENT_IMAGES.english4tech,
          title: 'English4Tech',
          description: 'Studying tech-focused English on the English4Tech platform, sharpening technical vocabulary and communication in development contexts.',
        },
        {
          image: ACHIEVEMENT_IMAGES.espanhol,
          title: 'Spanish - B1 (Intermediate)',
          description: 'Intermediate knowledge of the language, applied to communication and reading technical content.',
        },
        {
          image: ACHIEVEMENT_IMAGES.senai,
          title: 'SENAI',
          description: 'Participation in professional training courses offered by SENAI.',
        },
        {
          image: ACHIEVEMENT_IMAGES.etec,
          title: 'Technical Training - ETEC',
          description: 'Completed the technical course in Systems Analysis and Development from ETEC São Roque.',
        },
        {
          image: ACHIEVEMENT_IMAGES.one,
          title: 'Oracle Next Education',
          description: 'Participation and completion of training courses from the Oracle Next Education (ONE) program.',
        },
        {
          image: ACHIEVEMENT_IMAGES.tec4u,
          title: 'TEC4U Digital',
          description: 'I was called for an internship interview at TEC4U Digital and ended up being hired directly as a junior developer, working on real web projects.',
        },
      ],
      experience: [
        {
          logo: EXPERIENCE_LOGOS.tec4u,
          title: 'Junior Web Developer',
          company: 'TEC4U Digital',
          position: 'Freelance',
          startDate: 'Aug 2025',
          endDate: 'Present',
          time: 'Current',
          location: 'Vila Olímpia, São Paulo, SP, Brazil (Remote)',
          description: 'I work as a junior web developer, assisting in interface creation, layout adjustments, and feature implementation. This experience reinforces skills like organization, collaboration, logic, and adaptability.',
        },
        {
          logo: EXPERIENCE_LOGOS.facens,
          title: 'Academic Mentor',
          company: 'FACENS - University Center',
          position: 'Trainee',
          startDate: 'Mar 2025',
          endDate: 'Aug 2025',
          time: '6 months',
          location: 'Sorocaba, SP, Brazil (Remote)',
          description: 'I acted as an academic mentor in algorithms and programming logic, helping beginners with exercises, clarifying doubts, and developing best practices. This experience fosters skills like teaching, communication, patience, and leadership.',
        },
        {
          logo: EXPERIENCE_LOGOS.viladonpatto,
          title: 'Waiter Assistant',
          company: 'Vila Don Patto',
          position: 'Freelance',
          startDate: 'May 2024',
          endDate: 'May 2025',
          time: '1 year',
          location: 'Catarina Fashion Outlet, São Roque, SP, Brazil (On-site)',
          description: 'I worked in customer service in a high-flow environment, supporting waiters in table organization, order delivery, and lounge maintenance. This experience reinforced skills like agility, proactivity, teamwork, and attention to detail.',
        },
        {
          logo: EXPERIENCE_LOGOS.pernambucanas,
          title: 'Administrative Assistant',
          company: 'CD Pernambucanas',
          position: 'Apprentice',
          startDate: 'Feb 2024',
          endDate: 'Aug 2024',
          time: '7 months',
          location: 'Araçariguama, SP, Brazil (On-site)',
          description: 'I worked in the distribution center transport sector, providing administrative support to logistics operations, focusing on key control, invoice issuance, and communication with branches. During this period, I participated in the creation of a new 3D Key Control Panel and sheet optimization in Excel. This experience developed organization, proactivity, logistics concepts, and professional communication.',
        },
        {
          logo: EXPERIENCE_LOGOS.agropaineiras,
          title: 'Sales Assistant',
          company: 'Agro Pecuária Paineiras',
          position: 'Part-time',
          startDate: 'Jan 2018',
          endDate: 'Sep 2023',
          time: '6 years',
          location: 'Araçariguama, SP, Brazil (On-site)',
          description: 'Worked in sales and customer service at a mid-sized pet shop, performing counter, cashier, and telephone service, as well as supporting store organization, stock control, receiving goods, and basic animal care. Developed empathy, responsibility, teamwork, and customer service skills.',
        },
      ],
      highlights: {
        subtitle: 'Meet the person behind the code: where I come from, where I have been and what drives me.',
        items: [
          {
            id: 'who',
            title: 'Who I am',
            description: 'My name is André Vitor. I am a junior web developer and a Systems Analysis and Development student.\n\nI like technology, but I like people even more. I consider myself a good person: helpful, curious, and someone who prefers building together. Everything I share here is the path that brought me to this point.',
          },
          {
            id: 'start',
            title: 'My first steps',
            description: 'I started working early. From 2018 to 2023 I worked part-time at Agro Pecuária Paineiras, in Araçariguama, serving customers at the counter, the register and by phone, and taking care of stock and animals.\n\nThat is where I learned the value of responsibility, empathy and giving every person real attention, lessons I carry into my code.',
          },
          {
            id: 'base',
            title: 'The technical foundation',
            description: 'I completed the technical course in Systems Analysis and Development at ETEC São Roque and took professional courses at SENAI and in the Oracle Next Education program.\n\nThat is when curiosity became direction: I chose technology as my path and started studying on my own on platforms like OneBitCode, DIO, Origamid and Udemy.',
          },
          {
            id: 'scholarship',
            title: 'The scholarship that opened doors',
            description: 'I earned a full ProUni scholarship to study the bachelor\'s degree in Systems Analysis and Development at FACENS.\n\nFor me it was more than a seat in college: it confirmed that steady effort opens doors.',
          },
          {
            id: 'areas',
            title: 'Passing through other fields',
            description: 'Before living on technology alone, I went through very different fields. In 2024 I was an apprentice in the transport sector at CD Pernambucanas, working with logistics, invoices and spreadsheets, and I worked as a waiter\'s assistant at Vila Don Patto, in a high-traffic environment.\n\nThat background taught me organization, agility and teamwork, and gave me a real view of how people and businesses work.',
          },
          {
            id: 'mentor',
            title: 'Teaching to learn',
            description: 'In 2025 I was an academic mentor at FACENS, helping beginner students with algorithms and programming logic.\n\nTeaching forced me to master the fundamentals and showed me how sharing knowledge makes everyone grow, including the one who teaches.',
          },
          {
            id: 'tec4u',
            title: 'Becoming a real dev',
            description: 'I was called for an internship interview at TEC4U Digital and ended up hired directly as a junior developer.\n\nToday I work on real web projects, building interfaces and features, and I keep studying every day to grow.',
          },
          {
            id: 'curiosity',
            title: 'Outside of code',
            description: 'When I am not programming, I like to read and to play games. Reading helps me think calmly and see problems from other angles, and games train strategy, patience and teamwork.\n\nI also like learning new things out of pure curiosity, even when they have nothing to do with technology.',
          },
          {
            id: 'pillars',
            title: 'What drives me',
            description: 'My pillars are curiosity, partnership, resilience and the will to create something useful for people.\n\nI believe in learning non-stop, in building together, in not giving up in front of a problem and in using technology with purpose. I want to be remembered as someone good at code and, above all, good to be around.',
          },
        ],
      },
    },
    reading: {
      menuLabel: 'Studies',
      menuDescription: 'Practice, experiments, and growth.',
      menuAccents: ['Practice', 'growth'],
      title: 'About my studies and projects.',
      body: 'I grow by doing: projects, experiments, and steady habits. I apply modern practices in day-to-day code, always aiming to ship with clarity and quality.',
      accents: ['clarity', 'quality'],
      imageAlt: 'Studies and projects illustration',
      studies: {
        heading: 'What I study',
        items: [
        { title: 'React', subtitle: 'Interfaces and components' },
        { title: 'Node.js', subtitle: 'APIs and back end' },
        { title: 'TypeScript', subtitle: 'Safer code' },
        { title: 'Databases', subtitle: 'SQL and modeling' },
        { title: 'UX and UI', subtitle: 'User-centered design' },
        { title: 'Clean Code', subtitle: 'Readable, simple code' },
        ],
      },
    },
    blog: {
      menuLabel: 'Blog',
      menuDescription: 'Articles and content I find interesting.',
      menuAccents: ['Articles', 'content'],
      title: 'My blog.',
      body: 'Here I write about what I learn and what I find interesting: articles, tips and thoughts on technology, code and career.',
      accents: ['learn', 'interesting'],
      imageAlt: 'Illustration of an article with a pen',
      listHeading: 'Latest posts',
      empty: 'No posts published yet.',
      readMore: 'Read article',
      backToList: 'Back to the blog',
      minRead: 'min read',
      publishedOn: 'Published on',
      moreHeading: 'Keep reading',
    },
    hire: {
      menuLabel: 'Contract',
      menuDescription: 'Hire my service from here.',
      menuAccents: ['Hire', 'service'],
      title: 'About the contract.',
      body: 'This is where you hire my service directly. Share the project, align the timeline, and get a proposal.',
      accents: ['hire', 'proposal'],
      imageAlt: 'Contract illustration',
    },
    contact: {
      menuLabel: 'Contact',
      menuDescription: 'A hello, a question, a note.',
      menuAccents: ['question', 'note'],
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
    themeLight: 'Cambiar al tema claro',
    themeDark: 'Cambiar al tema oscuro',
    copyrightLine1: 'Derechos de autor © 2024 - 2026 andrevitordev.vercel.app',
    copyrightLine2: 'Todos los derechos reservados.',
    backToTop: 'Volver arriba',
    loading: 'Cargando',
    news: 'Novedades',
    openNews: 'Abrir novedades',
  },
  gate: {
    hireKicker: 'Contrato',
    hireTitle: '¿Tienes un proyecto?',
    hireBody:
      'Contrata desde la página de contrato: briefing, plazo y propuesta en el mismo lugar, con claridad y compromiso.',
    hireCta: 'Ir al contrato',
    youtubeKicker: 'YouTube',
    youtubeTitle: 'Canal de YouTube',
    youtubeBody:
      'Clases, detrás de cámaras y lo que estoy construyendo en público. Si quieres seguir el proceso, el canal está abierto.',
    youtubeCta: 'Ver el canal',
    youtubeStudiesCta: 'Ver más',
    next: 'Siguiente novedad',
    prev: 'Novedad anterior',
  },
  navHome: {
    label: 'Home',
    description: 'Volver a la página de inicio.',
    accents: ['página', 'inicio'],
  },
  notFound: {
    code: '404',
    title: 'Página no encontrada.',
    titleLines: ['Página no', 'encontrada.'],
    body: 'Esta dirección no existe en este portafolio. Vuelve a la home y sigue por el menú.',
    cta: 'Volver a la home',
  },
  home: {
    heroTitleLines: ['Hola, soy', 'André Vitor.'],
    heroSubtitleLines: [
      'Desarrollador web junior,',
      'del código a la experiencia del usuario.',
    ],
    heroSubtitleAccents: ['código', 'experiencia'],
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
    blog: {
      ariaLabel: 'Blog',
      titleLines: ['Lee mi blog y', 'mis posts'],
      body: 'Un espacio para registrar lo que aprendo y compartir lo que me parece interesante: artículos, consejos y reflexiones sobre tecnología, código y carrera.',
      accents: ['aprendo', 'interesante'],
      cta: 'Mi blog',
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
      menuAccents: ['construyo', 'entrego'],
      title: 'Sobre mi trabajo.',
      body: 'Del front al detalle de la experiencia, construyo interfaces accesibles y productos que resuelven problemas de verdad. Aquí están trabajos, contribuciones y resultados del camino. Cuanto más desafiante, mejor.',
      accents: ['interfaces', 'desafiante'],
      imageAlt: 'Ilustración de notebook',
      stats: [
        { value: '5+', label: 'Años de Estudio Intensivo', hint: '¡Base de conocimiento!' },
        { value: '12K+', label: 'Horas de Codificación', hint: '¡Enfoque y persistencia!' },
        { value: '900+', label: 'Total de Commits', hint: '¡Evolución constante!' },
        { value: '35+', label: 'Repositorios en GitHub', hint: '¡Código abierto!' },
        { value: '1,5K+', label: 'Cafés Consumidos', hint: '¡Energía para codificar!' },
      ],
      github: {
        heading: 'Actividad en GitHub',
        yearLast: 'Último Año',
        statsAlt: 'Estadísticas de GitHub',
        langsAlt: 'Lenguajes más usados',
        legendLess: 'Menos',
        legendMore: 'Más',
      },
      gallery: {
        heading: 'Proyectos destacados',
      },
    },
    about: {
      menuLabel: 'Sobre',
      menuDescription: 'Quién soy y de dónde vengo.',
      menuAccents: ['soy', 'vengo'],
      title: 'Sobre mi historia.',
      body: 'Desarrollador web junior en TEC4U, con base técnica en la ETEC y graduación en ADS en FACENS. Apasionado por la tecnología desde temprano, construyo proyectos web con foco en aprendizaje continuo e impacto real.',
      accents: ['aprendizaje', 'impacto'],
      imageAlt: 'Ilustración de historia',
      hero: {
        projectsCta: 'Ver Proyectos',
        cvCta: 'Descargar CV',
      },
      videoAriaLabel: 'Vídeo de presentación',
      tabs: {
        achievements: 'Logros Profesionales',
        video: 'Vídeo Pitch',
        experience: 'Experiencias Profesionales',
        details: 'Mi trayectoria',
      },
      moments: {
        heading: 'Momentos',
        labels: ['En la universidad', 'Con el equipo', 'En eventos', 'En la mentoría', 'Del día a día'],
      },
      achievements: [
        {
          image: ACHIEVEMENT_IMAGES.prouni,
          title: 'Beca ProUni Integral',
          description: 'Obtención de la beca integral ProUni para cursar Análisis y Desarrollo de Sistemas en FACENS.',
        },
        {
          image: ACHIEVEMENT_IMAGES.mentoria,
          title: 'Mentoría Académica',
          description: 'Desempeño como mentor académico en FACENS, ayudando a estudiantes en algoritmos y programación.',
        },
        {
          image: ACHIEVEMENT_IMAGES.onebitcode,
          title: 'OneBitCode',
          description: 'Estudio continuamente en la plataforma OneBitCode, donde tengo acceso de por vida. La utilizo para elevar mi conocimiento en desarrollo web y nuevas tecnologías.',
        },
        {
          image: ACHIEVEMENT_IMAGES.dio,
          title: 'DIO - Bootcamps & Labs',
          description: 'Siempre estudio en DIO, donde tengo acceso de por vida. Uso la plataforma para aumentar mi conocimiento en desarrollo web, backend y nuevas tecnologías.',
        },
        {
          image: ACHIEVEMENT_IMAGES.origamid,
          title: 'Origamid - Formación Frontend',
          description: 'Soy alumno de por vida de Origamid y sigo estudiando para mejorar mis habilidades en frontend, UI/UX y nuevas tecnologías.',
        },
        {
          image: ACHIEVEMENT_IMAGES.udemy,
          title: 'Udemy - Cursos Profesionales',
          description: 'Siempre realizo cursos en Udemy para elevar mi conocimiento en React, Node.js, bases de datos, productividad y mucho más.',
        },
        {
          image: ACHIEVEMENT_IMAGES.portugues,
          title: 'Portugués - C1 (Fluido)',
          description: 'Idioma nativo, con dominio completo en la comunicación escrita y hablada, incluso en contextos técnicos.',
        },
        {
          image: ACHIEVEMENT_IMAGES.ingles,
          title: 'Inglés (EE. UU.) - B1 (Intermedio)',
          description: 'Estudios en CCBEU y práctica constante con documentación técnica, lectura y comunicación en inglés.',
        },
        {
          image: ACHIEVEMENT_IMAGES.english4tech,
          title: 'English4Tech',
          description: 'Estudio inglés enfocado en tecnología en la plataforma English4Tech, mejorando el vocabulario técnico y la comunicación en contextos de desarrollo.',
        },
        {
          image: ACHIEVEMENT_IMAGES.espanhol,
          title: 'Español - B1 (Intermedio)',
          description: 'Conocimiento intermedio del idioma, aplicado en comunicación y lectura de contenido técnico.',
        },
        {
          image: ACHIEVEMENT_IMAGES.senai,
          title: 'SENAI',
          description: 'Participación en cursos profesionales ofrecidos por el SENAI.',
        },
        {
          image: ACHIEVEMENT_IMAGES.etec,
          title: 'Formación Técnica - ETEC',
          description: 'Finalización de la carrera técnica en Análisis y Desarrollo de Sistemas por ETEC São Roque.',
        },
        {
          image: ACHIEVEMENT_IMAGES.one,
          title: 'Oracle Next Education',
          description: 'Participación y finalización de formaciones del programa Oracle Next Education (ONE).',
        },
        {
          image: ACHIEVEMENT_IMAGES.tec4u,
          title: 'TEC4U Digital',
          description: 'Fui llamado para una entrevista de prácticas en TEC4U Digital y terminé siendo contratado directamente como desarrollador júnior, trabajando en proyectos web reales.',
        },
      ],
      experience: [
        {
          logo: EXPERIENCE_LOGOS.tec4u,
          title: 'Desarrollador Júnior - Web Developer',
          company: 'TEC4U Digital',
          position: 'Freelance',
          startDate: 'Ago de 2025',
          endDate: 'Actualidad',
          time: 'Al momento',
          location: 'Vila Olímpia, São Paulo, SP, Brasil (Remoto)',
          description: 'Actúo como desarrollador júnior en proyectos web, ayudando en la creación de interfaces, ajustes de diseño e implementación de funcionalidades. La experiencia refuerza habilidades como organización, colaboración, razonamiento lógico y adaptabilidad.',
        },
        {
          logo: EXPERIENCE_LOGOS.facens,
          title: 'Mentor Académico',
          company: 'FACENS - Centro Universitario',
          position: 'Trainee',
          startDate: 'Mar de 2025',
          endDate: 'Ago de 2025',
          time: '6 meses',
          location: 'Sorocaba, SP, Brasil (Remoto)',
          description: 'Actué como mentor académico en algoritmos y lógica de programación, ayudando a alumnos principiantes en la resolución de ejercicios, aclaración de dudas y desarrollo de buenas prácticas. La experiencia refuerza habilidades como la didáctica, la comunicación, la paciencia y el liderazgo.',
        },
        {
          logo: EXPERIENCE_LOGOS.viladonpatto,
          title: 'Ayudante de Camarero',
          company: 'Vila Don Patto',
          position: 'Freelance',
          startDate: 'May de 2024',
          endDate: 'May de 2025',
          time: '1 año',
          location: 'Catarina Fashion Outlet, São Roque, SP, Brasil (Presencial)',
          description: 'Actué en la atención al cliente en un ambiente de alto flujo, prestando soporte a los camareros en la organización de las mesas, entrega de pedidos y mantenimiento del salón. La experiencia reforzó habilidades como la agilidad, la proactividad, el trabajo en equipo y la atención a los detalles.',
        },
        {
          logo: EXPERIENCE_LOGOS.pernambucanas,
          title: 'Asistente Administrativo',
          company: 'CD Pernambucanas',
          position: 'Aprendiz',
          startDate: 'Feb de 2024',
          endDate: 'Ago de 2024',
          time: '7 meses',
          location: 'Araçariguama, SP, Brasil (Presencial)',
          description: 'Actué en el sector de transportes del centro de distribución, prestando apoyo administrativo a las operaciones logísticas, con foco en el control de llaves, emisión de facturas y comunicación con sucursales. Durante el periodo, participé en la creación de un nuevo Panel de Control de Llaves en 3D y en la optimización de hojas de cálculo en Excel. La experiencia contribuyó al desarrollo de organización, proactividad, nociones de logística y comunicación profesional.',
        },
        {
          logo: EXPERIENCE_LOGOS.agropaineiras,
          title: 'Asistente de Ventas',
          company: 'Agro Pecuária Paineiras',
          position: 'Medio Tiempo',
          startDate: 'Ene de 2018',
          endDate: 'Sep de 2023',
          time: '6 años',
          location: 'Araçariguama, SP, Brasil (Presencial)',
          description: 'Actué en el sector de ventas y atención al cliente en una tienda de mascotas mediana, realizando atención en el mostrador, caja y teléfono, además de apoyar en la organización de la tienda, control de inventario, recepción de mercancías y cuidados básicos con los animales. Desarrollé habilidades como empatía, responsabilidad, trabajo en equipo y atención al cliente.',
        },
      ],
      highlights: {
        subtitle: 'Conoce a la persona detrás del código: de dónde vengo, por dónde pasé y qué me mueve.',
        items: [
          {
            id: 'who',
            title: 'Quién soy',
            description: 'Me llamo André Vitor, soy desarrollador web junior y estudiante de Análisis y Desarrollo de Sistemas.\n\nMe gusta la tecnología, pero me gustan aún más las personas. Me considero una buena persona: servicial, curioso y alguien que prefiere construir en equipo. Todo lo que cuento aquí es el camino que me trajo hasta este punto.',
          },
          {
            id: 'start',
            title: 'Mis primeros pasos',
            description: 'Empecé a trabajar temprano. De 2018 a 2023 trabajé a tiempo parcial en Agro Pecuária Paineiras, en Araçariguama, atendiendo clientes en el mostrador, en la caja y por teléfono, y cuidando el stock y los animales.\n\nAllí aprendí el valor de la responsabilidad, la empatía y de tratar a cada persona con atención, lecciones que llevo al código.',
          },
          {
            id: 'base',
            title: 'La base técnica',
            description: 'Hice el curso técnico en Análisis y Desarrollo de Sistemas en la ETEC São Roque y participé en cursos profesionales del SENAI y del programa Oracle Next Education.\n\nEn esa etapa la curiosidad se volvió dirección: elegí la tecnología como camino y empecé a estudiar por mi cuenta en plataformas como OneBitCode, DIO, Origamid y Udemy.',
          },
          {
            id: 'scholarship',
            title: 'La beca que abrió puertas',
            description: 'Conseguí la beca integral del ProUni para cursar la licenciatura en Análisis y Desarrollo de Sistemas en la FACENS.\n\nPara mí fue más que un lugar en la universidad: fue la confirmación de que el esfuerzo constante abre puertas.',
          },
          {
            id: 'areas',
            title: 'Pasando por otras áreas',
            description: 'Antes de vivir solo de tecnología, pasé por áreas muy distintas. En 2024 fui aprendiz en el sector de transporte del CD Pernambucanas, con logística, facturas y hojas de cálculo, y trabajé como ayudante de camarero en Vila Don Patto, en un entorno de mucho flujo.\n\nEsa experiencia me enseñó organización, agilidad y trabajo en equipo, y me dio una visión real de cómo funcionan las personas y los negocios.',
          },
          {
            id: 'mentor',
            title: 'Enseñar para aprender',
            description: 'En 2025 fui mentor académico en la FACENS, ayudando a estudiantes principiantes en algoritmos y lógica de programación.\n\nEnseñar me obligó a dominar los fundamentos y me mostró cómo compartir conocimiento hace crecer a todos, incluso a quien enseña.',
          },
          {
            id: 'tec4u',
            title: 'Convirtiéndome en dev de verdad',
            description: 'Me llamaron para una entrevista de prácticas en TEC4U Digital y terminé contratado directamente como desarrollador junior.\n\nHoy trabajo en proyectos web reales, creando interfaces y funcionalidades, y sigo estudiando todos los días para evolucionar.',
          },
          {
            id: 'curiosity',
            title: 'Fuera del código',
            description: 'Cuando no estoy programando, me gusta leer y jugar. La lectura me ayuda a pensar con calma y a ver los problemas desde otros ángulos, y los juegos entrenan estrategia, paciencia y trabajo en equipo.\n\nTambién me gusta aprender cosas nuevas solo por curiosidad, incluso cuando no tienen nada que ver con la tecnología.',
          },
          {
            id: 'pillars',
            title: 'Lo que me mueve',
            description: 'Mis pilares son la curiosidad, la colaboración, la resiliencia y las ganas de crear algo útil para las personas.\n\nCreo en aprender sin parar, en construir en equipo, en no rendirme ante un problema y en usar la tecnología con propósito. Quiero que me recuerden como alguien bueno con el código y, sobre todo, bueno para convivir.',
          },
        ],
      },
    },
    reading: {
      menuLabel: 'Estudios',
      menuDescription: 'Práctica, experimentos y evolución.',
      menuAccents: ['Práctica', 'evolución'],
      title: 'Sobre mis estudios y proyectos.',
      body: 'Evoluciono en la práctica: proyectos, experimentos y hábitos constantes. Aplico prácticas modernas en el código del día a día, siempre buscando entregar con claridad y calidad.',
      accents: ['claridad', 'calidad'],
      imageAlt: 'Ilustración de estudios y proyectos',
      studies: {
        heading: 'Lo que estudio',
        items: [
        { title: 'React', subtitle: 'Interfaces y componentes' },
        { title: 'Node.js', subtitle: 'APIs y back end' },
        { title: 'TypeScript', subtitle: 'Código más seguro' },
        { title: 'Bases de datos', subtitle: 'SQL y modelado' },
        { title: 'UX y UI', subtitle: 'Diseño centrado en el usuario' },
        { title: 'Clean Code', subtitle: 'Código legible y simple' },
        ],
      },
    },
    blog: {
      menuLabel: 'Blog',
      menuDescription: 'Artículos y contenidos que me parecen interesantes.',
      menuAccents: ['Artículos', 'contenidos'],
      title: 'Mi blog.',
      body: 'Aquí escribo sobre lo que aprendo y lo que me parece interesante: artículos, consejos y reflexiones sobre tecnología, código y carrera.',
      accents: ['aprendo', 'interesante'],
      imageAlt: 'Ilustración de un artículo con una pluma',
      listHeading: 'Últimos posts',
      empty: 'Aún no hay posts publicados.',
      readMore: 'Leer artículo',
      backToList: 'Volver al blog',
      minRead: 'min de lectura',
      publishedOn: 'Publicado el',
      moreHeading: 'Sigue leyendo',
    },
    hire: {
      menuLabel: 'Contrato',
      menuDescription: 'Contrata mi servicio por aquí.',
      menuAccents: ['Contrata', 'servicio'],
      title: 'Sobre el contrato.',
      body: 'Aquí contratas mi servicio de forma directa. Cuentas el proyecto, alineas el plazo y recibes una propuesta.',
      accents: ['contratas', 'propuesta'],
      imageAlt: 'Ilustración de contrato',
    },
    contact: {
      menuLabel: 'Contacto',
      menuDescription: 'Una duda, un recado.',
      menuAccents: ['duda', 'recado'],
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
