/**
 * Cursos por plataforma. Fonte: Obsidian (10_Controle-de-Area/Estudos/Inventario, 2026-11-10)
 * e o portfólio antigo (concluídos da Alura, OneBitCode e formação). Nomes de curso não são traduzidos.
 * Para atualizar: edite `progress` (0-100) e `status`; `done` = concluído, `doing` = em andamento, `queue` = na fila.
 */
export type StudyStatus = 'doing' | 'queue' | 'done'

export type StudyCourse = {
  title: string
  status: StudyStatus
  /** 0-100. Omitir quando não há medição (concluído conta como 100). */
  progress?: number
  lessons?: number
  hours?: number
  period?: string
  certificateUrl?: string
  /** Pasta interna do curso: módulos/unidades. Sem isso, a pasta do curso mostra "ainda não mapeado". */
  modules?: readonly StudyModule[]
}

export type StudyModule = {
  title: string
  status: StudyStatus
  progress?: number
  lessons?: number
  hours?: number
}

export type StudyPlatform = {
  id: string
  label: string
  color: string
  /** Arquivo em /public/studies. Sem logo, a pasta mostra a inicial. */
  logo?: string
  courses: readonly StudyCourse[]
}

const done = (title: string, hours?: number, period?: string): StudyCourse => ({
  title,
  status: 'done',
  progress: 100,
  hours,
  period,
})

