/** A data-store failure: the request aborts with the store's own message (SWHM2-R-0053). */
export class CatalogSystemError extends Error {
  constructor(cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Catalog data store failure: ${message}`, { cause });
    this.name = "CatalogSystemError";
  }
}

/** Run a store call; any rejection becomes a CatalogSystemError carrying its message. */
export async function guarded<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (e) {
    throw e instanceof CatalogSystemError ? e : new CatalogSystemError(e);
  }
}
