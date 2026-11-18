import type { Preferences } from "./store";

export type ProfileSubmission = {
  language?: string;
  favoriteCategory?: string | null;
  myList?: boolean | string;
  banner?: boolean | string;
};

/** A profile with the defaults (en_US, no favourite, my-list on, banner on) under any supplied. */
export function createProfile(_prefs?: Partial<Preferences>): Preferences {
  throw new Error("VortexNotImplemented");
}

/** A profile from submitted form options: a flag is on when present, off when absent. */
export function recordProfile(_submission: ProfileSubmission): Preferences {
  throw new Error("VortexNotImplemented");
}
