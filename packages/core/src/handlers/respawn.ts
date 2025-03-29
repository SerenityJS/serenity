import { Packet, RespawnPacket, RespawnState } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class RespawnHandler extends NetworkHandler {
  public static readonly packet = Packet.Respawn;

  public async handle(
    packet: RespawnPacket,
    connection: Connection
  ): Promise<void> {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Update the state of the player to indicate they are respawning
    packet.state = RespawnState.ServerReadyToSpawn;

    // Send the packet to the player
    return player.send(packet);
  }
}

export { RespawnHandler };
