import type { Connection } from "../../server";

interface RaknetEvents {
  error: [Error];
  connect: [Connection];
  disconnect: [Connection];
  encapsulated: [Connection, Buffer];
}

export { RaknetEvents };
