import { BinaryStream } from "@serenityjs/binarystream";

import type { Packet } from "../enums";

/**
 * Get the packet ID from a buffer. ( VarInt )
 *
 * @param buffer
 * @returns {number}
 */
function getPacketId(buffer: Buffer): Packet {
  // Create a new BinaryStream from the buffer.
  const stream = new BinaryStream(buffer);

  // Return the VarInt.
  return stream.readVarInt();
}

export { getPacketId };
