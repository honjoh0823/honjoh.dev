/**
 * i18n (Internationalization) module for honjoh.dev
 * Language preference is stored in localStorage.
 * Default: "ja"
 */

export type Lang = "ja" | "en";

const STORAGE_KEY = "honjoh-lang";

export function getLang(): Lang {
    if (typeof localStorage === "undefined") return "ja";
    return (localStorage.getItem(STORAGE_KEY) as Lang) || "ja";
}

export function setLang(lang: Lang): void {
    localStorage.setItem(STORAGE_KEY, lang);
}

/** Translation dictionary type */
type Translations = Record<string, { ja: string; en: string }>;

/** Get a translated string */
export function t(translations: Translations, key: string): string {
    const lang = getLang();
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry["en"] || key;
}

/** Common UI translations used across pages */
export const common: Translations = {
    "hint.back": { ja: "戻る", en: "back" },
    "hint.send": { ja: "送信", en: "send" },
    "hint.move": { ja: "移動", en: "move" },
    "hint.select": { ja: "決定", en: "select" },
    "hint.jump": { ja: "ジャンプ", en: "jump" },
    "nav.works": { ja: "works", en: "works" },
    "nav.works.desc": { ja: "制作物", en: "creations" },
    "nav.about": { ja: "about", en: "about" },
    "nav.about.desc": { ja: "自己紹介", en: "about me" },
    "nav.chat": { ja: "chat", en: "chat" },
    "nav.chat.desc": { ja: "チャット", en: "chat" },
    "nav.setting": { ja: "setting", en: "setting" },
    "nav.setting.desc": { ja: "設定", en: "settings" },
};

/** Chat page translations */
export const chat: Translations = {
    "chat.placeholder": { ja: "メッセージを入力...", en: "Type a message..." },
    "chat.send": { ja: "送信", en: "Send" },
    "chat.error": { ja: "AIからの応答取得に失敗しました。しばらくしてから再試行してください。", en: "Failed to get response from AI. Please try again shortly." },
};

/** Settings page translations */
export const settings: Translations = {
    "settings.title": { ja: "設定", en: "Settings" },
    "settings.language": { ja: "言語 / Language", en: "Language / 言語" },
    "settings.language.ja": { ja: "日本語", en: "日本語 (Japanese)" },
    "settings.language.en": { ja: "English", en: "English" },
    "settings.saved": { ja: "保存しました", en: "Saved" },
};
