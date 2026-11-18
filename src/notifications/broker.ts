export type Tx = { commit: () => Promise<void>; rollback: () => Promise<void> };
export type Broker = {
  queue: (name: string) => { messages: string[] };
  topic: (name: string) => { published: string[] };
  begin: () => Tx;
  /** Place a message at once, or on commit when `tx` is given. Used by the sender. */
  deliver: (name: string, text: string, tx?: Tx) => void;
};

/** An in-memory broker (design.md P2): named queues and topics, and buffered transactions. */
export function createBroker(): Broker {
  const queues = new Map<string, { messages: string[] }>();
  const topics = new Map<string, { published: string[] }>();
  const pending = new WeakMap<Tx, (() => void)[]>();
  const queue = (name: string) => {
    let q = queues.get(name);
    if (!q) queues.set(name, (q = { messages: [] }));
    return q;
  };
  const topic = (name: string) => {
    let t = topics.get(name);
    if (!t) topics.set(name, (t = { published: [] }));
    return t;
  };
  return {
    queue,
    topic,
    begin() {
      const actions: (() => void)[] = [];
      const tx: Tx = {
        commit: async () => {
          for (const a of actions.splice(0)) a();
        },
        rollback: async () => {
          actions.length = 0;
        },
      };
      pending.set(tx, actions);
      return tx;
    },
    deliver(name, text, tx) {
      const put = () => void queue(name).messages.push(text);
      const actions = tx && pending.get(tx);
      if (actions) actions.push(put);
      else put();
    },
  };
}
