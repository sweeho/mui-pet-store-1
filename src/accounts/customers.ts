import { createProfile } from "./profile";
import {
  type CardDetails,
  type ContactInput,
  type Db,
  type Exec,
  type Preferences,
  storeAccount,
  storeContact,
  storeCustomer,
  storeProfile,
  storeSignOn,
} from "./store";
import { storeAddress, storeCreditCard } from "@/checkout/store";

export type CustomerInput = {
  userId: string;
  password: string;
  contact?: ContactInput;
  card?: CardDetails;
  profile?: Partial<Preferences>;
};

const EMPTY_ADDRESS = { street1: "", street2: "", city: "", state: "", zip: "", country: "" };
const EMPTY_CONTACT: ContactInput = {
  familyName: "",
  givenName: "",
  telephone: "",
  email: "",
  address: EMPTY_ADDRESS,
};
const EMPTY_CARD: CardDetails = { cardNumber: "", cardType: "", expiryDate: "" };

/** An active account with the supplied contact and card, or empty ones (R-0069, R-0166). */
export async function createAccount(
  db: Exec,
  input: { contact?: ContactInput; card?: CardDetails },
): Promise<number> {
  const { address, ...person } = input.contact ?? EMPTY_CONTACT;
  const addressId = await storeAddress(db, address);
  const contactId = await storeContact(db, { ...person, addressId });
  const cardId = await storeCreditCard(db, input.card ?? EMPTY_CARD);
  return storeAccount(db, { status: "active", contactId, cardId });
}

/**
 * Create sign-on, account, profile and customer in one transaction; a failure, including one
 * thrown by beforeCommit, leaves nothing behind (R-0071).
 */
export async function createCustomer(
  db: Db,
  input: CustomerInput,
  hooks: { beforeCommit?: () => void | Promise<void> } = {},
): Promise<{ userId: string; accountId: number; profileId: number }> {
  return db.transaction(async (tx) => {
    await storeSignOn(tx, { username: input.userId, password: input.password });
    const accountId = await createAccount(tx, { contact: input.contact, card: input.card });
    const profileId = await storeProfile(tx, createProfile(input.profile));
    await storeCustomer(tx, { userId: input.userId, accountId, profileId });
    await hooks.beforeCommit?.();
    return { userId: input.userId, accountId, profileId };
  });
}
