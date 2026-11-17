import { splitKeywords } from "./keywords";

describe("splitKeywords", () => {
  it("[SWHM2-C-0015] splits on word boundaries and drops blank tokens", () => {
    expect(splitKeywords(" red  dog ", "en")).toEqual(["red", "dog"]);
    expect(splitKeywords("  one \t two\n\n three   ", "en")).toEqual(["one", "two", "three"]);
  });

  it("de-duplicates case-insensitively and keeps hyphenated ids whole", () => {
    expect(splitKeywords("Dog dog cat-f", "en_US")).toEqual(["Dog", "cat-f"]);
  });

  it("segments unspaced scripts by word for Japanese", () => {
    expect(splitKeywords("犬と猫", "ja").length).toBeGreaterThan(1);
  });

  it("returns nothing for blank text", () => {
    expect(splitKeywords("   ", "en")).toEqual([]);
  });
});
