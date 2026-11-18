import { canApprove } from "./policy";

test("[SWHM2-C-0033] US order of 499 is auto-approved", () => {
  expect(canApprove({ locale: "en_US", total: 499 })).toBe(true);
});

test("[SWHM2-C-0034] US order of 500 is not auto-approved", () => {
  expect(canApprove({ locale: "en_US", total: 500 })).toBe(false);
});

test("Japan is strict below 50000 and other locales never qualify", () => {
  expect(canApprove({ locale: "ja_JP", total: 49999 })).toBe(true);
  expect(canApprove({ locale: "ja_JP", total: 50000 })).toBe(false);
  expect(canApprove({ locale: "fr_FR", total: 1 })).toBe(false);
});
