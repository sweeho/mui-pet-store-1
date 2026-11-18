"use client";

export type ApprovalOrder = {
  orderId: string;
  userName: string;
  orderTime: number;
  total: number;
  status: string;
};

export type OrderApprovalViewProps = {
  orders: ApprovalOrder[];
  /** The active status tab; "ALL" lists every order. */
  filter?: string;
  /** The after-Commit summary, when this page was reached by committing. */
  summary?: { sent: number; approved: string[]; denied: string[] } | null;
};

export function OrderApprovalView(_props: OrderApprovalViewProps): never {
  throw new Error("VortexNotImplemented");
}
