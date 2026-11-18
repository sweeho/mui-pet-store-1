import type { CartLine } from "@/cart/listing";

export type CartViewProps = {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  signedOn: boolean;
};

export function CartView(_props: CartViewProps): never {
  throw new Error("VortexNotImplemented");
}
