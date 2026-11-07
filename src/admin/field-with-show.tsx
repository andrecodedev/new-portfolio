import type { ReactNode } from 'react'
import type { TextStyle } from '../cms/style-tokens'
import { defaultTextStyle } from '../cms/style-tokens'
import { adminCopy } from './admin-copy'
import TextStyleControls from './text-style-controls'

export default function FieldWithShow({
  label,
  show,
  onShow,
  children,
  textStyle,
  onTextStyle,
  hideToggle = false,
}: {
  label: string
  show: boolean
  onShow: (next: boolean) => void
  children: ReactNode
  textStyle?: TextStyle
  onTextStyle?: (next: TextStyle) => void
  hideToggle?: boolean
}) {
  const copy = adminCopy.dashboard
  return (
    <div className="admin__field">
      <div className="admin__field-head">
        <span className="admin__label">{label}</span>
        {hideToggle ? null : (
          <label className="admin__check">
            <input
              type="checkbox"
              checked={show}
              onChange={(event) => onShow(event.target.checked)}
            />
            {copy.showField}
          </label>
        )}
      </div>
      {children}
      {textStyle && onTextStyle ? (
        <TextStyleControls
          value={textStyle}
          onChange={onTextStyle}
        />
      ) : onTextStyle ? (
        <TextStyleControls
          value={defaultTextStyle()}
          onChange={onTextStyle}
        />
      ) : null}
    </div>
  )
}
