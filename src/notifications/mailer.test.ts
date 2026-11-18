/** @jest-environment node */
import { processMailMessage } from "./mailer";
import { makeEnv, mailXml, NOW } from "../../tests/acceptance/order-notifications/harness";

test("[SWHM2-C-0146] mail to two recipients carries the default headers", async () => {
  const t = makeEnv();
  await processMailMessage(t.env, mailXml("a@x.com, b@y.com", "Hello", "<p>Body</p>"));
  expect(t.sent).toHaveLength(1);
  const m = t.sent[0];
  expect(m.to).toEqual(["a@x.com", "b@y.com"]);
  expect(m.from).toBe(t.env.defaultSender);
  expect(m.subject).toBe("Hello");
  expect(m.html).toContain("Body");
  expect(m.sentDate).toEqual(NOW);
  expect(m.headers["X-Mailer"]).toBe("JavaMailer");
});

test("[SWHM2-C-0148] malformed mail request raises an error", async () => {
  const t = makeEnv();
  await expect(processMailMessage(t.env, "this is not a mail document")).rejects.toThrow();
  await expect(processMailMessage(t.env, "<Other><x/></Other>")).rejects.toThrow();
  expect(t.sent).toHaveLength(0);
});

test("[SWHM2-C-0158] unreachable mail server discards the request without retry", async () => {
  const t = makeEnv();
  t.transport.unreachable = true;
  await expect(
    processMailMessage(t.env, mailXml("a@x.com", "Hi", "body")),
  ).resolves.toBeUndefined();
  expect(t.attempts.count).toBe(1);
  expect(t.sent).toHaveLength(0);
  expect(t.logs.join(" ")).toContain("mail server unreachable");
});
