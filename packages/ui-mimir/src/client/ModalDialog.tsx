/**
 * A shared modal shell built on Radix's Dialog, used to host the create/edit
 * forms of the experiments and servers views. It replaces the previous
 * inline page-level form cards with a focused, accessible modal: Radix
 * supplies the modal behaviour (focus trap, focus restore, Esc-to-close,
 * `aria-modal`, `aria-labelledby`/`aria-describedby` wiring) while this
 * component owns only the title and the close verb.
 *
 * The content is portaled to `document.body`,
 * so the z-index is relative to the root stacking context and must clear the
 * workbench (1100) — the shared `.modalOverlay`/`.modalDialog` styles are
 * reused for the backdrop and the panel.
 * @module dsh-client-ui-mimir/client/ModalDialog
 */

import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import css from './ResearchPanel.module.css'

/**
 * @param props - the open flag, the title, the body content, and the close
 * callback (fired on Esc / backdrop click / the close button).
 * @returns the modal dialog, portaled to the document body.
 */
export function ModalDialog({ open, title, children, onClose }: {
  readonly open: boolean
  readonly title: string
  readonly children: ReactNode
  readonly onClose: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className={css.modalOverlay} />
        <Dialog.Content
          className={css.modalDialog}
          onEscapeKeyDown={(event) => { event.stopPropagation() }}
        >
          <Dialog.Title asChild>
            <h3 className={css.modalDialogTitle}>{title}</h3>
          </Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
