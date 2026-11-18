/** @jest-environment node */
import { createLocator, LocatorError } from "./locator";

test("[SWHM2-C-0150] repeated queue lookup uses the cache", async () => {
  const queue = { name: "q" };
  const lookup = jest.fn(async () => queue);
  const locator = createLocator(lookup);
  const first = await locator.get("jms/Queue");
  expect(await locator.get("jms/Queue")).toBe(first);
  expect(lookup).toHaveBeenCalledTimes(1);
});

test("[SWHM2-C-0159] unresolvable name raises a locator error wrapping the cause", async () => {
  const cause = new Error("name not found");
  const lookup = jest.fn(async () => {
    throw cause;
  });
  const locator = createLocator(lookup);
  const err = await locator.get("jms/Missing").catch((e: unknown) => e);
  expect(err).toBeInstanceOf(LocatorError);
  expect((err as LocatorError).cause).toBe(cause);
  await locator.get("jms/Missing").catch(() => undefined);
  expect(lookup).toHaveBeenCalledTimes(2); // failures are not cached
});
