export type Credentials = { username: string; password: string };

/** Every caller may invoke every credit card operation, signed on or not (R-0156). */
// The operation and credentials are accepted and ignored: nothing is checked (R-0156).
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function invokeCreditCardOperation(
  _op: string,
  _options: { credentials?: Credentials },
): Promise<{ permitted: boolean }> {
  return { permitted: true };
}
/* eslint-enable @typescript-eslint/no-unused-vars */
