'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Locale } from '@/lib/types';

type AccessibilitySettings = {
  textScale: number;
  highContrast: boolean;
  invertColors: boolean;
  grayscale: boolean;
  dyslexiaFont: boolean;
  highlightLinks: boolean;
  highlightHeadings: boolean;
  readingGuide: boolean;
  hideImages: boolean;
  reduceMotion: boolean;
};

type ToggleKey = Exclude<keyof AccessibilitySettings, 'textScale'>;

const STORAGE_KEY = 'itb-accessibility-settings-v1';
const TEXT_SCALE_MIN = 0.9;
const TEXT_SCALE_MAX = 1.4;
const TEXT_SCALE_STEP = 0.1;

const defaultSettings: AccessibilitySettings = {
  textScale: 1,
  highContrast: false,
  invertColors: false,
  grayscale: false,
  dyslexiaFont: false,
  highlightLinks: false,
  highlightHeadings: false,
  readingGuide: false,
  hideImages: false,
  reduceMotion: false,
};

const classByToggle: Record<ToggleKey, string> = {
  highContrast: 'a11y-high-contrast',
  invertColors: 'a11y-invert',
  grayscale: 'a11y-grayscale',
  dyslexiaFont: 'a11y-dyslexia',
  highlightLinks: 'a11y-highlight-links',
  highlightHeadings: 'a11y-highlight-headings',
  readingGuide: 'a11y-reading-guide',
  hideImages: 'a11y-hide-images',
  reduceMotion: 'a11y-reduce-motion',
};

const copy: Record<
  Locale,
  {
    panelTitle: string;
    panelIntro: string;
    close: string;
    reset: string;
    textSizeTitle: string;
    textSizeDescription: string;
    decreaseText: string;
    increaseText: string;
    currentTextSize: string;
    visualTitle: string;
    navigationTitle: string;
    toggles: Record<ToggleKey, { label: string; description: string; group: 'visual' | 'navigation' }>;
  }
> = {
  en: {
    panelTitle: 'Accessibility Settings',
    panelIntro: 'Customize readability, contrast, and navigation behavior for this browsing session.',
    close: 'Close panel',
    reset: 'Reset settings',
    textSizeTitle: 'Text size',
    textSizeDescription: 'Increase or decrease text scale site-wide.',
    decreaseText: 'Decrease text size',
    increaseText: 'Increase text size',
    currentTextSize: 'Current text size',
    visualTitle: 'Visual accessibility',
    navigationTitle: 'Navigation accessibility',
    toggles: {
      highContrast: {
        label: 'High contrast mode',
        description: 'Boost contrast for stronger visual separation.',
        group: 'visual',
      },
      invertColors: {
        label: 'Invert colors',
        description: 'Invert page colors for alternative viewing.',
        group: 'visual',
      },
      grayscale: {
        label: 'Grayscale mode',
        description: 'Remove color to reduce visual strain.',
        group: 'visual',
      },
      dyslexiaFont: {
        label: 'Dyslexia-friendly font',
        description: 'Use a highly legible open-source font style.',
        group: 'visual',
      },
      highlightLinks: {
        label: 'Highlight links',
        description: 'Underline and highlight links more strongly.',
        group: 'visual',
      },
      highlightHeadings: {
        label: 'Highlight headings',
        description: 'Add a strong background marker to headings.',
        group: 'visual',
      },
      readingGuide: {
        label: 'Reading guide',
        description: 'Show a horizontal guide line that follows pointer movement.',
        group: 'visual',
      },
      hideImages: {
        label: 'Hide images',
        description: 'Hide image media to reduce visual clutter.',
        group: 'visual',
      },
      reduceMotion: {
        label: 'Reduce motion and animations',
        description: 'Minimize transitions and animated movement.',
        group: 'navigation',
      },
    },
  },
  pt: {
    panelTitle: 'Configuracoes de Acessibilidade',
    panelIntro: 'Personalize leitura, contraste e navegacao durante esta sessao.',
    close: 'Fechar painel',
    reset: 'Redefinir configuracoes',
    textSizeTitle: 'Tamanho do texto',
    textSizeDescription: 'Aumente ou diminua o tamanho do texto em todo o site.',
    decreaseText: 'Diminuir tamanho do texto',
    increaseText: 'Aumentar tamanho do texto',
    currentTextSize: 'Tamanho atual do texto',
    visualTitle: 'Acessibilidade visual',
    navigationTitle: 'Acessibilidade de navegacao',
    toggles: {
      highContrast: {
        label: 'Modo de alto contraste',
        description: 'Aumenta o contraste para melhor separacao visual.',
        group: 'visual',
      },
      invertColors: {
        label: 'Inverter cores',
        description: 'Inverte as cores da pagina para visualizacao alternativa.',
        group: 'visual',
      },
      grayscale: {
        label: 'Modo escala de cinza',
        description: 'Remove cores para reduzir esforco visual.',
        group: 'visual',
      },
      dyslexiaFont: {
        label: 'Fonte amigavel para dislexia',
        description: 'Usa uma fonte open-source com alta legibilidade.',
        group: 'visual',
      },
      highlightLinks: {
        label: 'Destacar links',
        description: 'Sublinha e destaca links com maior contraste.',
        group: 'visual',
      },
      highlightHeadings: {
        label: 'Destacar titulos',
        description: 'Aplica marcacao forte nos titulos da pagina.',
        group: 'visual',
      },
      readingGuide: {
        label: 'Guia de leitura',
        description: 'Mostra uma linha horizontal que acompanha o cursor.',
        group: 'visual',
      },
      hideImages: {
        label: 'Ocultar imagens',
        description: 'Oculta imagens para reduzir distracoes visuais.',
        group: 'visual',
      },
      reduceMotion: {
        label: 'Reduzir movimentos e animacoes',
        description: 'Minimiza transicoes e efeitos animados.',
        group: 'navigation',
      },
    },
  },
};

