import { useState, type CSSProperties } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import type { WorkPageCopy } from '../i18n/copy'
import { WORK_TOOLS } from '../data/work-tools'

type WorkToolsProps = {
  copy: WorkPageCopy['tools']
  clients: WorkPageCopy['clients']
  onOpenProject: (rootIndex: number, projectIndex: number) => void
}

/**
 * Ferramentas de atuação: escolha uma plataforma, veja o resumo e os projetos de referência.
 * Clicar numa pasta abre o projeto em "Clientes e projetos".
 */
export function WorkTools({ copy, clients, onOpenProject }: WorkToolsProps) {
  const [selected, setSelected] = useState(WORK_TOOLS[0].id)
  const tool = WORK_TOOLS.find((item) => item.id === selected) ?? WORK_TOOLS[0]
  const toolIndex = WORK_TOOLS.indexOf(tool)
  const summary = copy.items[toolIndex]?.summary ?? ''

  const refs = tool.refs.flatMap((ref) => {
    const root = clients.folders[ref.root]
    const project = root?.projects[ref.project]
    return root && project ? [{ ref, root, project }] : []
  })

  return (
    <div className="wt" style={{ '--tool': tool.color } as CSSProperties}>
      <p className="wt__subtitle">{copy.subtitle}</p>

      <ul className="wt__tabs" role="tablist">
        {WORK_TOOLS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              role="tab"
              aria-selected={item.id === tool.id}
              className="wt-tab"
              data-selected={item.id === tool.id ? '' : undefined}
              style={{ '--tool': item.color } as CSSProperties}
              onClick={() => setSelected(item.id)}
            >
              {item.logo ? (
                <img className="wt-tab__logo" src={item.logo} alt="" />
              ) : (
                <span className="wt-tab__logo wt-tab__logo--letter" aria-hidden>
                  {item.name.charAt(0)}
                </span>
              )}
              <span className="wt-tab__name">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <article className="wt-detail" key={tool.id} aria-live="polite">
        <div className="wt-detail__about">
          {tool.logo ? (
            <img className="wt-detail__logo" src={tool.logo} alt="" />
          ) : (
            <span className="wt-detail__logo wt-detail__logo--letter" aria-hidden>
              {tool.name.charAt(0)}
            </span>
          )}
          <div>
            <h3 className="wt-detail__name">{tool.name}</h3>
            <p className="wt-detail__summary">{summary}</p>
          </div>
        </div>

        <div className="wt-detail__projects">
          <h4 className="wt-detail__sub">{copy.projects}</h4>
          {refs.length === 0 ? (
            <p className="wt-detail__empty">{copy.empty}</p>
          ) : (
            <ul className="wt-refs">
              {refs.map(({ ref, root, project }) => (
                <li key={`${ref.root}-${ref.project}`}>
                  <button
                    type="button"
                    className="wt-link"
                    style={{ '--project': project.color } as CSSProperties}
                    title={copy.open}
                    onClick={() => onOpenProject(ref.root, ref.project)}
                  >
                    <span className="wt-link__dot" aria-hidden />
                    <span className="wt-link__name">{project.label}</span>
                    <span className="wt-link__client">{root.label}</span>
                    <ArrowRight className="wt-link__arrow" weight="bold" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </div>
  )
}
