import { createContact } from "./contact";

describe("contact", () => {
  it("[SWHM2-C-0045] created with no data has an empty address record", () => {
    const c = createContact();
    expect(c.address).toEqual({
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
    expect(c.email).toBe("");
  });

  it("is created from the data given", () => {
    const c = createContact({ givenName: "Ann", email: "ann@example.com" });
    expect(c.givenName).toBe("Ann");
    expect(c.familyName).toBe("");
    expect(c.address.city).toBe("");
  });
});
