export class LocatorError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "LocatorError";
  }
}

/** A name-keyed cache over `lookup`; a failed lookup is not cached (design.md P7). */
export function createLocator(lookup: (name: string) => Promise<unknown>) {
  const cache = new Map<string, unknown>();
  return {
    async get(name: string): Promise<unknown> {
      if (cache.has(name)) return cache.get(name);
      try {
        const value = await lookup(name);
        cache.set(name, value);
        return value;
      } catch (cause) {
        throw new LocatorError(`cannot resolve ${name}`, { cause });
      }
    },
  };
}
