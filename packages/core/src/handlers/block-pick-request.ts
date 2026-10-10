import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";
import { BlockPickRequestPacket, Gamemode, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { EntityInventoryTrait } from "../entity";
import { NetworkHandler } from "../network";

import type { Block } from "../block";
import type { ItemStack } from "../item";

/**
 * The number of slots in the hotbar, which are the first slots of the inventory.
 */
const HOTBAR_SIZE = 9;

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
    for (const trait of block.getAllTraits()) trait.onPick?.(player, addData);

    // Check if the block is air, which has no item
    if (block.isAir) return;

    // Create a new item stack from the block, with the block's data if the player asked for it
    const itemStack = block.getItemStack();
    if (addData) this.addBlockData(itemStack, block);

    // Get the player's inventory
    const inventory = player.getTrait(EntityInventoryTrait);
    const { container, selectedSlot } = inventory;

    // Check if the player already has the item
    const slot = container.storage.findIndex((item) => item?.equals(itemStack));
    if (slot !== -1) {
      // Select the item if it is in the hotbar
      if (slot < HOTBAR_SIZE) return inventory.setHeldItem(slot);

      // Otherwise, swap it with the held item
      return container.swapItems(slot, selectedSlot);
    }

    // Check if the player is in creative mode, as only they get items they do not have
    if (player.getGamemode() !== Gamemode.Creative) return;

    // Put the item in the held slot if it is empty
    if (!container.getItem(selectedSlot))
      return container.setItem(selectedSlot, itemStack);

    // Otherwise, put the item in the first empty hotbar slot, and select it
    const hotbar = container.storage.slice(0, HOTBAR_SIZE);
    const emptyHotbarSlot = hotbar.findIndex((item) => !item);
    if (emptyHotbarSlot !== -1) {
      container.setItem(emptyHotbarSlot, itemStack);
      return inventory.setHeldItem(emptyHotbarSlot);
    }

    // Otherwise, move the held item to the first empty inventory slot, if there is one
    const emptySlot = container.storage.findIndex((item, index) => {
      return index >= HOTBAR_SIZE && !item;
    });
    if (emptySlot !== -1) container.swapItems(selectedSlot, emptySlot);

    // Hold the item, replacing the held item if it could not be moved
    container.setItem(selectedSlot, itemStack);
  }

  /**
   * Adds the data of a block to the item of the block, so placing the item restores the data.
   * The item shows it carries data with a (+DATA) line in its lore, as in vanilla.
   * @param itemStack The item of the block.
   * @param block The block to copy the data of.
   */
  protected addBlockData(itemStack: ItemStack, block: Block): void {
    // Get the level storage of the block, and check that it holds data
    const storage = block.peekStorage();
    if (!storage || storage.size === 0) return;

    // Copy the level storage, so the item does not change with the block
    const stream = new BinaryStream();
    CompoundTag.write(stream, storage);
    const data = CompoundTag.read(new BinaryStream(stream.getBuffer()));

    // Remove the position of the block, as the item can be placed anywhere
    data.delete("x");
    data.delete("y");
    data.delete("z");

    // Add the block's data to the item stack
    itemStack.nbt.set("Block", data);
    itemStack.setLore(["(+DATA)"]);
  }
}

export { BlockPickRequestHandler };
