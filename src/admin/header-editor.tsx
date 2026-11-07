import { useState, type ReactNode } from 'react'
import {
  BUTTON_TARGETS,
  buttonSelectValue,
  EXTERNAL_LINK_VALUE,
  isExternalHref,
} from '../cms/hero-content'
import {
  createHeaderNavItem,
  createHeaderSocial,
  HEADER_MODULE_IDS,
  type CmsHeaderPayload,
  type HeaderModuleId,
  type HeaderNavItem,
  type HeaderSocial,
} from '../cms/header-content'
import { STYLE_SIZES, type StyleSize } from '../cms/style-tokens'
import { LOCALES, type Locale } from '../i18n/copy'
import { adminCopy } from './admin-copy'
import AdminSelect from './admin-select'
import ButtonStyleControls from './button-style-controls'
import ColorField from './color-field'
import ConfirmDialog from './confirm-dialog'
import EditableTitle from './editable-title'
import FieldWithShow from './field-with-show'
import IconSelect from './icon-select'
import MediaPickerField from './media-picker'
import SizePresetControls from './size-preset-controls'

const LOGO_HEIGHT: Record<StyleSize, number> = {
  sm: 28,
  md: 0,
  lg: 56,
}

const HEADER_PAD: Record<StyleSize, number> = {
  sm: 8,
  md: 16,
  lg: 28,
}

function nearestPxSize(
  px: number,
  map: Record<StyleSize, number>,
): StyleSize {
  let best: StyleSize = 'md'
  let bestDiff = Number.POSITIVE_INFINITY
  for (const size of STYLE_SIZES) {
    const diff = Math.abs(map[size] - px)
    if (diff < bestDiff) {
      best = size
      bestDiff = diff
    }
  }
  return best
}

function nearestLogoSize(px: number): StyleSize {
  return nearestPxSize(px, LOGO_HEIGHT)
}

function linkTargetOptions(externalLabel: string) {
  return [
    ...BUTTON_TARGETS.map((target) => ({
      id: target.to,
      label: target.label,
    })),
    { id: EXTERNAL_LINK_VALUE, label: externalLabel },
  ]
}
import {
  ChevronLeftIcon,
  TreeCtaIcon,
  TreeHeaderIcon,
  TreeLinkIcon,
  TreeLogoIcon,
  TreeMenuIcon,
  TreeNavIcon,
  TreeSocialIcon,
} from './icons'
import StructureTree, { type StructureTreeNode } from './structure-tree'
import { orderListByIds } from './structure-block'
import TextStyleControls from './text-style-controls'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type EditorPane = 'structure' | 'inspector'

const HEADER_ID = 'header'
const LOGO_ID = 'logo'
const MENU_ID = 'menu'
const CTA_ID = 'cta'
const NAV_GROUP_ID = 'nav'
const SOCIAL_GROUP_ID = 'social'

type HeaderEditorProps = {
  pane: EditorPane
  headerData: CmsHeaderPayload
  onChange: (next: CmsHeaderPayload) => void
  saveStatus: SaveStatus
  isDirty: boolean
  onSave: () => void
  onBack: () => void
  editingId: string | null
  onEditingIdChange: (id: string | null) => void
}

