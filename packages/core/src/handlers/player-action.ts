import {
  PlayerActionPacket,
  Packet,
  PlayerActionType,
  Vector3f
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class PlayerActionHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerAction;

  public handle(packet: PlayerActionPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Switch the action type
    switch (packet.action) {
      // Log unimplemented action types
      default: {
        // Debug log the unimplemented action type
        this.serenity.logger.debug(
          `PlayerActionHandler: Unimplemented PlayerActionType: ${PlayerActionType[packet.action]}`
        );
        break;
      }

      // Handles when a player starts using an item on a block or entity
      case PlayerActionType.StartItemUseOn: {
        // Set the player's target item
        player.itemTarget = player.getHeldItem();
        break;
      }

      case PlayerActionType.StopItemUseOn: {
        // Set the player's target item to null
        player.itemTarget = null;
        break;
      }

      // DEPRECATED: Handles when a player destroys a block in creative mode
      case PlayerActionType.CreativeDestroyBlock: {
        break;
      }

      case PlayerActionType.ChangeDimensionAck: {
        // Spawn the player once the dimension has finished loading
        return void player.spawn({ changedDimensions: true });
      }

      case PlayerActionType.Respawn: {
        // Spawn the player when they request to respawn
        player.spawn({ initialSpawn: false });

        // Get the player's spawn point
        const { x, y, z } = player.getSpawnPoint();

        // Create a vector for the spawn point
        const vector = new Vector3f(x, y, z);

        // Teleport the player back to the spawn point
        return player.teleport(vector);
      }
    }
  }
}

export { PlayerActionHandler };
