/**
 * The servers view's create/edit form, hosted in a modal dialog: name, host,
 * port, username, note, and a tag editor (Enter or comma commits a tag).
 * Saving goes through the `saveServer` verb; the controller patches the
 * loaded slice and toasts, the form only surfaces a rejection and closes on
 * success.
 * @module dsh-client-ui-mimir/client/ServerForm
 */

import { useState } from 'react'
import type { ServerInput, ServerRecord } from 'dsh-mimir/types'
import type { ResearchFailureView } from './controller.ts'
import type { ResearchT } from './view-common.ts'
import { ModalDialog } from './ModalDialog.tsx'
import css from './ResearchPanel.module.css'

/** Form field state: the port stays text until submit. */
interface ServerFormState {
  readonly name: string
  readonly host: string
  readonly port: string
  readonly username: string
  readonly note: string
  readonly tags: readonly string[]
}

/** The blank form the add button opens. */
const EMPTY_FORM: ServerFormState = { name: '', host: '', port: '22', username: '', note: '', tags: [] }

/** Form state of one existing record (the edit path's refill). */
function formOf(record: ServerRecord): ServerFormState {
  return {
    name: record.name,
    host: record.host,
    port: String(record.port),
    username: record.username,
    note: record.note,
    tags: [...record.tags],
  }
}

/**
 * @param props - the record being edited (null = create), the save verb, the
 * close callback, and copy.
 * @returns the modal dialog hosting the server form.
 */
export function ServerForm({ editing, saveServer, onClose, t }: {
  readonly editing: ServerRecord | null
  readonly saveServer: (server: ServerInput) => Promise<ResearchFailureView | null>
  readonly onClose: () => void
  readonly t: ResearchT
}) {
  const [form, setForm] = useState<ServerFormState>(editing === null ? EMPTY_FORM : formOf(editing))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const patchForm = (patch: Partial<ServerFormState>): void => {
    setForm(current => ({ ...current, ...patch }))
  }
  const addTag = (): void => {
    const tag = tagInput.trim()
    if (tag === '') return
    patchForm({ tags: form.tags.includes(tag) ? form.tags : [...form.tags, tag] })
    setTagInput('')
  }
  const submit = (): void => {
    if (saving) return
    setSaving(true)
    setFormError(null)
    // A tag typed but not yet committed with Enter rides along.
    const pending = tagInput.trim()
    const tags = pending === '' || form.tags.includes(pending) ? form.tags : [...form.tags, pending]
    const server: ServerInput = {
      id: editing?.id,
      name: form.name,
      host: form.host,
      port: Number(form.port),
      username: form.username,
      note: form.note,
      tags: [...tags],
    }
    void saveServer(server)
      .then((failure) => {
        if (failure !== null) {
          setFormError(failure.message)
          return
        }
        onClose()
      })
      .finally(() => { setSaving(false) })
  }

  return (
    <ModalDialog
      open
      title={editing === null ? t('servers.form.add') : t('servers.form.edit')}
      onClose={onClose}
    >
      <div className={css.modalForm}>
        <div className={css.serverFormGrid}>
          <label className={css.field}>
            <span className={css.fieldLabel}>{t('servers.form.name')}</span>
            <input
              className={css.input}
              value={form.name}
              placeholder={t('servers.form.namePlaceholder')}
              onChange={event => { patchForm({ name: event.target.value }) }}
            />
          </label>
          <label className={css.field}>
            <span className={css.fieldLabel}>{t('servers.form.host')}</span>
            <input
              className={css.input}
              value={form.host}
              placeholder={t('servers.form.hostPlaceholder')}
              onChange={event => { patchForm({ host: event.target.value }) }}
            />
          </label>
          <label className={css.field}>
            <span className={css.fieldLabel}>{t('servers.form.port')}</span>
            <input
              className={css.input}
              value={form.port}
              inputMode="numeric"
              onChange={event => { patchForm({ port: event.target.value }) }}
            />
          </label>
          <label className={css.field}>
            <span className={css.fieldLabel}>{t('servers.form.username')}</span>
            <input
              className={css.input}
              value={form.username}
              placeholder={t('servers.form.usernamePlaceholder')}
              onChange={event => { patchForm({ username: event.target.value }) }}
            />
          </label>
          <label className={css.field} data-wide>
            <span className={css.fieldLabel}>{t('servers.form.note')}</span>
            <input
              className={css.input}
              value={form.note}
              placeholder={t('servers.form.notePlaceholder')}
              onChange={event => { patchForm({ note: event.target.value }) }}
            />
          </label>
          <div className={css.field} data-wide>
            <span className={css.fieldLabel}>{t('servers.form.tags')}</span>
            <div className={css.tagEditor}>
              {form.tags.map(tag => (
                <span key={tag} className={css.tagPill} data-static>
                  {tag}
                  <button
                    type="button"
                    className={css.tagRemove}
                    aria-label={`${t('servers.removeTag')} ${tag}`}
                    onClick={() => { patchForm({ tags: form.tags.filter(item => item !== tag) }) }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className={css.input}
                value={tagInput}
                placeholder={t('servers.form.tagInputPlaceholder')}
                onChange={event => { setTagInput(event.target.value) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault()
                    addTag()
                  }
                }}
              />
            </div>
          </div>
        </div>
        {formError !== null && (
          <p className={css.failure} role="alert">{formError}</p>
        )}
        <div className={css.serverFormActions}>
          <button type="button" className={css.btnPrimary} disabled={saving} onClick={submit}>
            {t('servers.form.save')}
          </button>
          <button type="button" className={css.btn} disabled={saving} onClick={onClose}>
            {t('servers.form.cancel')}
          </button>
        </div>
      </div>
    </ModalDialog>
  )
}