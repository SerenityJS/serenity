import type { DataPacket } from "@serenityjs/protocol";
import type { Connection } from "@serenityjs/raknet";
import type { NetworkBound } from "../../enums";

interface SessionPacketEvent<T extends DataPacket> {
  /**
   * The flow direction of the packet.
   */
  bound: NetworkBound;

  /**
   * The data packet instance.
   */
  packet: T;
}

/**
 * Represents a network packet event.
 */
interface NetworkPacketEvent<T extends DataPacket>
  extends SessionPacketEvent<T> {
  /**
   * The raknet connection that the packet is being sent from.
   */
  connection: Connection;
}

export { SessionPacketEvent, NetworkPacketEvent };
