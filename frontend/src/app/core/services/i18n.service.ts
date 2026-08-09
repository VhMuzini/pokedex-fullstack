import { Injectable, computed, signal } from '@angular/core';
import { Lang, translations } from '../i18n/translations';

const STORAGE_KEY = 'pokedex.lang';

function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'pt' || stored === 'en') return stored;
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _lang = signal<Lang>(detectInitialLang());
  readonly lang = this._lang.asReadonly();
  readonly dict = computed(() => translations[this._lang()]);

  setLang(lang: Lang) {
    this._lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  toggle() {
    this.setLang(this._lang() === 'pt' ? 'en' : 'pt');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const template = this.dict()[key] ?? key;
    if (!params) return template;
    return Object.entries(params).reduce(
      (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
      template,
    );
  }
}
