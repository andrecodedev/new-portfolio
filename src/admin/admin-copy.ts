import type { Locale } from '../i18n/copy'
import { adminCopyPt, type AdminCopy } from './admin-copy-pt'
import { adminCopyEn } from './admin-copy-en'
import { adminCopyEs } from './admin-copy-es'

const DICTIONARIES: Record<Locale, AdminCopy> = {
  pt: adminCopyPt,
  en: adminCopyEn,
  es: adminCopyEs,
}

let currentLocale: Locale = 'pt'

/**
 * Define o idioma do painel. Chamado pelo LocaleProvider durante o render, antes
 * dos filhos lerem `adminCopy`: assim a troca vale no mesmo ciclo, sem refatorar
 * os ~25 arquivos do admin que importam `adminCopy`.
 */
export function setAdminLocale(locale: Locale) {
  currentLocale = locale
}

/** Mesmo uso de sempre (`adminCopy.dashboard.title`), mas segue o idioma atual. */
export const adminCopy: AdminCopy = new Proxy({} as AdminCopy, {
  get: (_target, section: string) =>
    DICTIONARIES[currentLocale][section as keyof AdminCopy],
})
