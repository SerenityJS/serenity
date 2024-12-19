import {
  DataPacket,
  Packet,
  PlayStatus,
  PlayStatusPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityHealthTrait } from "../entity";

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

    // Get the players health trait
    const health = player.getTrait(EntityHealthTrait);

    // Set the players health to the max value
    health.currentValue = health.defaultValue;

    const dimension = player.world.getDimension();

    player.teleport(dimension.spawnPosition);
    player.spawn();
  }
}

export { RespawnHandler };
