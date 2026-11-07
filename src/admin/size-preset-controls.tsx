import { STYLE_SIZES, type StyleSize } from '../cms/style-tokens'
import { adminCopy } from './admin-copy'

type SizePresetControlsProps = {
  label?: string
  value: StyleSize
  onChange: (next: StyleSize) => void
}

function sizeLabel(size: StyleSize) {
  const copy = adminCopy.dashboard
  if (size === 'sm') return copy.sizeSm
  if (size === 'lg') return copy.sizeLg
  return copy.sizeMd
}

export default function SizePresetControls({
  label,
  value,
  onChange,
}: SizePresetControlsProps) {
  return (
    <div className="admin__field">
      {label ? <span className="admin__label">{label}</span> : null}
      <div className="admin-style-sizes" role="group" aria-label={label}>
        {STYLE_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className={`admin__align-btn${value === size ? ' admin__align-btn--on' : ''}`}
            onClick={() => onChange(size)}
          >
            {sizeLabel(size)}
          </button>
        ))}
      </div>
    </div>
  )
}

export { sizeLabel }
