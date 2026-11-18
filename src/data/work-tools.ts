/**
 * Ferramentas/plataformas em que atuo (página Trabalho). Os textos ficam em i18n/copy.ts, na mesma ordem.
 * `refs` aponta para as pastas de projeto do componente "Clientes e projetos": `root` é o índice da pasta
 * principal (cliente) e `project` o índice do projeto dentro dela, em `clients.folders`.
 * Ferramenta sem `refs` mostra "projetos de referência em breve".
 */
export type WorkToolRef = { root: number; project: number }

export type WorkTool = {
  id: string
  name: string
  /** Arquivo em /public. Sem logo, o cartão mostra a inicial. */
  logo?: string
  color: string
  refs: readonly WorkToolRef[]
}

export const WORK_TOOLS: readonly WorkTool[] = [
  // Todas mostram a inicial até os logos oficiais chegarem. Para a Nuvemshop, voltar com:
  // logo: '/about/skills/nuvemshop.svg'
  { id: 'nuvemshop', name: 'Nuvemshop', color: '#3d8bff', refs: [{ root: 0, project: 0 }] },
  { id: 'deco', name: 'Deco', color: '#2fd180', refs: [] },
  { id: 'vtex', name: 'VTEX', color: '#f71963', refs: [] },
  { id: 'shopify', name: 'Shopify', color: '#95bf47', refs: [] },
]
