import type { Reliability } from "../enums";
import type { Connection } from "../server";

interface NetherNetEvents {
  error: [Error];
  connect: [Connection];
  disconnect: [Connection];
  message: [Connection, Buffer, Reliability];
}

export { NetherNetEvents };
