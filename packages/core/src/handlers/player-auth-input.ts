import { Packet, PlayerAuthInputPacket } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

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
  }
}

export { PlayerAuthInputHandler };
