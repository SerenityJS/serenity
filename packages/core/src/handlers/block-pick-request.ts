import { BlockPickRequestPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class BlockPickRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.BlockPickRequest;

  public handle(packet: BlockPickRequestPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the position from the packet
    const { x, y, z, addData } = packet;

    // Get the player's dimension
    const dimension = player.dimension;

    // Get the block at the position provided by the packet
    const block = dimension.getBlock({ x, y, z });

    // Call the onPick trait methods of the block
    for (const trait of block.traits.values()) trait.onPick?.(player, addData);
  }
}

export { BlockPickRequestHandler };
