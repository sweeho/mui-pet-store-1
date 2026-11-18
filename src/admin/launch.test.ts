import { buildLaunchDescriptor } from "./launch";

test("[SWHM2-C-0235] the descriptor names Pet Store Admin and carries server, port and session id", () => {
  const text = buildLaunchDescriptor({ server: "shop.example", port: 8443, sessionId: "sess-123" });
  expect(text).toContain("Pet Store Admin");
  const args = [...text.matchAll(/<argument>([^<]*)<\/argument>/g)].map((m) => m[1]);
  expect(args).toEqual(["shop.example", "8443", "sess-123"]);
});

test("[SWHM2-C-0236] argument values are XML-escaped", () => {
  const text = buildLaunchDescriptor({ server: "a<b", port: 1, sessionId: 'x"&' });
  expect(text).toContain("a&lt;b");
  expect(text).toContain("x&quot;&amp;");
});