export const studyPlatforms: readonly StudyPlatform[] = [
  {
    id: 'origamid',
    label: 'Origamid',
    color: '#6d28d9',
    courses: [
      { title: 'HTML e CSS para Iniciantes', status: 'doing', progress: 19, lessons: 164, hours: 23 },
      { title: 'CSS Flexbox', status: 'doing', progress: 36, lessons: 25, hours: 3 },
      { title: 'JavaScript Completo ES6', status: 'doing', progress: 10, lessons: 156, hours: 37 },
      { title: 'React Completo', status: 'doing', progress: 3, lessons: 108, hours: 15 },
      { title: 'UI Design para Iniciantes', status: 'queue', lessons: 155, hours: 17 },
      { title: 'CSS Grid Layout', status: 'queue', lessons: 39, hours: 5 },
      { title: 'TypeScript para Iniciantes', status: 'queue', lessons: 74, hours: 11 },
      { title: 'React com TypeScript (TSX)', status: 'queue', lessons: 39, hours: 5 },
      { title: 'Tailwind CSS', status: 'queue', lessons: 66, hours: 8 },
      { title: 'Next.js', status: 'queue', lessons: 78, hours: 11 },
      { title: 'Back End Node.js', status: 'queue', lessons: 115, hours: 24 },
      { title: 'Banco de Dados SQLite', status: 'queue', lessons: 69, hours: 8 },
      { title: 'Redux com React', status: 'queue', lessons: 42, hours: 8 },
      { title: 'UI Design Avançado', status: 'queue', lessons: 55, hours: 15 },
    ],
  },
  {
    id: 'dio',
    label: 'DIO',
    color: '#ec4899',
    logo: '/studies/dio.svg',
    courses: [
      {
        title: 'English For Tech (English4Tech)',
        status: 'doing',
        progress: 50,
        modules: [
          { title: 'Bem-vindo e Speaking Practice Coach', status: 'done', lessons: 6 },
          { title: 'M1 U1: Apresentando-se e objetivos de carreira', status: 'done', lessons: 12 },
          { title: 'M1 U2: Habilidades técnicas', status: 'doing', progress: 50, lessons: 12 },
          { title: 'M1 U3: Habilidades interpessoais', status: 'queue', lessons: 10 },
          { title: 'M1 U4: Projetos e progressos', status: 'queue', lessons: 10 },
          { title: 'M1 U5: Formação acadêmica', status: 'queue', lessons: 14 },
          { title: 'M1 Questionário', status: 'queue' },
          { title: 'M2: Empresas e oportunidades internacionais', status: 'queue' },
          { title: 'M3: Rede de contatos, LinkedIn e cover letter', status: 'queue' },
          { title: 'M4: Primeira entrevista internacional', status: 'queue' },
          { title: 'M5: Mentor, país, testes e visto', status: 'queue' },
          { title: 'M6: Pré-mudança', status: 'queue' },
          { title: 'M7: Ambientação no novo país', status: 'queue' },
          { title: 'M8: Nova equipe (squad, SM e PO)', status: 'queue' },
          { title: 'M9: Brainstorming', status: 'queue' },
          { title: 'M10: Planning da Sprint', status: 'queue' },
          { title: 'M11: Daily Meeting', status: 'queue' },
          { title: 'M12: Review e Retrospectiva', status: 'queue' },
        ],
      },
      { title: 'Formação JavaScript Developer', status: 'queue' },
      { title: 'Formação AZ-204 Certification', status: 'queue' },
      { title: 'GFT Start #7 - Java', status: 'queue' },
      { title: 'Formação PHP Experience', status: 'queue' },
      { title: 'Versionamento de Código com Git e GitHub', status: 'queue' },
    ],
  },
  {
    id: 'udemy',
    label: 'Udemy',
    color: '#a435f0',
    logo: '/studies/udemy.svg',
    courses: [
      done('Python para Iniciantes'),
      { title: 'Nuvem Shop Completo: Crie Sua Loja Virtual', status: 'doing', progress: 38 },
      { title: 'Criando um Controle de Vendas Desktop com C# e MySQL', status: 'doing', progress: 31 },
      { title: 'Algoritmos e Lógica de Programação', status: 'doing', progress: 19 },
      { title: 'Java COMPLETO: Programação Orientada a Objetos', status: 'doing', progress: 13 },
    ],
  },
  {
    id: 'onebitcode',
    label: 'OneBitCode',
    color: '#e11d2e',
    logo: '/studies/onebitcode.svg',
    courses: [
      done('HTML5', 12, '01/2025'),
      done('CSS3', 14, '01/2025'),
      { title: 'Formação JavaScript', status: 'queue', lessons: 747, hours: 205 },
      { title: 'Formação Python', status: 'queue', lessons: 416, hours: 70 },
      { title: 'Treinamento Automações com N8N e IA', status: 'queue', lessons: 254, hours: 60 },
      { title: 'Mobile com React Native', status: 'queue', lessons: 116, hours: 50 },
      { title: 'Formação Ruby on Rails', status: 'queue', lessons: 291, hours: 45 },
      { title: 'IA para DEVs', status: 'queue', hours: 14 },
      { title: 'Desafios de JavaScript', status: 'queue', hours: 10 },
    ],
  },
  {
    id: 'alura',
    label: 'Alura',
    color: '#2563eb',
    logo: '/studies/alura.svg',
    courses: [
      done('Formação Iniciante em Programação G8 - ONE', 70, '01/2025 - 02/2025'),
      done('Formação Empreendedorismo, Agilidade e Protagonismo G8 - ONE', 47, '03/2025 - 06/2025'),
      done('Formação Desenvolvimento Pessoal G8 - ONE', 36, '01/2025 - 02/2025'),
      done('Java: aplicando a Orientação a Objetos', 10, '03/2025 - 06/2025'),
      done('Java: criando a sua primeira aplicação', 8, '03/2025 - 05/2025'),
      done('Praticando Java: condicionais if e else', 4, '03/2025 - 06/2025'),
      done('HTML e CSS: Classes, posicionamento e Flexbox', 8, '01/2025 - 02/2025'),
      done('HTML e CSS: ambientes de desenvolvimento, estrutura de arquivos e tags', 8, '01/2025 - 02/2025'),
      done('HTML e CSS: cabeçalho, footer e variáveis CSS', 6, '01/2025 - 02/2025'),
      done('HTML e CSS: responsividade e publicação de projetos', 6, '01/2025 - 02/2025'),
      done('Lógica de programação: mergulhe em programação com JavaScript', 6, '01/2025 - 02/2025'),
      done('Lógica de programação: explore funções e listas', 6, '01/2025 - 02/2025'),
      done('Praticando Lógica de programação: Challenge amigo secreto', 8, '01/2025 - 02/2025'),
      done('Git e GitHub: compartilhando e colaborando em projetos', 8, '01/2025 - 02/2025'),
      done('Gestão Ágil: explorando conceitos da agilidade', 8, '03/2025 - 06/2025'),
      done('Empreendedorismo: da ideia ao plano de negócios', 8, '03/2025 - 06/2025'),
      done('Transição de carreira: um guia para a área da tecnologia', 8, '03/2025 - 05/2025'),
      done('Propósito profissional: seja protagonista da sua carreira', 8, '03/2025 - 05/2025'),
      done('Desenvolvimento de carreira: a demanda do mercado', 10, '05/2025'),
      done('LinkedIn: como fazer o seu perfil trabalhar para você', 4, '01/2025 - 02/2025'),
      done('Hábitos: da produtividade às metas pessoais', 6, '01/2025 - 02/2025'),
      done('Foco: trazendo mais resultados para o dia a dia', 10, '01/2025 - 02/2025'),
      done('ChatGPT: otimizando a qualidade dos resultados', 8, '01/2025 - 02/2025'),
      done('Aprender a aprender: técnicas para seu autodesenvolvimento', 8, '01/2025 - 02/2025'),
    ],
  },
  {
    id: 'escolas',
    label: 'Escolas',
    color: '#22a06b',
    logo: '/studies/facens.svg',
    courses: [
      { title: 'FACENS: Análise e Desenvolvimento de Sistemas', status: 'doing', hours: 2400, period: '08/2024 - 12/2026' },
      done('CCBEU: Inglês A1, A2 e B1', 120, '10/2024 - 06/2025'),
      done('Soul Bilíngue: Inglês como Segunda Língua', 88, '01/2024 - 06/2024'),
      done('ETEC: Análise e Desenvolvimento de Sistemas', 1500, '08/2022 - 12/2023'),
      done('SENAI: Operador Logístico', 200, '02/2022 - 05/2022'),
      done('FATEC: Desenvolvimento Web e Customização de Plataformas', 144, '08/2021 - 12/2021'),
      done('Interativa: Matemática', 82, '02/2020 - 07/2020'),
      done('Interativa: Operador de Computador', 163.5, '06/2018 - 11/2019'),
      done('Interativa: Inglês A1 e A2', 80, '01/2018 - 11/2020'),
    ],
  },
]
