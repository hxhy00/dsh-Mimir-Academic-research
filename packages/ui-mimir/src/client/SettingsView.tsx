/**
 * The settings view: the workbench's global configuration surface. The
 * appearance rows edit the host theme preference through two dropdowns —
 * colour style (paper/blue/pink) and light/dark mode (system/light/dark) —
 * plus locale (zh/en) and content width, all through the injected chrome
 * verbs; the sxng-cli and image-API configs are the same shared panels the
 * papers/meetings views reuse, rendered flat (always-open) so every setting
 * has one management surface here.
 * @module dsh-client-ui-mimir/client/SettingsView
 */

import type { ResearchFailureView, ResearchImageGenView, ResearchSxngConfigView } from './controller.ts'
import type { ResearchKey } from './locales.ts'
import type { ResearchT } from './view-common.ts'
import { ImageGenConfigPanel, SxngConfigPanel } from './ConfigPanels.tsx'
import css from './ResearchPanel.module.css'

/** The colour styles (hue) in display order. */
const THEME_HUES: readonly ('paper' | 'blue' | 'pink')[] = ['paper', 'blue', 'pink']

/** The light/dark modes in display order. */
const THEME_MODES: readonly ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark']

/** The two shipped locales in display order. */
const LOCALES: readonly ('zh' | 'en')[] = ['zh', 'en']

/** The content-width presets in display order (px). */
const CONTENT_WIDTHS: readonly { readonly value: number; readonly label: ResearchKey }[] = [
  { value: 900, label: 'settings.contentWidth.narrow' },
  { value: 1100, label: 'settings.contentWidth.medium' },
  { value: 1360, label: 'settings.contentWidth.wide' },
  { value: 0, label: 'settings.contentWidth.full' },
]

/** Locale key of one colour style's label. */
const HUE_LABELS: Record<'paper' | 'blue' | 'pink', ResearchKey> = {
  paper: 'settings.theme.paper',
  blue: 'settings.theme.blue',
  pink: 'settings.theme.pink',
}

/** Locale key of one light/dark mode's label. */
const MODE_LABELS: Record<'system' | 'light' | 'dark', ResearchKey> = {
  system: 'settings.theme.system',
  light: 'settings.theme.light',
  dark: 'settings.theme.dark',
}

/** The colour style of one combined theme preference. */
function hueOf(preference: 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark'): 'paper' | 'blue' | 'pink' {
  return preference === 'blue' || preference === 'blue-dark' ? 'blue' : preference === 'pink' || preference === 'pink-dark' ? 'pink' : 'paper'
}

/** The light/dark mode of one combined theme preference. */
function modeOf(preference: 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark'): 'system' | 'light' | 'dark' {
  return preference === 'system' ? 'system' : preference === 'dark' || preference === 'blue-dark' || preference === 'pink-dark' ? 'dark' : 'light'
}

/** The combined theme preference of one colour style and one mode. */
function preferenceOf(hue: 'paper' | 'blue' | 'pink', mode: 'system' | 'light' | 'dark'): 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark' {
  if (mode === 'system') return 'system'
  if (mode === 'dark') return hue === 'blue' ? 'blue-dark' : hue === 'pink' ? 'pink-dark' : 'dark'
  return hue === 'blue' ? 'blue' : hue === 'pink' ? 'pink' : 'light'
}

/** Locale key of one locale's label. */
const LOCALE_LABELS: Record<'zh' | 'en', ResearchKey> = {
  zh: 'settings.language.zh',
  en: 'settings.language.en',
}

/**
 * The appearance rows: a colour-style select, a light/dark-mode select and a
 * locale select. Both theme selects write through the injected verb; the
 * chrome snapshot re-renders the selection when the host preference changes.
 */
