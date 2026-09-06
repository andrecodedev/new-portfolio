import { adminCopy } from './admin-copy'

type ConfirmDialogProps = {
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const copy = adminCopy.dashboard

  return (
    <div className="admin__modal">
      <div className="admin__dialog" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="admin__dialog-actions">
          <button
            className="admin__btn admin__btn--ghost"
            type="button"
            onClick={onCancel}
          >
            {copy.cancel}
          </button>
          <button
            className="admin__btn admin__btn--danger"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
