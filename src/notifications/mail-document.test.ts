/** @jest-environment node */
import { buildMailDocument, parseMailDocument } from "./mail-document";

test("[SWHM2-C-0161] mail document carries Address, Subject and Content as text", () => {
  const xml = buildMailDocument({ address: "a@x.com", subject: "Subj", content: "Body" });
  expect(xml).toMatch(/<Address>a@x\.com<\/Address>/);
  expect(xml).toMatch(/<Subject>Subj<\/Subject>/);
  expect(xml).toMatch(/<Content>Body<\/Content>/);
  expect(parseMailDocument(xml)).toEqual({ address: "a@x.com", subject: "Subj", content: "Body" });
});

test("[SWHM2-C-0157] mail request with wrong structure is rejected", () => {
  expect(
    parseMailDocument("<Mail><Address>a</Address><Subject>s</Subject><Content>c</Content></Mail>"),
  ).toEqual({ address: "a", subject: "s", content: "c" });
  expect(() =>
    parseMailDocument("<Mail><Subject>s</Subject><Address>a</Address><Content>c</Content></Mail>"),
  ).toThrow();
  expect(() =>
    parseMailDocument("<Mail><Address>a</Address><Subject>s</Subject></Mail>"),
  ).toThrow();
  expect(() => parseMailDocument("<Other><Address>a</Address></Other>")).toThrow();
  expect(() => parseMailDocument("not xml")).toThrow();
});

test("text is escaped and round-trips; locale rides as an attribute", () => {
  const d = { address: "a@x.com", subject: "A & B", content: "<p>hi</p>", locale: "fr_FR" };
  const xml = buildMailDocument(d);
  expect(xml).not.toContain("<p>");
  expect(parseMailDocument(xml)).toEqual(d);
});
