export type MailTransport = {
  send: (m: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    sentDate: Date;
    headers: Record<string, string>;
    locale?: string;
  }) => Promise<void>;
};
export type NotifEnv = {
  broker: import("./broker").Broker;
  transport: MailTransport;
  log: (line: string) => void;
  now: () => Date;
  defaultSender: string;
  cart: string[];
  orders: Map<string, { email: string; locale: string }>;
  switches: { statusChange: boolean; invoice: boolean; completed: boolean };
};
