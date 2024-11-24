import { ActorEventPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class ActorEventHandler extends NetworkHandler {
  public static readonly packet = Packet.ActorEvent;

  public handle(packet: ActorEventPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Broadcast the packet to all players
    player.dimension.broadcast(packet);
  }
}

export { ActorEventHandler };
