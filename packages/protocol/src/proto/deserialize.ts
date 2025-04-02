import { DataPacket } from "./data";
import { getPacketId } from "./packet-id";
import { PacketPool } from "./pool";

function deserialize(buffer: Buffer): DataPacket | null {
  // Read the packet ID from the buffer
  const id = getPacketId(buffer);

  // Get the packet class from the packet pool
  const packet = PacketPool.get(id);
  if (!packet) return null; // If no matching packet is found, return null

  // Create a new instance of the packet
  const instance = new packet(buffer);

  // Deserialize the buffer into the packet instance
  return instance.deserialize();
}

export { deserialize };
