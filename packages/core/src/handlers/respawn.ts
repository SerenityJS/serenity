import {
  DataPacket,
  Packet,
  PlayStatus,
  PlayStatusPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class RespawnHandler extends NetworkHandler {
  public static readonly packet = Packet.Respawn;

  public handle(_packet: DataPacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Create a new PlayStatusPacket
    const status = new PlayStatusPacket();
    status.status = PlayStatus.PlayerSpawn;

    // Send the packet to the player
    player.sendImmediate(status);

    // Teleport the player back to the spawn point
    player.teleport(player.getSpawnPoint());

    // Spawn the player into the dimension
    player.spawn();
  }
}

export { RespawnHandler };
