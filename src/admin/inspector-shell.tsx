import type { ReactNode } from 'react'
import { LOCALES, type Locale } from '../i18n/copy'
import { adminCopy } from './admin-copy'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

type InspectorShellProps = {
  title?: string
  titleNode?: ReactNode
  lead: string
  onClose: () => void
  saveLabel: string
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  tab?: Locale
  onTab?: (locale: Locale) => void
  onDelete?: () => void
  deleteDialog?: ReactNode
  children: ReactNode
}

export default function InspectorShell({
  title,
  titleNode,
  lead,
  onClose,
  saveLabel,
  saveStatus,
  isDirty,
  onSave,
  tab,
  onTab,
  onDelete,
  deleteDialog,
  children,
}: InspectorShellProps) {
  const copy = adminCopy.dashboard
  return (
    <div>
      <div className="admin__editor-head">
        <div>
          {titleNode ?? <h2>{title}</h2>}
          <p className="admin__lead">{lead}</p>
        </div>
        <button className="admin__btn admin__btn--ghost" type="button" onClick={onClose}>
          {copy.closeInspector}
        </button>
      </div>

      {tab && onTab ? (
        <div className="admin__tabs">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              className={`admin__tab${tab === code ? ' admin__tab--on' : ''}`}
              onClick={() => onTab(code)}
            >
              {code === 'pt' ? copy.tabPt : code === 'en' ? copy.tabEn : copy.tabEs}
            </button>
          ))}
        </div>
      ) : null}

      <div className="admin__form">{children}</div>

      {onDelete ? (
        <button
          className="admin__btn admin__btn--danger admin__save"
          type="button"
          onClick={onDelete}
        >
          {copy.removeBlock}
        </button>
      ) : null}

      <button
        className={`admin__btn admin__btn--solid admin__save${
          saveStatus === 'success'
            ? ' admin__save--ok'
            : saveStatus === 'error'
              ? ' admin__save--err'
              : ''
        }`}
        type="button"
        onClick={onSave}
        disabled={!isDirty || saveStatus === 'saving' || saveStatus === 'success'}
      >
        {saveLabel}
      </button>
      {deleteDialog}
    </div>
  )
}
