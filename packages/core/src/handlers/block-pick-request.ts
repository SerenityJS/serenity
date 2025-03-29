import { BlockPickRequestPacket, Gamemode, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait } from "../entity";

class BlockPickRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.BlockPickRequest;

  public async handle(
    packet: BlockPickRequestPacket,
    connection: Connection
  ): Promise<void> {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the position from the packet
    const { x, y, z, addData } = packet;

    // Get the player's dimension
    const dimension = player.dimension;

    // Get the block at the position provided by the packet
    const block = await dimension.getBlock({ x, y, z });

    // Call the onPick trait methods of the block
    await Promise.all(
      block.traits.values().map((trait) => trait.onPick?.(player, addData))
    );

    // Check if the player is in creative mode
    if (player.gamemode !== Gamemode.Creative) return;

    // Create a new item stack from the block
    const itemStack = await block.getItemStack({
      amount: 1,
      metadata: addData ? block.permutation.index : 0
    });

    // Check if block data should be added to the item stack
    if (addData) {
      // Get the data entry of the block
      const entry = block.getDataEntry();

      // Add the entry to the item stack components
      itemStack.dynamicProperties.set("block_data", entry);
    }

    // Get the player's inventory container
    const { container, selectedSlot } = player.getTrait(EntityInventoryTrait);

    // Add the item stack to the player's inventory
    await container.setItem(selectedSlot, itemStack);
  }
}

export { BlockPickRequestHandler };
