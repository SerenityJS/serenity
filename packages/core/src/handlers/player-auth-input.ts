import {
  Packet,
  PlayerAuthInputPacket,
  PlayerBlockActionData
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { Player } from "../entity";

class PlayerAuthInputHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerAuthInput;

  public handle(packet: PlayerAuthInputPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Set the player's position
    player.position.x = packet.position.x;
    player.position.y = packet.position.y;
    player.position.z = packet.position.z;

    // Set the player's rotation
    player.rotation.pitch = packet.rotation.x;
    player.rotation.yaw = packet.rotation.y;
    player.rotation.headYaw = packet.headYaw;

    // Convert the player's position to a block position
    const position = player.position.floor();

    // Get the block permutation below the player
    // Getting the permutation rather than the block will reduce server load
    // As getting the block will construct a block instance, the permutation is already loaded
    const permutation = player.dimension.getPermutation({
      ...position,
      y: position.y - 2
    });

    // Update the player's onGround status
    player.onGround = permutation.type.solid;

    // Check if the packet contains block actions
    if (packet.blockActions)
      this.handleBlockActions(player, packet.blockActions.actions);
  }

  /**
   * Handles block actions from the player
   * @param player The player that performed the block actions
   * @param actions The block actions performed by the player
   */
  public handleBlockActions(
    _player: Player,
    _actions: Array<PlayerBlockActionData>
  ): void {}
}

export { PlayerAuthInputHandler };
