/**
 * Shared fixture for the customer-accounts acceptance tests. It is also the contract the build
 * must meet; every assumption about names lives here, not in the tests.
 *
 * Product modules (under src/accounts/). Async functions take the Drizzle db first; a rejected
 * store rejects the promise and leaves no row. Addresses and credit cards reuse
 * storeAddress / storeCreditCard from src/checkout/store.ts (tables address, credit_card).
 *  - store.ts: storeContact(db, { familyName, givenName, telephone, email, addressId }) -> contactId;
 *    storeAccount(db, { status, contactId, cardId }) -> accountId;
 *    storeProfile(db, { language, favoriteCategory?, myList, banner }) -> profileId;
 *    storeSignOn(db, { username, password }) -> void (password kept exactly as supplied);
 *    storeCustomer(db, { userId, accountId, profileId }) -> userId;
 *    getProfile(db, profileId) -> { language, favoriteCategory (null when none), myList, banner };
 *    getAccount(db, accountId) -> { status, contact: { familyName, givenName, telephone, email,
 *      address }, card: { cardNumber, cardType, expiryDate } }.
 *  - signon.ts: authenticate(db, username, password) -> boolean (exact password equality).
 *  - profile.ts (sync): createProfile(prefs?) -> { language, favoriteCategory, myList, banner }
 *    with defaults en_US, null, true, true; recordProfile(submission) -> the same shape, where
 *    myList / banner are true when the submitted field is present (true or "on") and false when
 *    the field is absent.
 *  - customers.ts: createAccount(db, { contact?, card? }) -> accountId, status "active", an empty
 *    contact (all text fields "", with an empty address) and an empty card when none supplied;
 *    createCustomer(db, { userId, password, contact?, card?, profile? }, { beforeCommit? }) ->
 *    { userId, accountId, profileId }: one transaction creating sign-on, account, profile and
 *    customer; a throw from beforeCommit rolls everything back and rejects.
 *  - registration.ts: registerUser(db, { userId, password, ... }, { beforeCommit? }) ->
 *    { ok: true, userId } or { ok: false, redirect: "/accounts/create-error" } (user ID over 25
 *    characters, containing "%" or "*", a duplicate user name, or any failure).
 *  - session.ts (sync, except signOn): createSession({ language }) -> session { signedOn,
 *    username, language, lastAccess }; createCart({ language }) -> { language };
 *    signOn(db, { username, password, remember, cookies, session, cart, now? }) ->
 *    { ok, redirect, setCookies: string[] }; on success the session is signed on, holds the user
 *    name, lastAccess = now, and session.language / cart.language take the customer's preferred
 *    language (a user without a customer profile keeps the session language);
 *    touchSession(session, now) -> boolean: false (and the session is no longer signed on) once
 *    now - lastAccess >= 15 minutes, otherwise true and lastAccess = now.
 * Cookie: REMEMBER_COOKIE holds the user name, Max-Age=2678400; expired with Max-Age=0.
 * Tables (SQLite): sign_on(username, password), contact(contact_id, family_name, given_name,
 * telephone, email, address_id), account(account_id, status, contact_id, card_id),
 * profile(profile_id, language, favorite_category, my_list, banner),
 * customer(user_id, account_id, profile_id), plus address and credit_card.
 * Browser: /account is the protected page and shows the signed-on user name. An anonymous request
 * is redirected to /signon?returnTo=<encoded path>; the sign-on form has fields "User name" and
 * "Password" and a "Sign on" button; failure lands on /signon/error. POST /api/accounts/users
 * { userId, password } creates a user (201) or answers a redirect to /accounts/create-error.
 */
import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";

export type Db = Awaited<ReturnType<typeof getDb>>;

export const REMEMBER_COOKIE = "remember_user";
export const ERROR_PAGE = "/accounts/create-error";

export async function resetData(db: Db): Promise<void> {
  for (const t of [
    "customer",
    "account",
    "profile",
    "contact",
    "sign_on",
    "credit_card",
    "address",
  ]) {
    await db.run(sql.raw(`DELETE FROM ${t}`));
  }
}

export async function count(db: Db, table: string): Promise<number> {
  const rows = (await db.all(sql.raw(`SELECT COUNT(*) AS n FROM ${table}`))) as { n: number }[];
  return Number(rows[0].n);
}

export const ADDRESS = {
  street1: "1 Main St",
  city: "Springfield",
  state: "CA",
  zip: "90000",
  country: "US",
};

export const CARD = { cardNumber: "4111111111111111", cardType: "Visa", expiryDate: "04/2008" };

export const PERSON = {
  familyName: "Lee",
  givenName: "Ann",
  telephone: "555-0100",
  email: "ann@example.com",
};
