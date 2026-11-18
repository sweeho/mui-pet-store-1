export const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** The Web Start (JNLP) descriptor for the Pet Store Admin client (R-0038, R-0039). */
export function buildLaunchDescriptor(a: {
  server: string;
  port: number | string;
  sessionId: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<jnlp spec="1.0+">
  <information>
    <title>Pet Store Admin</title>
    <vendor>Pet Store</vendor>
  </information>
  <application-desc main-class="PetStoreAdminClient">
    <argument>${escapeXml(a.server)}</argument>
    <argument>${escapeXml(String(a.port))}</argument>
    <argument>${escapeXml(a.sessionId)}</argument>
  </application-desc>
</jnlp>
`;
}
