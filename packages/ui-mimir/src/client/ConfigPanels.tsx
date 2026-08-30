/**
 * Shared collapsible configuration panels: the sxng-cli global configuration
 * used by Web search (SearXNG) and the image-generation API used for AI
 * illustrations in meeting decks. Both are global (not per-project) settings,
 * so they live in the settings view as the single management surface; the
 * papers and meetings views reuse the same panels for in-context editing.
 * @module dsh-client-ui-mimir/client/ConfigPanels
 */

import { useEffect, useState } from 'react'
import type { ResearchFailureView, ResearchImageGenView, ResearchSxngConfigView } from './controller.ts'
import { failureCopy, type ResearchT } from './view-common.ts'
import css from './ResearchPanel.module.css'

/**
 * Editor for sxng-cli's global configuration. Collapsible by default; pass
 * `flat` to render the form always-open (the settings view's flat layout).
 * @param props - the sxng config slice, the load/save verbs, copy, and layout.
 */
export function SxngConfigPanel({ config, getConfig, saveConfig, t, flat = false }: {
  readonly config: ResearchSxngConfigView
  readonly getConfig: () => void
  readonly saveConfig: (input: {
    baseUrl?: string; defaultEngine?: string; allowedEngines?: readonly string[]; defaultLimit?: number
    defaultFormat?: 'md' | 'json'; useProxy?: boolean; proxyUrl?: string; timeout?: number
    ollamaApiKey?: string; redundancyThreshold?: number; redundancyBigramThreshold?: number
  }) => Promise<ResearchFailureView | null>
  readonly t: ResearchT
  readonly flat?: boolean
}) {
  const [open, setOpen] = useState(flat)
  const [draft, setDraft] = useState<Partial<{
    baseUrl: string; defaultEngine: string; allowedEngines: string; defaultLimit: string; defaultFormat: 'md' | 'json'
    useProxy: boolean; proxyUrl: string; timeout: string; ollamaApiKey: string; redundancyThreshold: string; redundancyBigramThreshold: string
  }>>({})
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<ResearchFailureView | null>(null)
  useEffect(() => { getConfig() }, [getConfig])
  // Flat mode has no toggle to snapshot the store into the draft, so the draft
  // tracks the store's masked view directly (the apiKey box always starts
  // empty: empty on save = keep the stored key, whose mask shows as the
  // placeholder).
  useEffect(() => {
    if (!flat) return
    setDraft({ baseUrl: config.baseUrl, defaultEngine: config.defaultEngine, allowedEngines: config.allowedEngines.join(', '), defaultLimit: String(config.defaultLimit), defaultFormat: config.defaultFormat, useProxy: config.useProxy, proxyUrl: config.proxyUrl, timeout: String(config.timeout), ollamaApiKey: '', redundancyThreshold: String(config.redundancyThreshold), redundancyBigramThreshold: String(config.redundancyBigramThreshold) })
  }, [flat, config])
  const toggle = (): void => {
    if (!open) setDraft({ baseUrl: config.baseUrl, defaultEngine: config.defaultEngine, allowedEngines: config.allowedEngines.join(', '), defaultLimit: String(config.defaultLimit), defaultFormat: config.defaultFormat, useProxy: config.useProxy, proxyUrl: config.proxyUrl, timeout: String(config.timeout), ollamaApiKey: '', redundancyThreshold: String(config.redundancyThreshold), redundancyBigramThreshold: String(config.redundancyBigramThreshold) })
    setFailure(null); setOpen(value => !value)
  }
  const save = (): void => {
    if (saving) return
    setSaving(true); setFailure(null)
    void saveConfig({
      ...(draft.baseUrl?.trim() === '' || draft.baseUrl === undefined ? {} : { baseUrl: draft.baseUrl.trim() }),
      ...(draft.defaultEngine === undefined ? {} : { defaultEngine: draft.defaultEngine }),
      ...(draft.allowedEngines === undefined ? {} : { allowedEngines: draft.allowedEngines.split(',').map(value => value.trim()).filter(Boolean) }),
      ...(draft.defaultLimit === undefined ? {} : { defaultLimit: Number(draft.defaultLimit) }),
      ...(draft.defaultFormat === undefined ? {} : { defaultFormat: draft.defaultFormat }),
      ...(draft.useProxy === undefined ? {} : { useProxy: draft.useProxy }),
      ...(draft.proxyUrl === undefined ? {} : { proxyUrl: draft.proxyUrl }),
      ...(draft.timeout === undefined ? {} : { timeout: Number(draft.timeout) }),
      ...(draft.ollamaApiKey === undefined || draft.ollamaApiKey === '' ? {} : { ollamaApiKey: draft.ollamaApiKey }),
      ...(draft.redundancyThreshold === undefined ? {} : { redundancyThreshold: Number(draft.redundancyThreshold) }),
      ...(draft.redundancyBigramThreshold === undefined ? {} : { redundancyBigramThreshold: Number(draft.redundancyBigramThreshold) }),
    }).then(result => { if (result !== null) setFailure(result); else if (!flat) setOpen(false) }).finally(() => { setSaving(false) })
  }
  return <section className={flat ? css.configPanelFlat : css.imageGenPanel}>
    {!flat && <button type="button" className={css.imageGenToggle} aria-expanded={open} onClick={toggle}><span aria-hidden>{open ? '▾' : '▸'}</span>{t('papers.sxngConfig')}{config.configured && <span className={css.imageGenBadge}>{t('papers.sxngConfigured')}</span>}</button>}
    {open && <div className={css.meetingFormRow}>
      <input className={css.input} value={draft.baseUrl ?? ''} placeholder="baseUrl" aria-label="baseUrl" onChange={e => setDraft({ ...draft, baseUrl: e.target.value })} />
      <input className={css.input} value={draft.defaultEngine ?? ''} placeholder="defaultEngine" aria-label="defaultEngine" onChange={e => setDraft({ ...draft, defaultEngine: e.target.value })} />
      <input className={css.input} value={draft.allowedEngines ?? ''} placeholder="allowedEngines (comma separated)" aria-label="allowedEngines" onChange={e => setDraft({ ...draft, allowedEngines: e.target.value })} />
      <input className={css.input} type="number" value={draft.defaultLimit ?? ''} placeholder="defaultLimit" aria-label="defaultLimit" onChange={e => setDraft({ ...draft, defaultLimit: e.target.value })} />
      <select className={css.input} value={draft.defaultFormat ?? 'md'} aria-label="defaultFormat" onChange={e => setDraft({ ...draft, defaultFormat: e.target.value as 'md' | 'json' })}><option value="md">md</option><option value="json">json</option></select>
      <label><input type="checkbox" checked={draft.useProxy ?? false} onChange={e => setDraft({ ...draft, useProxy: e.target.checked })} /> useProxy</label>
      <input className={css.input} value={draft.proxyUrl ?? ''} placeholder="proxyUrl" aria-label="proxyUrl" onChange={e => setDraft({ ...draft, proxyUrl: e.target.value })} />
      <input className={css.input} type="number" value={draft.timeout ?? ''} placeholder="timeout (ms)" aria-label="timeout" onChange={e => setDraft({ ...draft, timeout: e.target.value })} />
      <input className={css.input} type="password" value={draft.ollamaApiKey ?? ''} placeholder={config.ollamaApiKeyPreview || 'ollamaApiKey'} aria-label="ollamaApiKey" onChange={e => setDraft({ ...draft, ollamaApiKey: e.target.value })} />
      <input className={css.input} type="number" step="0.01" value={draft.redundancyThreshold ?? ''} placeholder="redundancyThreshold" aria-label="redundancyThreshold" onChange={e => setDraft({ ...draft, redundancyThreshold: e.target.value })} />
      <input className={css.input} type="number" step="0.01" value={draft.redundancyBigramThreshold ?? ''} placeholder="redundancyBigramThreshold" aria-label="redundancyBigramThreshold" onChange={e => setDraft({ ...draft, redundancyBigramThreshold: e.target.value })} />
      <button type="button" className={css.btnPrimary} disabled={saving} onClick={save}>{saving ? t('papers.sxngSaving') : t('papers.sxngSave')}</button>
      {failure !== null && <p className={css.failure} role="alert">{failure.message}</p>}
    </div>}
  </section>
}

