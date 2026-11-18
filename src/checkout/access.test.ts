/** @jest-environment node */
import { invokeCreditCardOperation } from "./access";

describe("credit card operation access", () => {
  it("[SWHM2-C-0060] an unauthenticated caller may invoke any operation", async () => {
    for (const op of ["find", "create", "remove"]) {
      expect(await invokeCreditCardOperation(op, {})).toEqual({ permitted: true });
    }
    expect(
      await invokeCreditCardOperation("remove", { credentials: { username: "x", password: "y" } }),
    ).toEqual({ permitted: true });
  });
});
