/** A request for one page of a listing. `offset` counts rows; `size` is the page size. */
export type PageRequest = { locale: string; offset: number; size: number };

/** One page of a listing; `hasNext` says whether a following page exists. */
export type Page<T> = { entries: T[]; hasNext: boolean };

export type CategoryEntry = { id: string; name: string };
export type ProductEntry = { id: string; categoryId: string; name: string };
export type ProductDetail = ProductEntry & { image: string | null; description: string | null };

export type CatalogItem = {
  categoryId: string;
  productId: string;
  productName: string;
  itemId: string;
  image: string;
  description: string;
  attr1: string | null;
  attr2: string | null;
  attr3: string | null;
  attr4: string | null;
  attr5: string | null;
  listPrice: number;
  unitCost: number;
};
