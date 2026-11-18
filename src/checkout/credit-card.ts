export type CreditCard = { cardNumber: string; cardType: string; expiryDate: string };

const DEFAULT_MONTH = "01";
const DEFAULT_YEAR = "2010";

/** A card holding number, type and expiry as text; a given card object is copied. */
export function createCreditCard(card: Partial<CreditCard>): CreditCard {
  return {
    cardNumber: card.cardNumber as string,
    cardType: card.cardType as string,
    expiryDate: card.expiryDate as string,
  };
}

/** The expiry split on its first slash; no expiry or no slash gives the defaults (R-0153). */
function splitExpiry(card: Partial<CreditCard>): [string, string] {
  const at = card.expiryDate?.indexOf("/") ?? -1;
  if (!card.expiryDate || at < 0) return [DEFAULT_MONTH, DEFAULT_YEAR];
  return [card.expiryDate.slice(0, at), card.expiryDate.slice(at + 1)];
}

export const getExpiryMonth = (card: Partial<CreditCard>): string => splitExpiry(card)[0];
export const getExpiryYear = (card: Partial<CreditCard>): string => splitExpiry(card)[1];
