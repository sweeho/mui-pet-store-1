import type { Preferences } from "./store";

export type ProfileSubmission = {
  language?: string;
  favoriteCategory?: string | null;
  myList?: boolean | string;
  banner?: boolean | string;
};

/** A profile with the defaults (en_US, no favourite, my-list on, banner on) under any supplied. */
export function createProfile(prefs: Partial<Preferences> = {}): Preferences {
  return {
    language: prefs.language ?? "en_US",
    favoriteCategory: prefs.favoriteCategory ?? null,
    myList: prefs.myList ?? true,
    banner: prefs.banner ?? true,
  };
}

const isOn = (v: boolean | string | undefined) => v === true || v === "on";

/** A profile from submitted form options: a flag is on when present, off when absent (R-0066). */
export function recordProfile(s: ProfileSubmission): Preferences {
  return {
    language: s.language || "en_US",
    favoriteCategory: s.favoriteCategory || null,
    myList: isOn(s.myList),
    banner: isOn(s.banner),
  };
}