/**
 * Editor for the image-generation API config. Collapsible by default; pass
 * `flat` to render the form always-open (the settings view's flat layout).
 * @param props - the image-gen config slice, the load/save verbs, copy, and layout.
 */
export function ImageGenConfigPanel({ config, getConfig, saveConfig, t, flat = false }: {
  readonly config: ResearchImageGenView
  readonly getConfig: () => void
  readonly saveConfig: (input: {
    baseUrl?: string | undefined
    apiKey?: string | undefined
    model?: string | undefined
    size?: string | undefined
  }) => Promise<ResearchFailureView | null>
  readonly t: ResearchT
  readonly flat?: boolean
}) {
  const [open, setOpen] = useState(flat)
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [size, setSize] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<ResearchFailureView | null>(null)
  useEffect(() => { getConfig() }, [getConfig])
  // Flat mode has no toggle to snapshot the store into the fields, so the
  // fields track the store's masked view directly (the apiKey box always
  // starts empty: empty on save = keep the stored key, whose mask shows as the
  // placeholder).
  useEffect(() => {
    if (!flat) return
    setBaseUrl(config.baseUrl)
    setModel(config.model)
    setSize(config.size)
    setApiKey('')
    setFailure(null)
  }, [flat, config])
  // Expanding the fold snapshots the store's masked view into the fields (the
  // apiKey box always starts empty: empty on save = keep the stored key, whose
  // mask shows as the placeholder).
  const toggle = (): void => {
    if (!open) {
      setBaseUrl(config.baseUrl)
      setModel(config.model)
      setSize(config.size)
      setApiKey('')
      setFailure(null)
    }
    setOpen(!open)
  }
  const save = (): void => {
    if (saving) return
    setSaving(true)
    setFailure(null)
    void saveConfig({
      ...(baseUrl.trim() === '' ? {} : { baseUrl: baseUrl.trim() }),
      ...(model.trim() === '' ? {} : { model: model.trim() }),
      ...(size.trim() === '' ? {} : { size: size.trim() }),
      ...(apiKey === '' ? {} : { apiKey }),
    }).then((settled) => {
      setSaving(false)
      if (settled !== null) {
        setFailure(settled)
        return
      }
      setApiKey('')
      if (!flat) setOpen(false)
    })
  }
  return (
    <div className={flat ? css.configPanelFlat : css.imageGenPanel}>
      {!flat && (
        <button
          type="button"
          className={css.imageGenToggle}
          aria-expanded={open}
          onClick={toggle}
        >
          <span aria-hidden>{open ? '▾' : '▸'}</span>
          {t('meetings.imageGenConfig')}
          {config.configured && (
            <span className={css.imageGenBadge}>{t('meetings.imageGenConfigured')}</span>
          )}
        </button>
      )}
      {open && (
        <>
          <div className={css.meetingFormRow}>
            <input
              className={css.input}
              value={baseUrl}
              placeholder={t('meetings.imageGenBaseUrl')}
              aria-label={t('meetings.imageGenBaseUrl')}
              onChange={event => { setBaseUrl(event.target.value) }}
            />
            <input
              className={css.input}
              value={model}
              placeholder={t('meetings.imageGenModel')}
              aria-label={t('meetings.imageGenModel')}
              onChange={event => { setModel(event.target.value) }}
            />
            <input
              className={css.input}
              value={size}
              placeholder={t('meetings.imageGenSize')}
              aria-label={t('meetings.imageGenSize')}
              onChange={event => { setSize(event.target.value) }}
            />
          </div>
          <div className={css.meetingFormRow}>
            <input
              className={css.input}
              type="password"
              value={apiKey}
              placeholder={config.apiKeyPreview === '' ? t('meetings.imageGenApiKeyPlaceholder') : config.apiKeyPreview}
              aria-label={t('meetings.imageGenApiKeyPlaceholder')}
              onChange={event => { setApiKey(event.target.value) }}
            />
            <button type="button" className={css.btnPrimary} disabled={saving} onClick={save}>
              {saving ? t('meetings.imageGenSaving') : t('meetings.imageGenSave')}
            </button>
          </div>
          {failure !== null && (
            <p className={css.failure} role="alert">
              {t('meetings.imageGenSaveFailed')}：{failureCopy(t, failure)}
            </p>
          )}
        </>
      )}
    </div>
  )
}
