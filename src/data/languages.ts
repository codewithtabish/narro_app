// src/lib/constants/languages.ts
// ============================================================
// LANGUAGES — NARRO
// Complete list of world languages with ISO 639-1 / 639-2 codes,
// English names, native names, and flag emojis.
//
// Source: ISO 639 standard + common language registry
// Used in: onboarding, profile preferences, partner matching
// ============================================================

export interface Language {
  /** ISO 639-1 (or 639-2 fallback) code — lowercase */
  code: string;
  /** English name */
  name: string;
  /** Native name (in the language's own script) */
  nativeName: string;
  /** Flag emoji representing the primary region */
  flag: string;
}

// ============================================================
// LANGUAGES
// ============================================================

export const LANGUAGES: Language[] = [
  // ─── A ───────────────────────────────────────────────────
  { code: "aa", name: "Afar", nativeName: "Afaraf", flag: "🇪🇹" },
  { code: "ab", name: "Abkhazian", nativeName: "Аҧсуа", flag: "🇬🇪" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦" },
  { code: "ak", name: "Akan", nativeName: "Akan", flag: "🇬🇭" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
  { code: "an", name: "Aragonese", nativeName: "Aragonés", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
  { code: "av", name: "Avaric", nativeName: "Авар мацӀ", flag: "🇷🇺" },
  { code: "ay", name: "Aymara", nativeName: "Aymar aru", flag: "🇧🇴" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan dili", flag: "🇦🇿" },

  // ─── B ───────────────────────────────────────────────────
  { code: "ba", name: "Bashkir", nativeName: "Башҡорт теле", flag: "🇷🇺" },
  { code: "be", name: "Belarusian", nativeName: "Беларуская", flag: "🇧🇾" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬" },
  { code: "bh", name: "Bihari", nativeName: "भोजपुरी", flag: "🇮🇳" },
  { code: "bi", name: "Bislama", nativeName: "Bislama", flag: "🇻🇺" },
  { code: "bm", name: "Bambara", nativeName: "Bamanankan", flag: "🇲🇱" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "bo", name: "Tibetan", nativeName: "བོད་ཡིག", flag: "🇨🇳" },
  { code: "br", name: "Breton", nativeName: "Brezhoneg", flag: "🇫🇷" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦" },

  // ─── C ───────────────────────────────────────────────────
  { code: "ca", name: "Catalan", nativeName: "Català", flag: "🇪🇸" },
  { code: "ce", name: "Chechen", nativeName: "Нохчийн мотт", flag: "🇷🇺" },
  { code: "ch", name: "Chamorro", nativeName: "Chamoru", flag: "🇬🇺" },
  { code: "co", name: "Corsican", nativeName: "Corsu", flag: "🇫🇷" },
  { code: "cr", name: "Cree", nativeName: "ᓀᐦᐃᔭᐍᐏᐣ", flag: "🇨🇦" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "cu", name: "Church Slavonic", nativeName: "Славе́нскїй", flag: "🇧🇬" },
  { code: "cv", name: "Chuvash", nativeName: "Чӑваш чӗлхи", flag: "🇷🇺" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },

  // ─── D ───────────────────────────────────────────────────
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "dv", name: "Dhivehi", nativeName: "ދިވެހި", flag: "🇲🇻" },
  { code: "dz", name: "Dzongkha", nativeName: "རྫོང་ཁ", flag: "🇧🇹" },

  // ─── E ───────────────────────────────────────────────────
  { code: "ee", name: "Ewe", nativeName: "Eʋegbe", flag: "🇬🇭" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "eo", name: "Esperanto", nativeName: "Esperanto", flag: "🏳️" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "et", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪" },
  { code: "eu", name: "Basque", nativeName: "Euskara", flag: "🇪🇸" },

  // ─── F ───────────────────────────────────────────────────
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
  { code: "ff", name: "Fulah", nativeName: "Fulfulde", flag: "🇸🇳" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
  { code: "fj", name: "Fijian", nativeName: "Vosa Vakaviti", flag: "🇫🇯" },
  { code: "fo", name: "Faroese", nativeName: "Føroyskt", flag: "🇫🇴" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "fy", name: "Western Frisian", nativeName: "Frysk", flag: "🇳🇱" },

  // ─── G ───────────────────────────────────────────────────
  { code: "ga", name: "Irish", nativeName: "Gaeilge", flag: "🇮🇪" },
  { code: "gd", name: "Scottish Gaelic", nativeName: "Gàidhlig", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code: "gl", name: "Galician", nativeName: "Galego", flag: "🇪🇸" },
  { code: "gn", name: "Guarani", nativeName: "Avañe'ẽ", flag: "🇵🇾" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "gv", name: "Manx", nativeName: "Gaelg", flag: "🇮🇲" },

  // ─── H ───────────────────────────────────────────────────
  { code: "ha", name: "Hausa", nativeName: "Hausa", flag: "🇳🇬" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ho", name: "Hiri Motu", nativeName: "Hiri Motu", flag: "🇵🇬" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷" },
  { code: "ht", name: "Haitian Creole", nativeName: "Kreyòl ayisyen", flag: "🇭🇹" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն", flag: "🇦🇲" },
  { code: "hz", name: "Herero", nativeName: "Otjiherero", flag: "🇳🇦" },

  // ─── I ───────────────────────────────────────────────────
  { code: "ia", name: "Interlingua", nativeName: "Interlingua", flag: "🏳️" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ie", name: "Interlingue", nativeName: "Interlingue", flag: "🏳️" },
  { code: "ig", name: "Igbo", nativeName: "Igbo", flag: "🇳🇬" },
  { code: "ii", name: "Sichuan Yi", nativeName: "ꆈꌠꉙ", flag: "🇨🇳" },
  { code: "ik", name: "Inupiaq", nativeName: "Iñupiaq", flag: "🇺🇸" },
  { code: "io", name: "Ido", nativeName: "Ido", flag: "🏳️" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska", flag: "🇮🇸" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "iu", name: "Inuktitut", nativeName: "ᐃᓄᒃᑎᑐᑦ", flag: "🇨🇦" },

  // ─── J ───────────────────────────────────────────────────
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "jv", name: "Javanese", nativeName: "Basa Jawa", flag: "🇮🇩" },

  // ─── K ───────────────────────────────────────────────────
  { code: "ka", name: "Georgian", nativeName: "ქართული", flag: "🇬🇪" },
  { code: "kg", name: "Kongo", nativeName: "Kikongo", flag: "🇨🇩" },
  { code: "ki", name: "Kikuyu", nativeName: "Gĩkũyũ", flag: "🇰🇪" },
  { code: "kj", name: "Kwanyama", nativeName: "Kuanyama", flag: "🇳🇦" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі", flag: "🇰🇿" },
  { code: "kl", name: "Kalaallisut", nativeName: "Kalaallisut", flag: "🇬🇱" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ", flag: "🇰🇭" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "kr", name: "Kanuri", nativeName: "Kanuri", flag: "🇳🇬" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर", flag: "🇮🇳" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî", flag: "🇮🇶" },
  { code: "kv", name: "Komi", nativeName: "Коми кыв", flag: "🇷🇺" },
  { code: "kw", name: "Cornish", nativeName: "Kernewek", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча", flag: "🇰🇬" },

  // ─── L ───────────────────────────────────────────────────
  { code: "la", name: "Latin", nativeName: "Latina", flag: "🏛️" },
  { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch", flag: "🇱🇺" },
  { code: "lg", name: "Ganda", nativeName: "Luganda", flag: "🇺🇬" },
  { code: "li", name: "Limburgish", nativeName: "Limburgs", flag: "🇳🇱" },
  { code: "ln", name: "Lingala", nativeName: "Lingála", flag: "🇨🇩" },
  { code: "lo", name: "Lao", nativeName: "ລາວ", flag: "🇱🇦" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹" },
  { code: "lu", name: "Luba-Katanga", nativeName: "Kiluba", flag: "🇨🇩" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻" },

  // ─── M ───────────────────────────────────────────────────
  { code: "mg", name: "Malagasy", nativeName: "Malagasy", flag: "🇲🇬" },
  { code: "mh", name: "Marshallese", nativeName: "Kajin M̧ajeļ", flag: "🇲🇭" },
  { code: "mi", name: "Māori", nativeName: "Te Reo Māori", flag: "🇳🇿" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски", flag: "🇲🇰" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол", flag: "🇲🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "mt", name: "Maltese", nativeName: "Malti", flag: "🇲🇹" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ", flag: "🇲🇲" },

  // ─── N ───────────────────────────────────────────────────
  { code: "na", name: "Nauru", nativeName: "Dorerin Naoero", flag: "🇳🇷" },
  { code: "nb", name: "Norwegian Bokmål", nativeName: "Norsk bokmål", flag: "🇳🇴" },
  { code: "nd", name: "North Ndebele", nativeName: "isiNdebele", flag: "🇿🇼" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵" },
  { code: "ng", name: "Ndonga", nativeName: "Owambo", flag: "🇳🇦" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "nn", name: "Norwegian Nynorsk", nativeName: "Norsk nynorsk", flag: "🇳🇴" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "nr", name: "South Ndebele", nativeName: "isiNdebele", flag: "🇿🇦" },
  { code: "nv", name: "Navajo", nativeName: "Diné bizaad", flag: "🇺🇸" },
  { code: "ny", name: "Chichewa", nativeName: "ChiCheŵa", flag: "🇲🇼" },

  // ─── O ───────────────────────────────────────────────────
  { code: "oc", name: "Occitan", nativeName: "Occitan", flag: "🇫🇷" },
  { code: "oj", name: "Ojibwe", nativeName: "ᐊᓂᔑᓈᐯᒧᐎᓐ", flag: "🇨🇦" },
  { code: "om", name: "Oromo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "os", name: "Ossetian", nativeName: "Ирон æвзаг", flag: "🇷🇺" },

  // ─── P ───────────────────────────────────────────────────
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "pi", name: "Pali", nativeName: "पालि", flag: "🇮🇳" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "ps", name: "Pashto", nativeName: "پښتو", flag: "🇦🇫" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },

  // ─── Q ───────────────────────────────────────────────────
  { code: "qu", name: "Quechua", nativeName: "Runa Simi", flag: "🇵🇪" },

  // ─── R ───────────────────────────────────────────────────
  { code: "rm", name: "Romansh", nativeName: "Rumantsch", flag: "🇨🇭" },
  { code: "rn", name: "Rundi", nativeName: "Ikirundi", flag: "🇧🇮" },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda", flag: "🇷🇼" },

  // ─── S ───────────────────────────────────────────────────
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", flag: "🇮🇳" },
  { code: "sc", name: "Sardinian", nativeName: "Sardu", flag: "🇮🇹" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", flag: "🇵🇰" },
  { code: "se", name: "Northern Sami", nativeName: "Davvisámegiella", flag: "🇳🇴" },
  { code: "sg", name: "Sango", nativeName: "Sängö", flag: "🇨🇫" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮" },
  { code: "sm", name: "Samoan", nativeName: "Gagana Samoa", flag: "🇼🇸" },
  { code: "sn", name: "Shona", nativeName: "chiShona", flag: "🇿🇼" },
  { code: "so", name: "Somali", nativeName: "Soomaali", flag: "🇸🇴" },
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱" },
  { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸" },
  { code: "ss", name: "Swati", nativeName: "SiSwati", flag: "🇸🇿" },
  { code: "st", name: "Southern Sotho", nativeName: "Sesotho", flag: "🇱🇸" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda", flag: "🇮🇩" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },

  // ─── T ───────────────────────────────────────────────────
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ", flag: "🇹🇯" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ", flag: "🇪🇷" },
  { code: "tk", name: "Turkmen", nativeName: "Türkmençe", flag: "🇹🇲" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog", flag: "🇵🇭" },
  { code: "tn", name: "Tswana", nativeName: "Setswana", flag: "🇧🇼" },
  { code: "to", name: "Tongan", nativeName: "Faka Tonga", flag: "🇹🇴" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "ts", name: "Tsonga", nativeName: "Xitsonga", flag: "🇿🇦" },
  { code: "tt", name: "Tatar", nativeName: "Татар теле", flag: "🇷🇺" },
  { code: "tw", name: "Twi", nativeName: "Twi", flag: "🇬🇭" },
  { code: "ty", name: "Tahitian", nativeName: "Reo Tahiti", flag: "🇵🇫" },

  // ─── U ───────────────────────────────────────────────────
  { code: "ug", name: "Uyghur", nativeName: "ئۇيغۇرچە", flag: "🇨🇳" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbek", flag: "🇺🇿" },

  // ─── V ───────────────────────────────────────────────────
  { code: "ve", name: "Venda", nativeName: "Tshivenḓa", flag: "🇿🇦" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "vo", name: "Volapük", nativeName: "Volapük", flag: "🏳️" },

  // ─── W ───────────────────────────────────────────────────
  { code: "wa", name: "Walloon", nativeName: "Walon", flag: "🇧🇪" },
  { code: "wo", name: "Wolof", nativeName: "Wollof", flag: "🇸🇳" },

  // ─── X ───────────────────────────────────────────────────
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦" },

  // ─── Y ───────────────────────────────────────────────────
  { code: "yi", name: "Yiddish", nativeName: "ייִדיש", flag: "🇮🇱" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "🇳🇬" },

  // ─── Z ───────────────────────────────────────────────────
  { code: "za", name: "Zhuang", nativeName: "Vahcuengh", flag: "🇨🇳" },
  { code: "zh", name: "Chinese (Mandarin)", nativeName: "中文", flag: "🇨🇳" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦" },
];

// ============================================================
// POPULAR LANGUAGES (for quick-select chips)
// These appear first in the UI as quick-pick options.
// ============================================================

export const POPULAR_LANGUAGE_CODES = [
  "en", // English
  "es", // Spanish
  "fr", // French
  "de", // German
  "pt", // Portuguese
  "it", // Italian
  "zh", // Chinese
  "ja", // Japanese
  "ko", // Korean
  "ar", // Arabic
  "hi", // Hindi
  "ur", // Urdu
] as const;

export const POPULAR_LANGUAGES: Language[] = POPULAR_LANGUAGE_CODES.map(
  (code) => LANGUAGES.find((l) => l.code === code)!,
).filter(Boolean);

// ============================================================
// HELPERS
// ============================================================

/**
 * Look up a language by its ISO code.
 */
export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Get the English name for a language code.
 * Returns the code itself if not found — never fails.
 */
export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name ?? code;
}

/**
 * Get the flag emoji for a language code.
 * Returns a neutral globe if not found.
 */
export function getLanguageFlag(code: string): string {
  return getLanguageByCode(code)?.flag ?? "🌐";
}

/**
 * Get the native name for a language code.
 */
export function getLanguageNativeName(code: string): string {
  return getLanguageByCode(code)?.nativeName ?? code;
}

/**
 * Filter languages by a search query (matches code, name, or native name).
 * Case-insensitive.
 */
export function filterLanguages(query: string): Language[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES;

  return LANGUAGES.filter(
    (lang) =>
      lang.code.toLowerCase().includes(q) ||
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q),
  );
}

/**
 * Get a display string like "🇺🇸 English" for a language code.
 */
export function getLanguageDisplay(code: string): string {
  return `${getLanguageFlag(code)} ${getLanguageName(code)}`;
}