export default function HeaderEditor({
  pane,
  headerData,
  onChange,
  saveStatus,
  isDirty,
  onSave,
  onBack,
  editingId,
  onEditingIdChange,
}: HeaderEditorProps) {
  const [tab, setTab] = useState<Locale>('pt')
  const [pendingRemove, setPendingRemove] = useState<{
    kind: 'nav' | 'social'
    id: string
  } | null>(null)
  const copy = adminCopy.dashboard

  const saveLabel =
    saveStatus === 'success'
      ? copy.published
      : saveStatus === 'saving'
        ? copy.publishing
        : copy.publishHeader

  const editingNav = headerData.navItems.find((item) => item.id === editingId)
  const editingSocial = headerData.socials.find((item) => item.id === editingId)

  const replaceNav = (next: HeaderNavItem) => {
    onChange({
      ...headerData,
      navItems: headerData.navItems.map((item) =>
        item.id === next.id ? next : item,
      ),
    })
  }

  const replaceSocial = (next: HeaderSocial) => {
    onChange({
      ...headerData,
      socials: headerData.socials.map((item) =>
        item.id === next.id ? next : item,
      ),
    })
  }

  const deleteDialog = pendingRemove ? (
    <ConfirmDialog
      title={
        pendingRemove.kind === 'nav' ? copy.deleteNavTitle : copy.deleteSocialTitle
      }
      description={
        pendingRemove.kind === 'nav' ? copy.deleteNavDesc : copy.deleteSocialDesc
      }
      confirmLabel={copy.confirmDelete}
      onConfirm={() => {
        if (pendingRemove.kind === 'nav') {
          onChange({
            ...headerData,
            navItems: headerData.navItems.filter(
              (item) => item.id !== pendingRemove.id,
            ),
          })
        } else {
          onChange({
            ...headerData,
            socials: headerData.socials.filter(
              (item) => item.id !== pendingRemove.id,
            ),
          })
        }
        if (editingId === pendingRemove.id) onEditingIdChange(null)
        setPendingRemove(null)
      }}
      onCancel={() => setPendingRemove(null)}
    />
  ) : null

  if (pane === 'structure') {
    const moduleNodes: Record<HeaderModuleId, StructureTreeNode> = {
      logo: {
        id: LOGO_ID,
        title: copy.headerLogoTitle,
        description: copy.headerLogoDesc,
        icon: <TreeLogoIcon />,
        enabled: headerData.logoEnabled,
        showToggle: true,
        deletable: true,
      },
      menu: {
        id: MENU_ID,
        title: copy.headerMenuTitle,
        description: copy.headerMenuDesc,
        icon: <TreeMenuIcon />,
        enabled: headerData.menuEnabled,
        showToggle: true,
        deletable: true,
      },
      cta: {
        id: CTA_ID,
        title: copy.headerCtaTitle,
        description: copy.headerCtaDesc,
        icon: <TreeCtaIcon />,
        enabled: headerData.ctaEnabled,
        showToggle: true,
        deletable: true,
      },
      nav: {
        id: NAV_GROUP_ID,
        title: copy.headerNavTitle,
        description: copy.headerNavLead,
        icon: <TreeNavIcon />,
        deletable: true,
        addLabel: copy.addBlock,
        addOptions: [
          {
            id: 'nav-item',
            label: copy.addNavItem,
            description: copy.addNavItemDesc,
            icon: <TreeLinkIcon />,
          },
        ],
        children: headerData.navItems.map((item) => ({
          id: item.id,
          title: item.name.trim() || item.label.pt || copy.navItemTitle,
          description: copy.navItemDesc,
          icon: <TreeLinkIcon />,
          enabled: item.enabled,
          showToggle: true,
          deletable: true,
        })),
      },
      social: {
        id: SOCIAL_GROUP_ID,
        title: copy.headerSocialTitle,
        description: copy.headerSocialLead,
        icon: <TreeSocialIcon />,
        deletable: true,
        addLabel: copy.addBlock,
        addOptions: [
          {
            id: 'social-item',
            label: copy.addSocial,
            description: copy.addSocialDesc,
            icon: <TreeSocialIcon />,
          },
        ],
        children: headerData.socials.map((item) => ({
          id: item.id,
          title: item.name.trim() || item.label || copy.socialItemTitle,
          description: copy.socialItemDesc,
          icon: <TreeSocialIcon />,
          enabled: item.enabled,
          showToggle: true,
          deletable: true,
        })),
      },
    }

    const orderedModules = headerData.modulesOrder.filter((id) =>
      HEADER_MODULE_IDS.includes(id),
    )
    const missingModules = HEADER_MODULE_IDS.filter(
      (id) => !orderedModules.includes(id),
    )
    const headerAddOptions = missingModules.map((id) => {
      const labels: Record<HeaderModuleId, { label: string; icon: ReactNode }> = {
        logo: { label: copy.addHeaderLogo, icon: <TreeLogoIcon /> },
        menu: { label: copy.addHeaderMenu, icon: <TreeMenuIcon /> },
        cta: { label: copy.addHeaderCta, icon: <TreeCtaIcon /> },
        nav: { label: copy.addHeaderNav, icon: <TreeNavIcon /> },
        social: { label: copy.addHeaderSocial, icon: <TreeSocialIcon /> },
      }
      return {
        id,
        label: labels[id].label,
        icon: labels[id].icon,
      }
    })

    const tree: StructureTreeNode[] = [
      {
        id: HEADER_ID,
        title: headerData.sectionName.trim() || copy.headerRootTitle,
        description: copy.headerRootDesc,
        icon: <TreeHeaderIcon />,
        draggable: false,
        addLabel: copy.addBlock,
        addOptions: headerAddOptions,
        children: orderedModules.map((id) => moduleNodes[id]),
      },
    ]

    return (
      <div>
        <div className="admin__editor-head admin__editor-head--structure">
          <button className="admin__back" type="button" onClick={onBack}>
            <ChevronLeftIcon />
            {copy.back}
          </button>
          <div>
            <EditableTitle
              value={headerData.sectionName}
              fallback={copy.headerTitle}
              onChange={(sectionName) => onChange({ ...headerData, sectionName })}
            />
            <p className="admin__lead">{copy.headerModulesLead}</p>
          </div>
        </div>

        <StructureTree
          nodes={tree}
          selectedId={editingId}
          onSelect={onEditingIdChange}
          onToggleEnabled={(id, enabled) => {
            if (id === LOGO_ID) onChange({ ...headerData, logoEnabled: enabled })
            else if (id === MENU_ID)
              onChange({ ...headerData, menuEnabled: enabled })
            else if (id === CTA_ID)
              onChange({ ...headerData, ctaEnabled: enabled })
            else {
              const nav = headerData.navItems.find((item) => item.id === id)
              if (nav) {
                replaceNav({ ...nav, enabled })
                return
              }
              const social = headerData.socials.find((item) => item.id === id)
              if (social) replaceSocial({ ...social, enabled })
            }
          }}
          onDelete={(id) => {
            if (HEADER_MODULE_IDS.includes(id as HeaderModuleId)) {
              const moduleId = id as HeaderModuleId
              const patch: Partial<CmsHeaderPayload> = {
                modulesOrder: headerData.modulesOrder.filter(
                  (item) => item !== moduleId,
                ),
              }
              if (moduleId === 'logo') patch.logoEnabled = false
              if (moduleId === 'menu') patch.menuEnabled = false
              if (moduleId === 'cta') patch.ctaEnabled = false
              onChange({ ...headerData, ...patch })
              if (editingId === id || editingId?.startsWith(`${id}`)) {
                onEditingIdChange(HEADER_ID)
              }
              return
            }
            if (headerData.navItems.some((item) => item.id === id)) {
              setPendingRemove({ kind: 'nav', id })
              return
            }
            if (headerData.socials.some((item) => item.id === id)) {
              setPendingRemove({ kind: 'social', id })
            }
          }}
          onAddOption={(parentId, optionId) => {
            if (parentId === HEADER_ID && HEADER_MODULE_IDS.includes(optionId as HeaderModuleId)) {
              const moduleId = optionId as HeaderModuleId
              const patch: Partial<CmsHeaderPayload> = {
                modulesOrder: [...headerData.modulesOrder, moduleId],
              }
              if (moduleId === 'logo') patch.logoEnabled = true
              if (moduleId === 'menu') patch.menuEnabled = true
              if (moduleId === 'cta') patch.ctaEnabled = true
              onChange({ ...headerData, ...patch })
              onEditingIdChange(moduleId)
              return
            }
            if (parentId === NAV_GROUP_ID && optionId === 'nav-item') {
              const item = createHeaderNavItem({ name: copy.navItemTitle })
              onChange({
                ...headerData,
                navItems: [...headerData.navItems, item],
              })
              onEditingIdChange(item.id)
              return
            }
            if (parentId === SOCIAL_GROUP_ID && optionId === 'social-item') {
              const item = createHeaderSocial({ name: copy.socialItemTitle })
              onChange({
                ...headerData,
                socials: [...headerData.socials, item],
              })
              onEditingIdChange(item.id)
            }
          }}
          onReorder={(parentId, orderedIds) => {
            if (parentId === HEADER_ID) {
              const nextOrder = orderedIds.filter((id): id is HeaderModuleId =>
                HEADER_MODULE_IDS.includes(id as HeaderModuleId),
              )
              onChange({ ...headerData, modulesOrder: nextOrder })
              return
            }
            if (parentId === NAV_GROUP_ID) {
              onChange({
                ...headerData,
                navItems: orderListByIds(headerData.navItems, orderedIds),
              })
              return
            }
            if (parentId === SOCIAL_GROUP_ID) {
              onChange({
                ...headerData,
                socials: orderListByIds(headerData.socials, orderedIds),
              })
            }
          }}
        />

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

  if (editingId === HEADER_ID) {
    const chrome = headerData.chromeStyle
    return (
      <InspectorShell
        titleNode={
          <EditableTitle
            value={headerData.sectionName}
            fallback={copy.headerRootTitle}
            onChange={(sectionName) => onChange({ ...headerData, sectionName })}
          />
        }
        lead={copy.headerRootDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <ColorField
          label={copy.headerBg}
          value={chrome.background}
          onChange={(background) =>
            onChange({
              ...headerData,
              chromeStyle: { ...chrome, background },
            })
          }
        />
        <ColorField
          label={copy.headerTextColor}
          value={chrome.textColor}
          onChange={(textColor) =>
            onChange({
              ...headerData,
              chromeStyle: { ...chrome, textColor },
            })
          }
        />
        <ColorField
          label={copy.headerIconColor}
          value={chrome.iconColor}
          onChange={(iconColor) =>
            onChange({
              ...headerData,
              chromeStyle: { ...chrome, iconColor },
            })
          }
        />
        <SizePresetControls
          label={copy.headerPadY}
          value={nearestPxSize(chrome.paddingY, HEADER_PAD)}
          onChange={(size) =>
            onChange({
              ...headerData,
              chromeStyle: { ...chrome, paddingY: HEADER_PAD[size] },
            })
          }
        />
        <SizePresetControls
          label={copy.headerPadX}
          value={nearestPxSize(chrome.paddingX, HEADER_PAD)}
          onChange={(size) =>
            onChange({
              ...headerData,
              chromeStyle: { ...chrome, paddingX: HEADER_PAD[size] },
            })
          }
        />
      </InspectorShell>
    )
  }

  if (editingId === NAV_GROUP_ID) {
    const group = headerData.navGroupStyle
    return (
      <InspectorShell
        title={copy.headerNavTitle}
        lead={copy.headerNavGroupDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <ColorField
          label={copy.groupTextColor}
          value={group.textColor}
          onChange={(textColor) =>
            onChange({
              ...headerData,
              navGroupStyle: { ...group, textColor },
            })
          }
        />
        <TextStyleControls
          value={group.textStyle}
          onChange={(textStyle) =>
            onChange({
              ...headerData,
              navGroupStyle: { ...group, textStyle },
            })
          }
        />
      </InspectorShell>
    )
  }

  if (editingId === SOCIAL_GROUP_ID) {
    const group = headerData.socialGroupStyle
    return (
      <InspectorShell
        title={copy.headerSocialTitle}
        lead={copy.headerSocialGroupDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <ColorField
          label={copy.groupIconColor}
          value={group.iconColor}
          onChange={(iconColor) =>
            onChange({
              ...headerData,
              socialGroupStyle: { ...group, iconColor },
            })
          }
        />
        <ColorField
          label={copy.groupTextColor}
          value={group.textColor}
          onChange={(textColor) =>
            onChange({
              ...headerData,
              socialGroupStyle: { ...group, textColor },
            })
          }
        />
      </InspectorShell>
    )
  }

  if (editingId === LOGO_ID) {
    return (
      <InspectorShell
        title={copy.headerLogoTitle}
        lead={copy.headerLogoDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
      >
        <MediaPickerField
          urls={headerData.logoUrl ? [headerData.logoUrl] : []}
          folder="chrome"
          onChange={(urls) =>
            onChange({ ...headerData, logoUrl: urls[0] ?? '' })
          }
        />
        <SizePresetControls
          label={copy.logoHeight}
          value={nearestLogoSize(headerData.logoHeight)}
          onChange={(size) =>
            onChange({ ...headerData, logoHeight: LOGO_HEIGHT[size] })
          }
        />
        <p className="admin__lead">{copy.logoHeightHint}</p>
      </InspectorShell>
    )
  }

  if (editingId === MENU_ID) {
    return (
      <InspectorShell
        title={copy.headerMenuTitle}
        lead={copy.headerMenuDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={setTab}
      >
        <FieldWithShow
          label={copy.menuOpenLabel}
          show
          onShow={() => {}}
          hideToggle
          textStyle={headerData.menuOpenStyle}
          onTextStyle={(menuOpenStyle) =>
            onChange({ ...headerData, menuOpenStyle })
          }
        >
          <input
            className="admin__input"
            type="text"
            value={headerData.menuOpen[tab] ?? ''}
            onChange={(event) =>
              onChange({
                ...headerData,
                menuOpen: {
                  ...headerData.menuOpen,
                  [tab]: event.target.value,
                },
              })
            }
          />
        </FieldWithShow>
        <FieldWithShow
          label={copy.menuCloseLabel}
          show
          onShow={() => {}}
          hideToggle
          textStyle={headerData.menuCloseStyle}
          onTextStyle={(menuCloseStyle) =>
            onChange({ ...headerData, menuCloseStyle })
          }
        >
          <input
            className="admin__input"
            type="text"
            value={headerData.menuClose[tab] ?? ''}
            onChange={(event) =>
              onChange({
                ...headerData,
                menuClose: {
                  ...headerData.menuClose,
                  [tab]: event.target.value,
                },
              })
            }
          />
        </FieldWithShow>
      </InspectorShell>
    )
  }

  if (editingId === CTA_ID) {
    const selectValue = buttonSelectValue(headerData.ctaTo)
    return (
      <InspectorShell
        title={copy.headerCtaTitle}
        lead={copy.headerCtaDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={setTab}
      >
        <FieldWithShow
          label={copy.ctaLabel}
          show
          onShow={() => {}}
          hideToggle
          textStyle={headerData.ctaLabelStyle}
          onTextStyle={(ctaLabelStyle) =>
            onChange({ ...headerData, ctaLabelStyle })
          }
        >
          <input
            className="admin__input"
            type="text"
            value={headerData.ctaLabel[tab] ?? ''}
            onChange={(event) =>
              onChange({
                ...headerData,
                ctaLabel: {
                  ...headerData.ctaLabel,
                  [tab]: event.target.value,
                },
              })
            }
          />
        </FieldWithShow>
        <ButtonStyleControls
          value={headerData.ctaButtonStyle}
          onChange={(ctaButtonStyle) =>
            onChange({ ...headerData, ctaButtonStyle })
          }
        />
        <AdminSelect
          label={copy.ctaLink}
          value={selectValue}
          options={linkTargetOptions(copy.linkExternal)}
          onChange={(value) => {
            onChange({
              ...headerData,
              ctaTo:
                value === EXTERNAL_LINK_VALUE
                  ? isExternalHref(headerData.ctaTo)
                    ? headerData.ctaTo
                    : ''
                  : value,
            })
          }}
        />
        {selectValue === EXTERNAL_LINK_VALUE ? (
          <label className="admin__label">
            {copy.externalUrl}
            <input
              className="admin__input"
              type="url"
              placeholder={copy.externalPlaceholder}
              value={headerData.ctaTo}
              onChange={(event) =>
                onChange({ ...headerData, ctaTo: event.target.value })
              }
            />
          </label>
        ) : null}
        <IconSelect
          label={copy.ctaIcon}
          value={headerData.ctaIconId}
          onChange={(ctaIconId) => onChange({ ...headerData, ctaIconId })}
        />
      </InspectorShell>
    )
  }

  if (editingNav) {
    const selectValue = buttonSelectValue(editingNav.path)
    const fallbackName = editingNav.label.pt || copy.navItemTitle
    return (
      <InspectorShell
        titleNode={
          <EditableTitle
            value={editingNav.name}
            fallback={fallbackName}
            onChange={(name) => replaceNav({ ...editingNav, name })}
          />
        }
        lead={copy.navItemDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        tab={tab}
        onTab={setTab}
        onDelete={() => setPendingRemove({ kind: 'nav', id: editingNav.id })}
        deleteDialog={deleteDialog}
      >
        <FieldWithShow
          label={copy.navLabel}
          show
          onShow={() => {}}
          hideToggle
          textStyle={editingNav.labelStyle}
          onTextStyle={(labelStyle) => replaceNav({ ...editingNav, labelStyle })}
        >
          <input
            className="admin__input"
            type="text"
            value={editingNav.label[tab] ?? ''}
            onChange={(event) =>
              replaceNav({
                ...editingNav,
                label: { ...editingNav.label, [tab]: event.target.value },
              })
            }
          />
        </FieldWithShow>
        <FieldWithShow
          label={copy.navDescription}
          show
          onShow={() => {}}
          hideToggle
          textStyle={editingNav.descriptionStyle}
          onTextStyle={(descriptionStyle) =>
            replaceNav({ ...editingNav, descriptionStyle })
          }
        >
          <textarea
            className="admin__textarea"
            rows={3}
            value={editingNav.description[tab] ?? ''}
            onChange={(event) =>
              replaceNav({
                ...editingNav,
                description: {
                  ...editingNav.description,
                  [tab]: event.target.value,
                },
              })
            }
          />
        </FieldWithShow>
        <label className="admin__label">
          {copy.accents}
          <input
            className="admin__input"
            type="text"
            value={editingNav.accents[tab].join(', ')}
            onChange={(event) =>
              replaceNav({
                ...editingNav,
                accents: {
                  ...editingNav.accents,
                  [tab]: event.target.value
                    .split(',')
                    .map((word) => word.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </label>
        <AdminSelect
          label={copy.navPath}
          value={selectValue}
          options={linkTargetOptions(copy.linkExternal)}
          onChange={(value) => {
            replaceNav({
              ...editingNav,
              path:
                value === EXTERNAL_LINK_VALUE
                  ? isExternalHref(editingNav.path)
                    ? editingNav.path
                    : ''
                  : value,
              accent:
                value === '/'
                  ? null
                  : BUTTON_TARGETS.find((target) => target.to === value)
                      ?.label ?? editingNav.accent,
            })
          }}
        />
        {selectValue === EXTERNAL_LINK_VALUE ? (
          <label className="admin__label">
            {copy.externalUrl}
            <input
              className="admin__input"
              type="text"
              placeholder={copy.externalPlaceholder}
              value={editingNav.path}
              onChange={(event) =>
                replaceNav({ ...editingNav, path: event.target.value })
              }
            />
          </label>
        ) : null}
        <MediaPickerField
          urls={editingNav.imageUrl ? [editingNav.imageUrl] : []}
          folder="chrome"
          onChange={(urls) =>
            replaceNav({ ...editingNav, imageUrl: urls[0] ?? '' })
          }
        />
      </InspectorShell>
    )
  }

  if (editingSocial) {
    const fallbackName = editingSocial.label || copy.socialItemTitle
    return (
      <InspectorShell
        titleNode={
          <EditableTitle
            value={editingSocial.name}
            fallback={fallbackName}
            onChange={(name) => replaceSocial({ ...editingSocial, name })}
          />
        }
        lead={copy.socialItemDesc}
        onClose={() => onEditingIdChange(null)}
        saveLabel={saveLabel}
        saveStatus={saveStatus}
        isDirty={isDirty}
        onSave={onSave}
        onDelete={() =>
          setPendingRemove({ kind: 'social', id: editingSocial.id })
        }
        deleteDialog={deleteDialog}
      >
        <FieldWithShow
          label={copy.socialLabel}
          show
          onShow={() => {}}
          hideToggle
          textStyle={editingSocial.labelStyle}
          onTextStyle={(labelStyle) =>
            replaceSocial({ ...editingSocial, labelStyle })
          }
        >
          <input
            className="admin__input"
            type="text"
            value={editingSocial.label}
            onChange={(event) =>
              replaceSocial({ ...editingSocial, label: event.target.value })
            }
          />
        </FieldWithShow>
        <label className="admin__label">
          {copy.socialHref}
          <input
            className="admin__input"
            type="text"
            value={editingSocial.href}
            onChange={(event) =>
              replaceSocial({ ...editingSocial, href: event.target.value })
            }
          />
        </label>
        <IconSelect
          label={copy.socialIcon}
          value={editingSocial.iconId}
          onChange={(iconId) => replaceSocial({ ...editingSocial, iconId })}
        />
      </InspectorShell>
    )
  }

  return (
    <div className="admin__inspector-empty">
      <h2>{copy.inspectorEmptyTitle}</h2>
      <p className="admin__lead">{copy.inspectorEmptyDesc}</p>
    </div>
  )
}

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

function InspectorShell({
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