function AppearanceRows({ preference, locale, contentWidth, setTheme, setLocale, setContentWidth, t }: {
  readonly preference: 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark'
  readonly locale: string
  readonly contentWidth: number
  readonly setTheme: (preference: 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark') => void
  readonly setLocale: (locale: 'zh' | 'en') => void
  readonly setContentWidth: (width: number) => void
  readonly t: ResearchT
}) {
  const hue = hueOf(preference)
  const mode = modeOf(preference)
  return (
    <div className={css.settingsRows}>
      <label className={css.settingsRow}>
        <span className={css.fieldLabel}>{t('settings.themeStyle')}</span>
        <select
          className={css.settingsSelect}
          value={hue}
          aria-label={t('settings.themeStyle')}
          onChange={event => { setTheme(preferenceOf(event.target.value as 'paper' | 'blue' | 'pink', mode)) }}
        >
          {THEME_HUES.map(value => (
            <option key={value} value={value}>{t(HUE_LABELS[value])}</option>
          ))}
        </select>
      </label>
      <label className={css.settingsRow}>
        <span className={css.fieldLabel}>{t('settings.themeMode')}</span>
        <select
          className={css.settingsSelect}
          value={mode}
          aria-label={t('settings.themeMode')}
          onChange={event => { setTheme(preferenceOf(hue, event.target.value as 'system' | 'light' | 'dark')) }}
        >
          {THEME_MODES.map(value => (
            <option key={value} value={value}>{t(MODE_LABELS[value])}</option>
          ))}
        </select>
      </label>
      <label className={css.settingsRow}>
        <span className={css.fieldLabel}>{t('settings.language')}</span>
        <select
          className={css.settingsSelect}
          value={locale}
          aria-label={t('settings.language')}
          onChange={event => { setLocale(event.target.value as 'zh' | 'en') }}
        >
          {LOCALES.map(value => (
            <option key={value} value={value}>{t(LOCALE_LABELS[value])}</option>
          ))}
        </select>
      </label>
      <label className={css.settingsRow}>
        <span className={css.fieldLabel}>{t('settings.contentWidth')}</span>
        <select
          className={css.settingsSelect}
          value={contentWidth}
          aria-label={t('settings.contentWidth')}
          onChange={event => { setContentWidth(Number(event.target.value)) }}
        >
          {CONTENT_WIDTHS.map(option => (
            <option key={option.value} value={option.value}>{t(option.label)}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

/**
 * @param props - the chrome snapshot (theme preference + locale), the chrome
 * verbs, the sxng/image-gen config slices and verbs, and copy.
 * @returns the settings view.
 */
export function SettingsView({
  preference, locale, contentWidth, setTheme, setLocale, setContentWidth,
  sxngConfig, getSxngConfig, saveSxngConfig,
  imageGen, getImageGenConfig, saveImageGenConfig, t,
}: {
  readonly preference: 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark'
  readonly locale: string
  readonly contentWidth: number
  readonly setTheme: (preference: 'light' | 'dark' | 'system' | 'blue' | 'blue-dark' | 'pink' | 'pink-dark') => void
  readonly setLocale: (locale: 'zh' | 'en') => void
  readonly setContentWidth: (width: number) => void
  readonly sxngConfig: ResearchSxngConfigView
  readonly getSxngConfig: () => void
  readonly saveSxngConfig: (input: {
    baseUrl?: string; defaultEngine?: string; allowedEngines?: readonly string[]; defaultLimit?: number
    defaultFormat?: 'md' | 'json'; useProxy?: boolean; proxyUrl?: string; timeout?: number
    ollamaApiKey?: string; redundancyThreshold?: number; redundancyBigramThreshold?: number
  }) => Promise<ResearchFailureView | null>
  readonly imageGen: ResearchImageGenView
  readonly getImageGenConfig: () => void
  readonly saveImageGenConfig: (input: {
    baseUrl?: string | undefined
    apiKey?: string | undefined
    model?: string | undefined
    size?: string | undefined
  }) => Promise<ResearchFailureView | null>
  readonly t: ResearchT
}) {
  return (
    <section className={css.viewBody}>
      <div className={css.settingsSection}>
        <h3 className={css.sectionTitle}>{t('settings.appearance')}</h3>
        <p className={css.hint}>{t('settings.appearanceHint')}</p>
        <AppearanceRows
          preference={preference}
          locale={locale}
          contentWidth={contentWidth}
          setTheme={setTheme}
          setLocale={setLocale}
          setContentWidth={setContentWidth}
          t={t}
        />
      </div>
      <div className={css.settingsSection}>
        <h3 className={css.sectionTitle}>{t('settings.sxng')}</h3>
        <p className={css.hint}>{t('settings.sxngHint')}</p>
        <SxngConfigPanel config={sxngConfig} getConfig={getSxngConfig} saveConfig={saveSxngConfig} t={t} flat />
      </div>
      <div className={css.settingsSection}>
        <h3 className={css.sectionTitle}>{t('settings.imageGen')}</h3>
        <p className={css.hint}>{t('settings.imageGenHint')}</p>
        <ImageGenConfigPanel config={imageGen} getConfig={getImageGenConfig} saveConfig={saveImageGenConfig} t={t} flat />
      </div>
    </section>
  )
}