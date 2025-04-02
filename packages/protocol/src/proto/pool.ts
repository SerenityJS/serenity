import { Packet } from "../enums";

import * as Protocol from "./data/index";
import { DataPacket } from "./data";

/**
 * All of the packets in the current protocol.
 */
const PacketPool = new Map<Packet, typeof DataPacket>();

// Iterate over each packet in the Protocol
for (const key in Protocol) {
  // Get the packet class
  const packet = Protocol[key as keyof typeof Protocol];

  // Check if the packet is a subclass of DataPacket
  if ((packet as typeof DataPacket).prototype instanceof DataPacket) {
    // Cast the packet to the correct type
    const packetClass = packet as typeof DataPacket;

    // Push the packet class to the packet pool
    PacketPool.set(packetClass.id, packetClass);
  }
}

export { PacketPool };
