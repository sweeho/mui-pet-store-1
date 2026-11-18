import { statementsFor } from "./dialect";

describe("statementsFor", () => {
  it("[SWHM2-C-0004] picks the statement set by configured database identifier", () => {
    const a = statementsFor("cloudscape");
    const b = statementsFor("oracle");
    expect(a.id).toBe("cloudscape");
    expect(b.id).toBe("oracle");
    expect(a).not.toBe(b);
    expect(statementsFor("cloudscape")).toBe(a);
  });

  it("rejects an unknown identifier", () => {
    expect(() => statementsFor("nope")).toThrow(/nope/);
  });
});
