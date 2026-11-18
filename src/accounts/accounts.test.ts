/** @jest-environment node */
import { getDb } from "@/db/client";
import { storeAddress, storeCreditCard } from "@/checkout/store";
import { createAccount, createCustomer } from "@/accounts/customers";
import { createProfile, recordProfile } from "@/accounts/profile";
import { registerUser } from "@/accounts/registration";
import { createCart, createSession, signOn, touchSession } from "@/accounts/session";
import { authenticate } from "@/accounts/signon";
import {
  type Db,
  getAccount,
  getProfile,
  storeAccount,
  storeContact,
  storeCustomer,
  storeProfile,
  storeSignOn,
} from "@/accounts/store";
import { sql } from "drizzle-orm";

const REMEMBER_COOKIE = "remember_user";
const ERROR_PAGE = "/accounts/create-error";

const TABLES = ["customer", "account", "profile", "contact", "sign_on", "credit_card", "address"];

/** Empty the account tables (a table that does not exist yet is skipped). */
async function resetData(db: Db): Promise<void> {
  for (const t of TABLES) {
    try {
      await db.run(sql.raw(`DELETE FROM ${t}`));
    } catch {
      // not migrated yet
    }
  }
}

async function count(db: Db, table: string): Promise<number> {
  const rows = (await db.all(sql.raw(`SELECT COUNT(*) AS n FROM ${table}`))) as { n: number }[];
  return Number(rows[0].n);
}

const ADDRESS = {
  street1: "1 Main St",
  city: "Springfield",
  state: "CA",
  zip: "90000",
  country: "US",
};
const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };
const PERSON = {
  familyName: "Lee",
  givenName: "Ann",
  telephone: "555-0100",
  email: "ann@example.com",
};

let db: Db;

beforeAll(async () => {
  db = await getDb();
});

beforeEach(async () => {
  await resetData(db);
});

const PROFILE = { language: "en_US", myList: true, banner: true };

async function seedContact() {
  const addressId = await storeAddress(db, { ...ADDRESS });
  return storeContact(db, { ...PERSON, addressId });
}

async function seedAccount(status = "active") {
  const contactId = await seedContact();
  const cardId = await storeCreditCard(db, { ...CARD });
  return storeAccount(db, { status, contactId, cardId });
}

async function seedCustomerParts(userId: string) {
  await storeSignOn(db, { username: userId, password: "pw" });
  const accountId = await seedAccount();
  const profileId = await storeProfile(db, { ...PROFILE });
  return { userId, accountId, profileId };
}

async function rejected(p: Promise<unknown>) {
  await expect(p).rejects.toBeDefined();
}

