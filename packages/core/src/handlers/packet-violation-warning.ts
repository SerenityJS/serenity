import { PacketViolationWarningPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class PacketViolationWarningHandler extends NetworkHandler {
  public static readonly packet = Packet.PacketViolationWarning;

  public handle(
    packet: PacketViolationWarningPacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Log the packet violation warning
    this.serenity.logger.debug(
      `Packet violation warning from ${player.username} (${Packet[packet.packet] ?? packet.packet}): ${packet.context}`
    );
  }
}

export { PacketViolationWarningHandler };
