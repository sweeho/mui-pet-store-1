/** @jest-environment node */
/**
 * Acceptance tests for the internationalisation capability. The names below are the contract the
 * build must meet (all modules under src/i18n/):
 *  - format.ts: formatCurrency(amount, locale, decimals): string.
 *  - locale.ts: parseLocale(text): { language, country } | null, "default" gives
 *    { ...serverDefaultLocale }; serverDefaultLocale: { language, country }.
 *  - profile.ts: saveCustomerProfile(db, { userName, preferredLanguage }) and
 *    getCustomerProfile(db, userName) => { userName, preferredLanguage } (table customer_profile).
 *  - storefront.ts: createStorefront({ defaultLocale, screens, onEvent }) where screens is
 *    { [locale]: { [screen]: { definition: string, pageSet: string } } } and onEvent receives
 *    { type: "change-locale", locale }. Methods: handleRequest(session, { params? }) (sets the
 *    session locale to defaultLocale when none), changeLocale(session, { locale? }) (rejects with an
 *    Error matching /unable to change (the )?language/i), renderScreen(session, screen, { params? })
 *    => { locale, definition, pageSet }. createSession() => { locale?: string }.
 *  - catalog.ts: getCatalogItem(db, itemId, locale) => { name, description, image }
 *    (table item_detail(item_id, locale, name, description, image)).
 *  - encoding.ts: convertEncodedParameter(value, charset: "Shift_JIS" | "ISO-2022-JP"): string.
 *  - admin-bundles.ts: createAdminClient(locale, bundles?) => { text(key): string }, bundles being
 *    { default: Record<string,string>, de: Record<string,string> } (the shipped ones by default).
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { formatCurrency } from "@/i18n/format";
import { parseLocale, serverDefaultLocale } from "@/i18n/locale";
import { getCustomerProfile, saveCustomerProfile } from "@/i18n/profile";
import { createSession, createStorefront } from "@/i18n/storefront";
import { getCatalogItem } from "@/i18n/catalog";
import { convertEncodedParameter } from "@/i18n/encoding";
import { createAdminClient } from "@/i18n/admin-bundles";

type Db = Awaited<ReturnType<typeof getDb>>;
let db: Db;

beforeAll(async () => {
  db = await getDb();
});

const screens = {
  en_US: { home: { definition: "en-home", pageSet: "en-pages" } },
  ja_JP: { home: { definition: "ja-home", pageSet: "ja-pages" } },
  zh_CN: {},
};

function storefront() {
  const events: { type: string; locale?: string }[] = [];
  const sf = createStorefront({
    defaultLocale: "en_US",
    screens,
    onEvent: (e: { type: string; locale?: string }) => events.push(e),
  });
  return { sf, events };
}

describe("internationalisation", () => {
  // case: SWHM2-C-0162@v1
  test("SWHM2-C-0162 currency is formatted per locale with 2 decimals", () => {
    expect(formatCurrency(1234.5, "en_US", 2)).toBe("$1,234.50");
    const ja = formatCurrency(1234.5, "ja_JP", 2);
    expect(ja).toMatch(/1,234\.50$/);
    expect(ja).toMatch(/[¥￥]/);
    const de = formatCurrency(1234.5, "de_DE", 2);
    expect(de).toMatch(/1\.234,50/);
    expect(de).toContain("€");
  });

  // case: SWHM2-C-0163@v1
  test("SWHM2-C-0163 ja_JP text yields the Japanese (Japan) locale", () => {
    expect(parseLocale("ja_JP")).toMatchObject({ language: "ja", country: "JP" });
  });

  // case: SWHM2-C-0164@v1
  test("SWHM2-C-0164 default text yields the server default locale", () => {
    expect(parseLocale("default")).toMatchObject({
      language: serverDefaultLocale.language,
      country: serverDefaultLocale.country,
    });
  });

  // case: SWHM2-C-0165@v1
  test("SWHM2-C-0165 preferred language persists on the customer profile", async () => {
    await saveCustomerProfile(db, { userName: "i18n-user", preferredLanguage: "ja_JP" });
    const profile = await getCustomerProfile(db, "i18n-user");
    expect(profile.preferredLanguage).toBe("ja_JP");
  });

  // case: SWHM2-C-0166@v1
  test("SWHM2-C-0166 a Japanese shopper gets the Japanese screen and page set", async () => {
    const { sf } = storefront();
    const session = createSession();
    session.locale = "ja_JP";
    const screen = await sf.renderScreen(session, "home", {});
    expect(screen.definition).toBe("ja-home");
    expect(screen.pageSet).toBe("ja-pages");
  });

  // case: SWHM2-C-0167@v1
  test("SWHM2-C-0167 change-locale without a value errors and keeps the locale", async () => {
    const { sf } = storefront();
    const session = createSession();
    session.locale = "en_US";
    await expect(sf.changeLocale(session, {})).rejects.toThrow(/unable to change (the )?language/i);
    expect(session.locale).toBe("en_US");
  });

  // case: SWHM2-C-0168@v1
  test("SWHM2-C-0168 submitting ja_JP changes the session locale and raises an event", async () => {
    const { sf, events } = storefront();
    const session = createSession();
    session.locale = "en_US";
    await sf.changeLocale(session, { locale: "ja_JP" });
    expect(session.locale).toBe("ja_JP");
    expect(events).toContainEqual(
      expect.objectContaining({ type: "change-locale", locale: "ja_JP" }),
    );
  });

  // case: SWHM2-C-0169@v1
  test("SWHM2-C-0169 a catalog item shows its zh_CN detail row", async () => {
    await db.run(sql`DELETE FROM item_detail WHERE item_id = 'I18N-1'`);
    await db.run(
      sql`INSERT INTO item_detail (item_id, locale, name, description, image)
          VALUES ('I18N-1', 'en_US', 'Cat', 'English text', 'en.png'),
                 ('I18N-1', 'zh_CN', '猫', '中文描述', 'zh.png')`,
    );
    const item = await getCatalogItem(db, "I18N-1", "zh_CN");
    expect(item).toMatchObject({ name: "猫", description: "中文描述", image: "zh.png" });
  });

  // case: SWHM2-C-0170@v1
  test("SWHM2-C-0170 the first request sets the session locale to en_US", async () => {
    const { sf } = storefront();
    const session = createSession();
    expect(session.locale).toBeUndefined();
    await sf.handleRequest(session, {});
    expect(session.locale).toBe("en_US");
  });

  // case: SWHM2-C-0171@v1
  test("SWHM2-C-0171 the locale parameter overrides the session locale", async () => {
    const { sf } = storefront();
    const session = createSession();
    session.locale = "en_US";
    const screen = await sf.renderScreen(session, "home", { params: { locale: "ja_JP" } });
    expect(screen.definition).toBe("ja-home");
  });

  // case: SWHM2-C-0172@v1
  test("SWHM2-C-0172 a screen missing in the locale falls back to the default locale", async () => {
    const { sf } = storefront();
    const session = createSession();
    session.locale = "zh_CN";
    const screen = await sf.renderScreen(session, "home", {});
    expect(screen.definition).toBe("en-home");
  });

  // case: SWHM2-C-0173@v1
  test("SWHM2-C-0173 a Shift-JIS encoded value is converted and trimmed", () => {
    const encoded = "%20%20%93%FA%96%7B%8C%EA%20";
    expect(convertEncodedParameter(encoded, "Shift_JIS")).toBe("日本語");
  });

  // case: SWHM2-C-0174@v1
  test("SWHM2-C-0174 the admin client uses the German bundle, else the default", () => {
    const bundles = {
      default: { "panel.title": "Orders", "panel.help": "Help" },
      de: { "panel.title": "Bestellungen" },
    };
    const client = createAdminClient("de_DE", bundles);
    expect(client.text("panel.title")).toBe("Bestellungen");
    expect(client.text("panel.help")).toBe("Help");
  });
});
