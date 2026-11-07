export type RainWord = {
  id: string
  text: string
  enabled: boolean
}

export type RainConfig = {
  enabled: boolean
  /** Vazio = usa --rain do tema */
  color: string
  words: RainWord[]
}

/** Vocabulário padrão da chuva de código */
export const DEFAULT_RAIN_TEXTS = [
  '0',
  '1',
  '{',
  '}',
  '/',
  '/>',
  '(',
  ')',
  ';',
  '[',
  ']',
  '<',
  '>',
  '&&',
  '||',
  '!=',
  '==',
  'const',
  'let',
  'var',
  'return',
  'if',
  'else',
  'switch',
  'case',
  'break',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'function',
  '=>',
  'this',
  'typeof',
  'instanceof',
  'new',
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'API',
  'JSON',
  'HTML',
  'CSS',
  'JS',
  'DOM',
  'Web',
  'React',
  'Next',
  'Vue',
  'Vite',
  'Tailwind',
  'Sass',
  'UI',
  'UX',
  'SPA',
  'SSR',
  'CSR',
  'Responsive',
  'Flex',
  'Grid',
  'node',
  'Express',
  'REST',
  'GraphQL',
  'Server',
  'Auth',
  'JWT',
  'Middleware',
  'SQL',
  'NoSQL',
  'MongoDB',
  'Postgres',
  'MySQL',
  'Redis',
  'npm',
  'yarn',
  'Git',
  'Docker',
  'CI/CD',
  'Linux',
  'Bash',
  'CLI',
  'Deploy',
  'Vercel',
  'Netlify',
  'Clean Code',
  'SOLID',
  'DRY',
  'KISS',
  'Refactor',
  'Performance',
  'Testing',
  'Debug',
  '</>',
  '<div>',
  '<script>',
  '404',
  '200 OK',
] as const

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `rain-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createRainWord(text = ''): RainWord {
  return {
    id: newId(),
    text,
    enabled: true,
  }
}

export function defaultRainWords(): RainWord[] {
  return DEFAULT_RAIN_TEXTS.map((text) => createRainWord(text))
}

export function defaultRainConfig(): RainConfig {
  return {
    enabled: true,
    color: '',
    words: defaultRainWords(),
  }
}

export function parseRainConfig(value: unknown): RainConfig {
  const fallback = defaultRainConfig()
  if (!value || typeof value !== 'object') return fallback
  const row = value as Record<string, unknown>
  const words = Array.isArray(row.words)
    ? row.words
        .map((item) => {
          if (typeof item === 'string') {
            const text = item.trim()
            return text ? createRainWord(text) : null
          }
          if (!item || typeof item !== 'object') return null
          const entry = item as Record<string, unknown>
          const text =
            typeof entry.text === 'string' ? entry.text.trim() : ''
          if (!text) return null
          return {
            id: typeof entry.id === 'string' ? entry.id : newId(),
            text,
            enabled: entry.enabled !== false,
          } satisfies RainWord
        })
        .filter((item): item is RainWord => item !== null)
    : fallback.words

  return {
    enabled: typeof row.enabled === 'boolean' ? row.enabled : true,
    color: typeof row.color === 'string' ? row.color : '',
    words: words.length > 0 ? words : fallback.words,
  }
}

/** Textos ativos usados pela animação */
export function rainActiveTexts(config: RainConfig): string[] {
  const texts = config.words
    .filter((item) => item.enabled && item.text.trim())
    .map((item) => item.text.trim())
  return texts.length > 0 ? texts : [...DEFAULT_RAIN_TEXTS]
}
