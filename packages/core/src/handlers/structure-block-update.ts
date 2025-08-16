import { StructureBlockUpdatePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { BlockStructureTrait } from "../block";

class StructureBlockUpdateHander extends NetworkHandler {
  public static readonly packet = Packet.StructureBlockUpdate;

  public handle(
    packet: StructureBlockUpdatePacket,
    connection: Connection
  ): void {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Check if the player is an operator
    if (!player.isOp) return player.disconnect("You are not an operator.");

    // Get the block at the position in the packet
    const block = player.dimension.getBlock(packet.blockPosition);

    // Get the structure trait from the block
    const trait = block.getTrait(BlockStructureTrait);

    // Check if the trait exists
    if (!trait) return;

    // Get the data from the packet
    const data = packet.structureEditData;

    // Update the trait with the data from the packet
    trait.setMode(data.blockType);
    trait.setStructureName(data.structureName);
    trait.setBoundingBoxVisible(data.showBoundingBox);
    trait.setSize(data.structureSetting.size);
    trait.setOffset(data.structureSetting.offset);
  }
}

export { StructureBlockUpdateHander };
