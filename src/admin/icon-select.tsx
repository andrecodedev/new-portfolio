import { SITE_ICON_OPTIONS, SiteIcon } from '../cms/icon-registry'
import { adminCopy } from './admin-copy'
import AdminSelect from './admin-select'

type IconSelectProps = {
  label?: string
  value: string
  onChange: (next: string) => void
}

export default function IconSelect({
  label,
  value,
  onChange,
}: IconSelectProps) {
  const copy = adminCopy.dashboard
  return (
    <AdminSelect
      label={label ?? copy.fabIcon}
      value={value || 'settings'}
      onChange={onChange}
      options={SITE_ICON_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
        icon: <SiteIcon id={option.id} className="admin-select__svg" />,
      }))}
    />
  )
}