function normalizeSettings(input: unknown): AccessibilitySettings {
  if (!input || typeof input !== 'object') {
    return defaultSettings;
  }

  const candidate = input as Partial<AccessibilitySettings>;
  const textScaleRaw = Number(candidate.textScale);
  const textScale = Number.isFinite(textScaleRaw)
    ? Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, Math.round(textScaleRaw * 10) / 10))
    : defaultSettings.textScale;

  return {
    textScale,
    highContrast: Boolean(candidate.highContrast),
    invertColors: Boolean(candidate.invertColors),
    grayscale: Boolean(candidate.grayscale),
    dyslexiaFont: Boolean(candidate.dyslexiaFont),
    highlightLinks: Boolean(candidate.highlightLinks),
    highlightHeadings: Boolean(candidate.highlightHeadings),
    readingGuide: Boolean(candidate.readingGuide),
    hideImages: Boolean(candidate.hideImages),
    reduceMotion: Boolean(candidate.reduceMotion),
  };
}

function getGuidePosition(event: MouseEvent) {
  return Math.max(80, event.clientY);
}

export function AccessibilityTools({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [guideY, setGuideY] = useState(180);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSettings(normalizeSettings(JSON.parse(raw)));
      }
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    // Persist settings only for the active browser session.
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage failures in private or restricted browsing contexts.
    }
  }, [settings]);

  useEffect(() => {
    // Apply global accessibility classes/vars directly on <html>.
    const html = document.documentElement;
    html.style.setProperty('--itb-text-scale', settings.textScale.toString());

    (Object.keys(classByToggle) as ToggleKey[]).forEach((toggle) => {
      html.classList.toggle(classByToggle[toggle], settings[toggle]);
    });

    return () => {
      html.style.removeProperty('--itb-text-scale');
      (Object.keys(classByToggle) as ToggleKey[]).forEach((toggle) => {
        html.classList.remove(classByToggle[toggle]);
      });
    };
  }, [settings]);

  useEffect(() => {
    // Header trigger dispatches this event to open the panel.
    const onOpen = () => setOpen(true);

    window.addEventListener('itb:a11y-open', onOpen);
    return () => {
      window.removeEventListener('itb:a11y-open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!settings.readingGuide) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      setGuideY(getGuidePosition(event));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
    };
  }, [settings.readingGuide]);

  const visualToggles = useMemo(
    () =>
      (Object.keys(t.toggles) as ToggleKey[])
        .filter((key) => t.toggles[key].group === 'visual')
        .map((key) => ({ key, ...t.toggles[key] })),
    [t.toggles],
  );

  const navigationToggles = useMemo(
    () =>
      (Object.keys(t.toggles) as ToggleKey[])
        .filter((key) => t.toggles[key].group === 'navigation')
        .map((key) => ({ key, ...t.toggles[key] })),
    [t.toggles],
  );

  const textPercent = Math.round(settings.textScale * 100);

  function updateTextScale(nextScale: number) {
    const clamped = Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, Number(nextScale.toFixed(1))));
    setSettings((prev) => ({ ...prev, textScale: clamped }));
  }

  function toggleSetting(key: ToggleKey) {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <>
      {settings.readingGuide ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 right-0 z-[80]"
          style={{ top: `${guideY}px` }}
        >
          <div className="mx-auto h-[3px] max-w-7xl rounded-full bg-civic-600/80 shadow-[0_0_0_9999px_rgba(9,28,24,0.1)]" />
        </div>
      ) : null}

      <div
        className={`fixed inset-0 z-[90] bg-ink-900/45 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <aside
        id="accessibility-panel"
        role="dialog"
        aria-label={t.panelTitle}
        className={`fixed right-0 top-0 z-[95] flex h-dvh w-full max-w-md flex-col border-l border-sand-200 bg-white shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="border-b border-sand-200 px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="accessibility-panel-title" className="font-display text-2xl text-ink-900">
              {t.panelTitle}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-sand-300 px-3 py-1.5 text-sm font-semibold text-ink-800"
            >
              {t.close}
            </button>
          </div>
          <p className="mt-2 text-sm text-ink-700">{t.panelIntro}</p>
          <button
            type="button"
            onClick={() => setSettings(defaultSettings)}
            className="mt-3 rounded-lg border border-civic-300 bg-civic-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-civic-900"
          >
            {t.reset}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
            <h3 className="font-display text-xl text-ink-900">{t.textSizeTitle}</h3>
            <p className="mt-1 text-sm text-ink-700">{t.textSizeDescription}</p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateTextScale(settings.textScale - TEXT_SCALE_STEP)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sand-300 bg-white text-lg font-bold text-ink-900"
                aria-label={t.decreaseText}
                disabled={settings.textScale <= TEXT_SCALE_MIN}
              >
                -
              </button>
              <div className="min-w-24 rounded-lg border border-sand-300 bg-white px-3 py-2 text-center text-sm font-semibold text-ink-900" aria-live="polite">
                <span className="sr-only">{t.currentTextSize}: </span>
                {textPercent}%
              </div>
              <button
                type="button"
                onClick={() => updateTextScale(settings.textScale + TEXT_SCALE_STEP)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sand-300 bg-white text-lg font-bold text-ink-900"
                aria-label={t.increaseText}
                disabled={settings.textScale >= TEXT_SCALE_MAX}
              >
                +
              </button>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="font-display text-xl text-ink-900">{t.visualTitle}</h3>
            <div className="mt-3 space-y-3">
              {visualToggles.map((toggle) => {
                const inputId = `a11y-toggle-${toggle.key}`;
                return (
                  <label
                    key={toggle.key}
                    htmlFor={inputId}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand-200 bg-white p-3"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={settings[toggle.key]}
                      onChange={() => toggleSetting(toggle.key)}
                      className="mt-1 h-4 w-4 rounded border-sand-400 text-civic-700 focus:ring-civic-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{toggle.label}</span>
                      <span className="block text-xs text-ink-700">{toggle.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="mt-5 pb-2">
            <h3 className="font-display text-xl text-ink-900">{t.navigationTitle}</h3>
            <div className="mt-3 space-y-3">
              {navigationToggles.map((toggle) => {
                const inputId = `a11y-toggle-${toggle.key}`;
                return (
                  <label
                    key={toggle.key}
                    htmlFor={inputId}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand-200 bg-white p-3"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={settings[toggle.key]}
                      onChange={() => toggleSetting(toggle.key)}
                      className="mt-1 h-4 w-4 rounded border-sand-400 text-civic-700 focus:ring-civic-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{toggle.label}</span>
                      <span className="block text-xs text-ink-700">{toggle.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
