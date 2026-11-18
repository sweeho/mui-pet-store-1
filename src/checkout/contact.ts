export type Address = {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Contact = {
  givenName: string;
  familyName: string;
  telephone: string;
  email: string;
  address: Address;
};

export const emptyAddress = (): Address => ({
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
});

/** A contact from the data given; with none, every field is empty and the address is empty too. */
export function createContact(data: Partial<Contact> = {}): Contact {
  return {
    givenName: data.givenName ?? "",
    familyName: data.familyName ?? "",
    telephone: data.telephone ?? "",
    email: data.email ?? "",
    address: { ...emptyAddress(), ...data.address },
  };
}
