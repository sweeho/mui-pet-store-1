// Scripts written without spaces between words need real word segmentation.
const UNSPACED = /^(ja|zh|th|km|lo|my)(?:[_-]|$)/i;

/**
 * Split search text into keywords (SWHM2-R-0058, R-0123): on whitespace, with blank tokens dropped
 * and repeats removed (case-insensitively). For locales whose script has no spaces, each token is
 * further segmented into words. Latin tokens are never split on punctuation, so an id such as
 * "cat-f" stays one keyword.
 */
export function splitKeywords(text: string, locale: string): string[] {
  const tokens = text.split(/\s+/u).filter((t) => t.trim() !== "");
  const words = UNSPACED.test(locale) ? tokens.flatMap((t) => segment(t, locale)) : tokens;
  const seen = new Set<string>();
  return words.filter((w) => {
    const key = w.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function segment(token: string, locale: string): string[] {
  const segmenter = new Intl.Segmenter(locale.replace("_", "-"), { granularity: "word" });
  const parts = [...segmenter.segment(token)].filter((s) => s.isWordLike).map((s) => s.segment);
  return parts.length > 0 ? parts : [token];
}
