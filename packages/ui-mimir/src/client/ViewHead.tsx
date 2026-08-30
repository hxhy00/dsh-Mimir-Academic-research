/**
 * The shared view header: a right-aligned action row. The big view title is
 * intentionally omitted — the left rail already names the active view, so a
 * header only carries the view's action buttons (top-right). A view with no
 * actions renders nothing, so it never reads as a bare toolbar floating over
 * content.
 * @module dsh-client-ui-mimir/client/ViewHead
 */

import type { ReactNode } from 'react'
import css from './ResearchPanel.module.css'

/**
 * @param props - the view's action slot (buttons rendered top-right).
 * @returns the view header row, or null when there are no actions.
 */
export function ViewHead({ children }: {
  readonly children?: ReactNode
}) {
  if (children === undefined || children === false) return null
  return (
    <header className={css.viewHead}>
      <div className={css.viewActions}>{children}</div>
    </header>
  )
}
