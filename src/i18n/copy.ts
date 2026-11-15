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
  achievements: readonly AchievementEntry[]
  experience: readonly ExperienceEntry[]
  highlights: {
    subtitle: string
    items: readonly HighlightEntry[]
  }
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
    hire: SpotCopy
    contact: SpotCopy
  }
  pages: {
    work: WorkPageCopy
    about: AboutPageCopy
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
        details: 'Mergulhando nos Detalhes',
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
        subtitle: 'Descubra o que me motiva e quais são meus principais diferenciais como desenvolvedor.',
        items: [
          {
            id: 'learning',
            title: 'Sempre um passo à frente',
            description: 'Minha rotina é movida pela curiosidade. Além da faculdade na FACENS, dedico boa parte do meu tempo livre explorando plataformas como OneBitCode e Alura, mergulhando de cabeça em novas stacks que podem otimizar meu fluxo de trabalho.\n\nAcredito que o setor tech não permite estagnação. Por isso, não estudo apenas por estudo; aplico cada conceito novo em projetos reais, transformando teoria em soluções práticas.\n\nPara mim, aprender é um processo contínuo e sem fim.',
          },
          {
            id: 'teamwork',
            title: 'Construir junto é melhor',
            description: 'Acredito que o software é um esforço coletivo. No meu dia a dia, valorizo a troca honesta de ideias, revisões de código construtivas e a colaboração direta com designers e outros devs para garantir que estamos todos na mesma página. Gosto de ser o elo que facilita a comunicação técnica, garantindo que a entrega final supere a expectativa inicial.\n\nUm time forte é o que cresce unido.',
          },
          {
            id: 'resilience',
            title: 'Foco total na solução',
            description: 'Minha trajetória me ensinou que a resiliência é a chave. Encaro bugs bizarros e prazos apertados como quebra-cabeças que só precisam de paciência e a estratégia certa para serem resolvidos.\n\nManter a calma sob pressão é uma das minhas maiores forças. Seja ajustando um layout complexo na Nuvemshop ou depurando uma lógica de backend, eu não desisto até que a solução esteja rodando perfeitamente e o usuário esteja satisfeito. Desafios são apenas degraus para o sucesso.',
          },
          {
            id: 'tech',
            title: 'Tecnologia com propósito',
            description: "Sou fascinado pelo poder que algumas linhas de código têm de transformar negócios. Meu foco é dominar as ferramentas que fazem a diferença, como React e Tailwind CSS, sempre de olho no que há de mais moderno no ecossistema web. Não me limito apenas a 'fazer funcionar'. Busco entender o 'porquê' por trás de cada tecnologia, garantindo que as escolhas técnicas que tomo hoje criem uma base sólida para o crescimento do projeto amanhã.",
          },
          {
            id: 'versatility',
            title: 'Minha visão real do 360°',
            description: "Minha bagagem vai além das telas.\n\nAntes de mergulhar de vez na tecnologia, passei por áreas como logística e vendas. Essa vivência me deu uma visão muito clara de como os negócios funcionam no 'mundo real', o que me ajuda a traduzir necessidades reais de mercado em código funcional. Entendo o lado do cliente, a pressa do setor de transportes e a precisão do atendimento.\n\nSou um dev que entende de gente tanto quanto entende de sintaxe.",
          },
          {
            id: 'mentoring',
            title: 'Multiplicar para crescer',
            description: 'Ter atuado como mentor acadêmico na FACENS foi uma das experiências mais marcantes da minha trajetória. Ensinar algoritmos para quem estava começando me forçou a dominar os fundamentos e a exercitar a didática de forma constante.\n\nMesmo hoje, vejo a liderança e o compartilhamento de conhecimento como pilares fundamentais. Dividir o que sei com meus colegas e amigos não só os ajuda a superar obstáculos, mas também solidifica meu próprio aprendizado e cria um ambiente muito mais forte para todos.',
          },
          {
            id: 'clean_code',
            title: 'Código feito para humanos',
            description: "Escrever código é, acima de tudo, um ato de comunicação. Minha prioridade é entregar soluções que não apenas resolvam o problema técnico, mas que sejam legíveis e fáceis de manter por qualquer desenvolvedor que chegue depois de mim. Um código 'sujo' é uma dívida que ninguém quer pagar.\n\nSigo os princípios do Clean Code por eficiência, não apenas por teoria. Um código bem estruturado hoje significa menos dor de cabeça amanhã e uma evolução muito mais rápida para o produto.",
          },
          {
            id: 'ux_vision',
            title: 'O usuário no centro',
            description: 'Software sem uma boa UX é software incompleto.\n\nBusco entender profundamente a jornada de quem vai usar o que estou construindo. Trabalho de perto para transformar protótipos em interfaces vivas e fluidas, garantindo que a tecnologia seja invisível e a facilidade de uso seja o destaque. Meu objetivo final é sempre encantar o usuário com uma experiência impecável.',
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
        details: 'Diving into the Details',
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
        subtitle: 'Discover what motivates me and what makes me stand out as a developer.',
        items: [
          {
            id: 'learning',
            title: 'Always one step ahead',
            description: "My routine is driven by curiosity. Beyond my college studies at FACENS, I spend much of my free time exploring platforms like OneBitCode and Alura, diving deep into new stacks that can optimize my workflow.\n\nI believe the tech sector doesn't allow for stagnation. That's why I don't just study for the sake of it; I apply every new concept to real projects, turning theory into practical solutions.\n\nTo me, learning is a continuous and endless process.",
          },
          {
            id: 'teamwork',
            title: 'Building together is better',
            description: "I believe software is a collective effort. In my day-to-day life, I value honest idea exchanges, constructive code reviews, and direct collaboration with designers and other devs to ensure we're all on the same page. I enjoy being the link that facilitates technical communication, ensuring the final delivery exceeds the initial expectation.\n\nA strong team is the one that grows together.",
          },
          {
            id: 'resilience',
            title: 'Total focus on the solution',
            description: "My path has taught me that resilience is the key. I face bizarre bugs and tight deadlines as puzzles that just need patience and the right strategy to be solved.\n\nStaying calm under pressure is one of my greatest strengths. Whether it's adjusting a complex layout in Nuvemshop or debugging backend logic, I don't give up until the solution is running perfectly and the user is satisfied. Challenges are just stepping stones to success.",
          },
          {
            id: 'tech',
            title: 'Technology with purpose',
            description: "I am fascinated by the power that a few lines of code have to transform businesses. My focus is on mastering the tools that make a difference, like React and Tailwind CSS, always keeping an eye on the latest trends in the web ecosystem. I don't limit myself to just 'making it work.' I seek to understand the 'why' behind each technology, ensuring that the technical choices I make today create a solid foundation for the project's growth tomorrow.",
          },
          {
            id: 'versatility',
            title: 'My real 360° vision',
            description: "My background goes beyond the screens.\n\nBefore diving fully into technology, I worked in areas like logistics and sales. This experience gave me a very clear view of how businesses operate in the 'real world,' which helps me translate real market needs into functional code. I understand the customer side, the urgency of the transport sector, and the precision of customer service.\n\nI'm a dev who understands people as much as I understand syntax.",
          },
          {
            id: 'mentoring',
            title: 'Multiply to grow',
            description: 'Having served as an academic mentor at FACENS was one of the most significant experiences of my career. Teaching algorithms to beginners forced me to master the fundamentals and practice teaching on a regular basis.\n\nEven today, I see leadership and knowledge sharing as fundamental pillars. Sharing what I know with my colleagues and friends not only helps them overcome obstacles but also solidifies my own learning and creates a much stronger environment for everyone.',
          },
          {
            id: 'clean_code',
            title: 'Code made for humans',
            description: "Writing code is, above all, an act of communication. My priority is to deliver solutions that not only solve the technical problem but are also readable and easy to maintain by any developer who arrives after me. 'Dirty' code is a debt no one wants to pay.\n\nI follow Clean Code principles for efficiency, not just theory. Well-structured code today means fewer headaches tomorrow and much faster evolution for the product.",
          },
          {
            id: 'ux_vision',
            title: 'The user at the center',
            description: "Software without good UX is incomplete software.\n\nI seek to deeply understand the journey of whoever will use what I'm building. I work closely to turn prototypes into living, fluid interfaces, ensuring technology is invisible and ease of use is the highlight. My final goal is always to delight the user with a flawless experience.",
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
        details: 'Sumergiéndome en los Detalles',
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
        subtitle: 'Descubre qué me motiva y cuáles son mis principales diferencias como desarrollador.',
        items: [
          {
            id: 'learning',
            title: 'Siempre un paso adelante',
            description: 'Mi rutina está impulsada por la curiosidad. Más allá de mi carrera en FACENS, dedico gran parte de mi tiempo libre a explorar plataformas como OneBitCode y Alura, sumergiéndome en herramientas que puedan optimizar mi flujo de trabajo.\n\nCreo que el sector tecnológico no permite el estancamiento. Por eso, no estudio solo por estudiar; aplico cada nuevo concepto en proyectos reales, transformando la teoría en soluciones prácticas.\n\nPara mí, aprender es un proceso continuo y sin fin.',
          },
          {
            id: 'teamwork',
            title: 'Construir juntos es mejor',
            description: 'Creo que el software es un esfuerzo colectivo. En mi día a día, valoro el intercambio honesto de ideas, las revisiones de código constructivas y la colaboración directa con diseñadores y otros desarrolladores para asegurar que todos estemos en la misma página. Me gusta ser el vínculo que facilita la comunicación técnica, asegurando que la entrega final supere la expectativa inicial.\n\nUn equipo fuerte es el que crece unido.',
          },
          {
            id: 'resilience',
            title: 'Foco total en la solución',
            description: 'Mi trayectoria me ha enseñado que la resiliencia es clave. Enfrento errores extraños y plazos ajustados como rompecabezas que solo necesitan paciencia y la estrategia adecuada para resolverse.\n\nMantener la calma bajo presión es una de mis mayores fortalezas. Ya sea ajustando un diseño complejo en Nuvemshop o depurando la lógica del backend, no me rindo hasta que la solución funcione perfectamente y el usuario esté satisfecho. Los desafíos son solo peldaños hacia el éxito.',
          },
          {
            id: 'tech',
            title: 'Tecnología con propósito',
            description: "Me fascina el poder que tienen unas pocas líneas de código para transformar negocios. Mi enfoque es dominar las herramientas que marcan la diferencia, como React y Tailwind CSS, siempre atento a lo más moderno en el ecosistema web. No me limito solo a 'hacer que funcione'. Busco entender el 'porqué' detrás de cada tecnología, asegurando que las decisiones técnicas que tomo hoy creen una base sólida para el crecimiento del proyecto mañana.",
          },
          {
            id: 'versatility',
            title: 'Mi visión real en 360°',
            description: "Mi experiencia va más allá de las pantallas.\n\nAntes de sumergirme de lleno en la tecnología, trabajé en áreas como logística y ventas. Esta vivencia me dio una visión muy clara de cómo funcionan los negocios en el 'mundo real', lo que me ayuda a traducir las necesidades reales del mercado en código funcional. Entiendo el lado del cliente, la urgencia del sector transporte y la precisión del servicio al cliente.\n\nSoy un desarrollador que entiende a las personas tanto como entiende la sintaxis.",
          },
          {
            id: 'mentoring',
            title: 'Multiplicar para crecer',
            description: 'Haber actuado como mentor académico en FACENS fue una de las experiencias más significativas de mi trayectoria. Enseñar algoritmos a quienes estaban empezando me obligó a dominar los fundamentos y a practicar la enseñanza de forma constante.\n\nIncluso hoy, veo el liderazgo y el intercambio de conocimientos como pilares fundamentales. Compartir lo que sé con mis colegas y amigos no solo los ayuda a superar obstáculos, sino que también consolida mi propio aprendizaje y crea un ambiente mucho más fuerte para todos.',
          },
          {
            id: 'clean_code',
            title: 'Código hecho para humanos',
            description: "Escribir código es, ante todo, un acto de comunicación. Mi prioridad es entregar soluciones que no solo resuelvan el problema técnico, sino que sean fáciles de leer y mantener para cualquier desarrollador que llegue después de mí. Un código 'sucio' es una deuda que nadie quiere pagar.\n\nSigo los principios de Clean Code por eficiencia, no solo por teoría. Un código bien estructurado hoy significa menos dolores de cabeza mañana y una evolución mucho más rápida para el producto.",
          },
          {
            id: 'ux_vision',
            title: 'El usuario en el centro',
            description: 'El software sin una buena UX es un software incompleto.\n\nBusco entender profundamente el viaje de quien usará lo que estoy construyendo. Trabajo de cerca para transformar prototipos en interfaces vivas y fluidas, asegurando que la tecnología sea invisible y la facilidad de uso sea la protagonista. Mi objetivo final es siempre encantar al usuario con una experiencia impecable.',
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
