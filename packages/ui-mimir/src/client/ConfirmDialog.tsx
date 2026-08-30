/**
 * A shared destructive-confirmation dialog built on Radix's AlertDialog. It
 * replaces the native `window.confirm` calls scattered across the views with
 * a styled, accessible modal that matches the workbench's paper-ink theme:
 * Radix supplies the modal behaviour (focus trap, focus restore, Esc-to-close,
 * `aria-modal`, `aria-labelledby`/`aria-describedby` wiring) while this
 * component owns only the copy and the confirm/cancel verbs.
 *
 * Usage is imperative-friendly: render it once per view, drive it with a
 * `pending` state holding the item to confirm (or null), and call `onConfirm`
 * when the user accepts.
 * @module dsh-client-ui-mimir/client/ConfirmDialog
 */

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { ReactNode } from 'react'
import type { ResearchT } from './view-common.ts'
import css from './ResearchPanel.module.css'

/**
 * @param props - the open flag, the title/description copy, the confirm/cancel
 * labels, the confirm verb, and copy.
 * @returns the alert dialog, portaled to the document body.
 */
export function ConfirmDialog({
  open, title, description, confirmLabel, cancelLabel, busy = false, onConfirm, onOpenChange, t,
}: {
  readonly open: boolean
  readonly title: string
  readonly description?: ReactNode
  readonly confirmLabel: string
  readonly cancelLabel?: string
  readonly busy?: boolean
  readonly onConfirm: () => void
  readonly onOpenChange: (open: boolean) => void
  readonly t: ResearchT
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={css.modalOverlay} />
        <AlertDialog.Content
          className={css.modalDialog}
          onEscapeKeyDown={(event) => { event.stopPropagation() }}
        >
          <AlertDialog.Title asChild>
            <h3 className={css.modalDialogTitle}>{title}</h3>
          </AlertDialog.Title>
          {description !== undefined && (
            <AlertDialog.Description asChild>
              <p className={css.hint}>{description}</p>
            </AlertDialog.Description>
          )}
          <div className={css.modalActions}>
            <AlertDialog.Cancel asChild>
              <button type="button" className={css.btn} disabled={busy}>
                {cancelLabel ?? t('confirm.cancel')}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button type="button" className={css.btn} data-danger disabled={busy} onClick={onConfirm}>
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
