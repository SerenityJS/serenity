import { Awaitable } from "@serenityjs/emitter";

import type { Serenity } from "../serenity";
import type { Connection } from "@serenityjs/raknet";
import type { DataPacket, Packet } from "@serenityjs/protocol";
import type { Network } from ".";

class NetworkHandler {
  /**
   * The packet that the network handler is listening for.
   */
  public static readonly packet: Packet;

  /**
   * The serenity instance that the network handler is attached to.
   */
  public readonly serenity: Serenity;

  /**
   * The network instance that the network handler is attached to.
   */
  public readonly network: Network;

  /**
   * Creates a new network handler with the specified serenity instance.
   * @param serenity The serenity instance that the network handler is attached to.
   */
  public constructor(serenity: Serenity) {
    this.serenity = serenity;
    this.network = serenity.network;
  }

  /**
   * Handles a packet an incoming packet from a connection.
   * @param packet The packet to handle.
   * @param connection The raknet connection that the packet is being sent from.
   */
  public handle(_packet: DataPacket, _connection: Connection): Awaitable<void> {
    throw new Error("NetworkHandler.handle() is not implemented!");
  }
}

export { NetworkHandler };
