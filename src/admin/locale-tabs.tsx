import { adminCopy } from './admin-copy'

type LocaleTabsProps = {
  locales: readonly { code: string; label: string }[]
  value: string
  onChange: (code: string) => void
}

export default function LocaleTabs({ locales, value, onChange }: LocaleTabsProps) {
  const copy = adminCopy.dashboard
  const list = locales.length > 0 ? locales : [{ code: 'pt', label: copy.tabPt }]

  return (
    <div className="admin__tabs">
      {list.map((locale) => (
        <button
          key={locale.code}
          type="button"
          className={`admin__tab${value === locale.code ? ' admin__tab--on' : ''}`}
          onClick={() => onChange(locale.code)}
        >
          {locale.label || locale.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
