import { SKILLS } from './about'
import { SKILL_GROUP_NAMES } from './skill-groups'
import { studyPlatforms, type StudyCourse, type StudyPlatform, type StudyStatus } from './studies'

/**
 * Habilidade -> cursos que a comprovam. `includes` casa por trecho do título dentro da plataforma indicada,
 * então novos cursos com o mesmo tema entram sozinhos. O percentual é a média do progresso dos cursos,
 * ponderada pelas horas (cursos sem horas pesam 10h; diplomas ficam limitados a 80h para não dominarem a conta).
 */
type EvidenceRule = { platform: string; includes: readonly string[] }

type SkillEvidence = { skill: string; rules: readonly EvidenceRule[] }

const EVIDENCE: readonly SkillEvidence[] = [
  {
    skill: 'HTML5',
    rules: [
      { platform: 'alura', includes: ['HTML e CSS'] },
      { platform: 'onebitcode', includes: ['HTML5'] },
      { platform: 'origamid', includes: ['HTML e CSS'] },
      { platform: 'escolas', includes: ['FATEC'] },
    ],
  },
  {
    skill: 'CSS3',
    rules: [
      { platform: 'alura', includes: ['HTML e CSS'] },
      { platform: 'onebitcode', includes: ['CSS3'] },
      { platform: 'origamid', includes: ['HTML e CSS', 'Flexbox', 'Grid'] },
      { platform: 'escolas', includes: ['FATEC'] },
    ],
  },
  {
    skill: 'JavaScript',
    rules: [
      { platform: 'alura', includes: ['Lógica de programação', 'Praticando Lógica'] },
      { platform: 'origamid', includes: ['JavaScript'] },
      { platform: 'onebitcode', includes: ['Formação JavaScript', 'Desafios de JavaScript'] },
      { platform: 'dio', includes: ['JavaScript'] },
    ],
  },
  {
    skill: 'TypeScript',
    rules: [{ platform: 'origamid', includes: ['TypeScript', 'TSX'] }],
  },
  {
    skill: 'React',
    rules: [{ platform: 'origamid', includes: ['React', 'Redux'] }],
  },
  {
    skill: 'Node.js',
    rules: [{ platform: 'origamid', includes: ['Node.js'] }],
  },
  {
    skill: 'Tailwind CSS',
    rules: [{ platform: 'origamid', includes: ['Tailwind'] }],
  },
  {
    skill: 'Java',
    rules: [
      { platform: 'alura', includes: ['Java'] },
      { platform: 'udemy', includes: ['Java'] },
      { platform: 'dio', includes: ['Java'] },
    ],
  },
  {
    skill: 'C#',
    rules: [{ platform: 'udemy', includes: ['C#'] }],
  },
  {
    skill: 'SQL',
    rules: [
      { platform: 'udemy', includes: ['MySQL'] },
      { platform: 'origamid', includes: ['SQLite'] },
    ],
  },
  {
    skill: 'Git',
    rules: [
      { platform: 'alura', includes: ['Git e GitHub'] },
      { platform: 'dio', includes: ['Git e GitHub'] },
    ],
  },
  {
    skill: 'Nuvemshop',
    rules: [{ platform: 'udemy', includes: ['Nuvem Shop'] }],
  },
  {
    skill: 'Scrum',
    rules: [{ platform: 'alura', includes: ['Gestão Ágil', 'Agilidade'] }],
  },
  {
    skill: 'English',
    rules: [
      { platform: 'dio', includes: ['English'] },
      { platform: 'escolas', includes: ['Inglês'] },
    ],
  },
]

export type EvidenceCourse = {
  platform: StudyPlatform
  platformIndex: number
  course: StudyCourse
  courseIndex: number
}

export type SkillLevel = {
  name: string
  icon: string
  /** null = ainda sem curso mapeado (aprendida na prática/trabalho): aparece na lista sem barra. */
  percent: number | null
  /** Índice da categoria em SKILL_GROUP_NAMES. */
  group: number
  evidence: EvidenceCourse[]
}

const progressOf = (status: StudyStatus, progress?: number) =>
  status === 'done' ? 100 : status === 'queue' ? 0 : Math.min(100, Math.max(0, progress ?? 0))

const weightOf = (course: StudyCourse) => Math.min(course.hours ?? 10, 80)

function buildSkillLevels(): SkillLevel[] {
  const levels: SkillLevel[] = []
  for (const skill of SKILLS) {
    const entry = EVIDENCE.find((item) => item.skill === skill.name)
    const evidence: EvidenceCourse[] = []
    for (const rule of entry?.rules ?? []) {
      const platformIndex = studyPlatforms.findIndex((platform) => platform.id === rule.platform)
      if (platformIndex < 0) continue
      const platform = studyPlatforms[platformIndex]
      platform.courses.forEach((course, courseIndex) => {
        if (rule.includes.some((text) => course.title.includes(text))) {
          if (!evidence.some((item) => item.course === course)) evidence.push({ platform, platformIndex, course, courseIndex })
        }
      })
    }
    const group = Math.max(0, SKILL_GROUP_NAMES.findIndex((names) => names.includes(skill.name)))
    if (evidence.length === 0) {
      levels.push({ name: skill.name, icon: skill.icon, percent: null, group, evidence })
      continue
    }
    const total = evidence.reduce((sum, item) => sum + weightOf(item.course), 0)
    const done = evidence.reduce((sum, item) => sum + weightOf(item.course) * progressOf(item.course.status, item.course.progress), 0)
    evidence.sort((a, b) => progressOf(b.course.status, b.course.progress) - progressOf(a.course.status, a.course.progress))
    levels.push({ name: skill.name, icon: skill.icon, percent: Math.round(done / total), group, evidence })
  }
  // Com comprovação primeiro (maior % no topo); as sem curso mapeado depois, em ordem alfabética.
  return levels.sort((a, b) => {
    if (a.percent === null && b.percent === null) return a.name.localeCompare(b.name)
    if (a.percent === null) return 1
    if (b.percent === null) return -1
    return b.percent - a.percent
  })
}

export const skillLevels: readonly SkillLevel[] = buildSkillLevels()

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9#+]/g, '')

/** Distância de edição com troca de letras vizinhas ("figam" -> "figma" = 1). */
function distance(a: string, b: string) {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

/**
 * Busca tolerante a erro de digitação: "javae" acha Java e JavaScript, "pyton" acha Python, "reakt" acha React.
 * Casa por trecho, por prefixo com até 1-2 letras trocadas e pelo nome inteiro com pequena distância.
 */
export function matchSkill(query: string, name: string): boolean {
  const q = normalize(query)
  if (!q) return true
  const n = normalize(name)
  if (n.includes(q)) return true
  const tolerance = q.length >= 7 ? 2 : q.length >= 5 ? 1 : 0
  if (tolerance === 0) return false
  if (distance(q, n.slice(0, q.length)) <= tolerance) return true
  if (distance(q, n) <= tolerance) return true
  const words = name.toLowerCase().split(/[\s.]+/).map(normalize).filter(Boolean)
  return words.some((word) => distance(q, word) <= tolerance || distance(q, word.slice(0, q.length)) <= tolerance)
}
