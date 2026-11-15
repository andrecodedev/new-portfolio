import type { CSSProperties, ReactNode } from 'react'

export type FolderItem =
  | ReactNode
  | string
  | number
  | {
      title?: string
      description?: string
      image?: string
      alt?: string
      content?: ReactNode
      /** Sem papel branco ao redor: o conteúdo (ex.: uma mini pasta) desenha o próprio fundo. */
      bare?: boolean
    }

export type FolderProps = {
  items?: FolderItem[]
  label?: string
  mode?: 'flap' | 'book'
  variant?: 'solid' | 'glass' | 'matte'
  color?: string
  paperColor?: string
  tabPosition?: 'left' | 'center' | 'right'
  layout?: 'spread' | 'row' | 'stack'
  size?: number
  /** Largura (em múltiplos da pasta) que o leque de itens ocupa ao abrir. Menor = cabe em telas estreitas. */
  spread?: number
  openOn?: 'click' | 'hover'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onItemClick?: (item: FolderItem, index: number) => void
  onItemDrop?: (item: FolderItem, index: number, inside: boolean) => void
  draggable?: boolean
  zoomOnClick?: boolean
  peek?: boolean
  intro?: boolean
  tilt?: number
  bounce?: number
  speed?: number
  frost?: number
  closeOnOutsideClick?: boolean
  theme?: 'dark' | 'light'
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

declare function Folder(props: FolderProps): JSX.Element
export default Folder
