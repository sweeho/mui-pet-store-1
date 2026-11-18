import { type SQL, sql } from "drizzle-orm";

import { ITEM_SELECT, type Db, pagedAll } from "./queries";
import { splitKeywords } from "./keywords";
import type { CatalogItem, Page, PageRequest } from "./types";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Items whose product name, category id or description contains ANY keyword, ignoring case, in
 * the requested locale (SWHM2-R-0123). Blank input returns an empty page without querying.
 */
export async function searchItems(
  db: Db,
  query: string,
  page: PageRequest,
): Promise<Page<CatalogItem>> {
  const keywords = splitKeywords(query, page.locale);
  if (keywords.length === 0) return { entries: [], hasNext: false };
  const matches: SQL[] = keywords.map((k) => {
    const like = `%${escapeLike(k.toLowerCase())}%`;
    return sql`(lower(pd.name) LIKE ${like} ESCAPE '\\' OR lower(p.catid) LIKE ${like} ESCAPE '\\'
      OR lower(d.descn) LIKE ${like} ESCAPE '\\')`;
  });
  return pagedAll(
    db,
    page,
    (paging) => sql`${ITEM_SELECT(page.locale)} WHERE ${sql.join(matches, sql` OR `)}
      ORDER BY i.itemid ${paging}`,
  );
}