describe("accounts domain", () => {
  it("[SWHM2-C-0098] a complete contact with an existing address is stored", async () => {
    const addressId = await storeAddress(db, { ...ADDRESS });
    const id = await storeContact(db, { ...PERSON, addressId });
    expect(id).toBeDefined();
    const rows = (await db.all(
      sql`SELECT family_name, given_name, telephone, email, address_id FROM contact`,
    )) as Record<string, unknown>[];
    expect(rows).toHaveLength(1);
    expect(rows[0].family_name).toBe("Lee");
    expect(rows[0].telephone).toBe("555-0100");
    expect(Number(rows[0].address_id)).toBe(Number(addressId));
  });

  it("[SWHM2-C-0099] a contact without telephone is rejected", async () => {
    const addressId = await storeAddress(db, { ...ADDRESS });
    const { telephone: _t, ...noPhone } = PERSON;
    void _t;
    await rejected(storeContact(db, { ...noPhone, addressId } as never));
    expect(await count(db, "contact")).toBe(0);
  });

  it("[SWHM2-C-0100] an account with an existing contact and card is stored", async () => {
    const id = await seedAccount();
    expect(id).toBeDefined();
    expect(await count(db, "account")).toBe(1);
  });

  it("[SWHM2-C-0101] an account referencing a missing card is rejected", async () => {
    const contactId = await seedContact();
    await rejected(storeAccount(db, { status: "active", contactId, cardId: 9999 }));
    expect(await count(db, "account")).toBe(0);
  });

  it("[SWHM2-C-0102] a customer referencing sign-on, account and profile is stored", async () => {
    const parts = await seedCustomerParts("jsmith");
    await storeCustomer(db, parts);
    expect(await count(db, "customer")).toBe(1);
  });

  it("[SWHM2-C-0103] a second customer for the same sign-on user is rejected", async () => {
    const parts = await seedCustomerParts("jsmith");
    await storeCustomer(db, parts);
    const accountId = await seedAccount();
    const profileId = await storeProfile(db, { ...PROFILE });
    await rejected(storeCustomer(db, { userId: "jsmith", accountId, profileId }));
    expect(await count(db, "customer")).toBe(1);
  });

  it("[SWHM2-C-0104] a duplicate sign-on username is rejected", async () => {
    await storeSignOn(db, { username: "jsmith", password: "a" });
    await rejected(storeSignOn(db, { username: "jsmith", password: "b" }));
    expect(await count(db, "sign_on")).toBe(1);
  });

  it("[SWHM2-C-0105] a sign-on credential with an empty password is rejected", async () => {
    await rejected(storeSignOn(db, { username: "jsmith", password: "" }));
    expect(await count(db, "sign_on")).toBe(0);
  });

  it("[SWHM2-C-0106] a profile without favorite category is accepted", async () => {
    const id = await storeProfile(db, { language: "en_US", myList: true, banner: false });
    expect(id).toBeDefined();
    expect(await count(db, "profile")).toBe(1);
  });

  it("[SWHM2-C-0107] a profile without language is rejected", async () => {
    await rejected(storeProfile(db, { myList: true, banner: true } as never));
    expect(await count(db, "profile")).toBe(0);
  });

  it("[SWHM2-C-0108] the correct password authenticates", async () => {
    await storeSignOn(db, { username: "jsmith", password: "secret1" });
    expect(await authenticate(db, "jsmith", "secret1")).toBe(true);
  });

  it("[SWHM2-C-0109] an unknown user name fails authentication", async () => {
    expect(await authenticate(db, "ghost", "whatever")).toBe(false);
  });

  it("[SWHM2-C-0110] a stored shopper links to sign-on, one account and one profile", async () => {
    const { userId } = await createCustomer(db, { userId: "jsmith", password: "pw" });
    const rows = (await db.all(
      sql`SELECT c.user_id FROM customer c
          JOIN sign_on s ON s.username = c.user_id
          JOIN account a ON a.account_id = c.account_id
          JOIN profile p ON p.profile_id = c.profile_id
          WHERE c.user_id = ${userId}`,
    )) as unknown[];
    expect(rows).toHaveLength(1);
    expect(await count(db, "customer")).toBe(1);
    expect(await count(db, "account")).toBe(1);
    expect(await count(db, "profile")).toBe(1);
  });

  it("[SWHM2-C-0111] an account links to contact and card, the contact to an address", async () => {
    const accountId = await seedAccount();
    const rows = (await db.all(
      sql`SELECT a.account_id FROM account a
          JOIN contact c ON c.contact_id = a.contact_id
          JOIN credit_card k ON k.card_id = a.card_id
          JOIN address d ON d.address_id = c.address_id
          WHERE a.account_id = ${accountId}`,
    )) as unknown[];
    expect(rows).toHaveLength(1);
  });

  it("[SWHM2-C-0112] a profile holds its four attributes", async () => {
    const id = await storeProfile(db, {
      language: "ja_JP",
      favoriteCategory: "DOGS",
      myList: false,
      banner: true,
    });
    const p = await getProfile(db, id);
    expect(p).toEqual({ language: "ja_JP", favoriteCategory: "DOGS", myList: false, banner: true });
  });

  it("[SWHM2-C-0113] a profile without favourite category is accepted", async () => {
    const id = await storeProfile(db, { ...PROFILE });
    const p = await getProfile(db, id);
    expect(p.favoriteCategory ?? null).toBeNull();
  });

  it("[SWHM2-C-0114] a submission without the banner option records banner off", () => {
    const p = recordProfile({ language: "en_US", favoriteCategory: "DOGS", myList: true });
    expect(p.banner).toBe(false);
  });

  it("[SWHM2-C-0115] a submission with all options is recorded as submitted", () => {
    const p = recordProfile({
      language: "ja_JP",
      favoriteCategory: "DOGS",
      myList: true,
      banner: true,
    });
    expect(p).toEqual({ language: "ja_JP", favoriteCategory: "DOGS", myList: true, banner: true });
  });

  it("[SWHM2-C-0116] a ja_JP customer signs on with ja_JP session and cart", async () => {
    await createCustomer(db, {
      userId: "jsmith",
      password: "pw",
      profile: { language: "ja_JP" },
    });
    const session = createSession({ language: "en_US" });
    const cart = createCart({ language: "en_US" });
    const r = await signOn(db, {
      username: "jsmith",
      password: "pw",
      remember: false,
      cookies: {},
      session,
      cart,
    });
    expect(r.ok).toBe(true);
    expect(session.language).toBe("ja_JP");
    expect(cart.language).toBe("ja_JP");
  });

  it("[SWHM2-C-0117] a customer without a profile keeps the current language", async () => {
    await storeSignOn(db, { username: "noprofile", password: "pw" });
    const session = createSession({ language: "fr_FR" });
    const cart = createCart({ language: "fr_FR" });
    const r = await signOn(db, {
      username: "noprofile",
      password: "pw",
      remember: false,
      cookies: {},
      session,
      cart,
    });
    expect(r.ok).toBe(true);
    expect(session.language).toBe("fr_FR");
  });

  async function signOnWith(remember: boolean, cookies: Record<string, string>) {
    await storeSignOn(db, { username: "jsmith", password: "pw" });
    return signOn(db, {
      username: "jsmith",
      password: "pw",
      remember,
      cookies,
      session: createSession({ language: "en_US" }),
      cart: createCart({ language: "en_US" }),
    });
  }

  it("[SWHM2-C-0118] remember ticked sets a 31-day user name cookie", async () => {
    const r = await signOnWith(true, {});
    const cookie = r.setCookies.find((c) => c.startsWith(`${REMEMBER_COOKIE}=jsmith`));
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/max-age=2678400/i);
  });

  it("[SWHM2-C-0119] remember unticked expires an existing cookie", async () => {
    const r = await signOnWith(false, { [REMEMBER_COOKIE]: "jsmith" });
    const cookie = r.setCookies.find((c) => c.startsWith(`${REMEMBER_COOKIE}=`));
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/max-age=0/i);
  });

  it("[SWHM2-C-0120] a new account is active", async () => {
    const id = await createAccount(db, {});
    expect((await getAccount(db, id)).status).toBe("active");
  });

  it("[SWHM2-C-0121] a disabled account reads as disabled", async () => {
    const id = await seedAccount("disabled");
    expect((await getAccount(db, id)).status).toBe("disabled");
  });

  it("[SWHM2-C-0122] a duplicate customer identifier is rejected", async () => {
    const parts = await seedCustomerParts("jsmith");
    await storeCustomer(db, parts);
    const accountId = await seedAccount();
    const profileId = await storeProfile(db, { ...PROFILE });
    await rejected(storeCustomer(db, { userId: "jsmith", accountId, profileId }));
    expect(await count(db, "customer")).toBe(1);
  });

  it("[SWHM2-C-0123] customers with different identifiers are both accepted", async () => {
    await storeCustomer(db, await seedCustomerParts("alice"));
    await storeCustomer(db, await seedCustomerParts("bob"));
    expect(await count(db, "customer")).toBe(2);
  });

  it("[SWHM2-C-0124] a created customer has an active account and a default profile", async () => {
    const { accountId, profileId } = await createCustomer(db, { userId: "jsmith", password: "pw" });
    expect((await getAccount(db, accountId)).status).toBe("active");
    const p = await getProfile(db, profileId);
    expect(p.language).toBe("en_US");
    expect(p.myList).toBe(true);
    expect(p.banner).toBe(true);
  });

  it("[SWHM2-C-0125] no customer exists without an account and a profile", async () => {
    await rejected(
      createCustomer(
        db,
        { userId: "jsmith", password: "pw" },
        {
          beforeCommit: () => {
            throw new Error("forced failure");
          },
        },
      ),
    );
    expect(await count(db, "customer")).toBe(0);
    expect(await count(db, "account")).toBe(0);
    expect(await count(db, "profile")).toBe(0);
    const orphans = (await db.all(
      sql`SELECT c.user_id FROM customer c
          LEFT JOIN account a ON a.account_id = c.account_id
          LEFT JOIN profile p ON p.profile_id = c.profile_id
          WHERE a.account_id IS NULL OR p.profile_id IS NULL`,
    )) as unknown[];
    expect(orphans).toHaveLength(0);
  });

  it("[SWHM2-C-0126] profile defaults are applied", () => {
    const p = createProfile();
    expect(p.language).toBe("en_US");
    expect(p.favoriteCategory ?? null).toBeNull();
    expect(p.myList).toBe(true);
    expect(p.banner).toBe(true);
  });

  it("[SWHM2-C-0127] supplied preferences are kept on profile creation", () => {
    const p = createProfile({
      language: "ja_JP",
      favoriteCategory: "DOGS",
      myList: false,
      banner: false,
    });
    expect(p).toEqual({
      language: "ja_JP",
      favoriteCategory: "DOGS",
      myList: false,
      banner: false,
    });
  });

  it("[SWHM2-C-0128] an address without street line 2 is accepted", async () => {
    const id = await storeAddress(db, { ...ADDRESS });
    expect(id).toBeDefined();
    expect(await count(db, "address")).toBe(1);
  });

  it("[SWHM2-C-0129] an address without city is rejected", async () => {
    const { city: _c, ...noCity } = ADDRESS;
    void _c;
    await rejected(storeAddress(db, noCity as never));
    expect(await count(db, "address")).toBe(0);
  });

  async function signedOnSession(now: number) {
    await storeSignOn(db, { username: "jsmith", password: "pw" });
    const session = createSession({ language: "en_US" });
    await signOn(db, {
      username: "jsmith",
      password: "pw",
      remember: false,
      cookies: {},
      session,
      cart: createCart({ language: "en_US" }),
      now,
    });
    expect(session.signedOn).toBe(true);
    return session;
  }

  it("[SWHM2-C-0130] a session idle for 15 minutes has ended", async () => {
    const t0 = 1_700_000_000_000;
    const session = await signedOnSession(t0);
    expect(touchSession(session, t0 + 15 * 60_000)).toBe(false);
    expect(session.signedOn).toBe(false);
  });

  it("[SWHM2-C-0131] a session idle under 15 minutes remains active", async () => {
    const t0 = 1_700_000_000_000;
    const session = await signedOnSession(t0);
    expect(touchSession(session, t0 + 14 * 60_000)).toBe(true);
    expect(session.signedOn).toBe(true);
  });

  it("[SWHM2-C-0132] the password is stored as supplied", async () => {
    await storeSignOn(db, { username: "jsmith", password: "secret1" });
    const rows = (await db.all(sql`SELECT password FROM sign_on WHERE username = 'jsmith'`)) as {
      password: string;
    }[];
    expect(rows).toHaveLength(1);
    expect(rows[0].password).toBe("secret1");
  });

  it("[SWHM2-C-0133] a duplicate sign-on user name is rejected", async () => {
    await storeSignOn(db, { username: "jsmith", password: "secret1" });
    await rejected(storeSignOn(db, { username: "jsmith", password: "secret2" }));
    expect(await count(db, "sign_on")).toBe(1);
  });

  it("[SWHM2-C-0138] a 26-character user ID is rejected", async () => {
    const r = await registerUser(db, { userId: "a".repeat(26), password: "pw" });
    expect(r.ok).toBe(false);
    expect(await count(db, "customer")).toBe(0);
    expect(await count(db, "sign_on")).toBe(0);
  });

  it("[SWHM2-C-0139] a user ID containing * is rejected", async () => {
    const r = await registerUser(db, { userId: "ab*cd", password: "pw" });
    expect(r.ok).toBe(false);
    expect(await count(db, "customer")).toBe(0);
  });

  it("[SWHM2-C-0141] a creation failure redirects to the creation error page", async () => {
    const r = await registerUser(
      db,
      { userId: "jsmith", password: "pw" },
      {
        beforeCommit: () => {
          throw new Error("forced failure");
        },
      },
    );
    expect(r).toEqual({ ok: false, redirect: ERROR_PAGE });
    expect(await count(db, "customer")).toBe(0);
  });

  it("[SWHM2-C-0142] an account without contact or card gets empty records", async () => {
    const id = await createAccount(db, {});
    const a = await getAccount(db, id);
    expect(a.contact).toBeDefined();
    expect(a.card).toBeDefined();
    expect(a.contact.familyName).toBe("");
    expect(a.card.cardNumber).toBe("");
    expect(await count(db, "contact")).toBe(1);
    expect(await count(db, "credit_card")).toBe(1);
  });

  it("[SWHM2-C-0143] supplied contact and card are kept", async () => {
    const id = await createAccount(db, {
      contact: { ...PERSON, address: { ...ADDRESS } },
      card: { ...CARD },
    });
    const a = await getAccount(db, id);
    expect(a.contact).toMatchObject(PERSON);
    expect(a.contact.address).toMatchObject(ADDRESS);
    expect(a.card).toMatchObject(CARD);
  });
});
