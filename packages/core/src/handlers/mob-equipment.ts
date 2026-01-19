import {
  ContainerId,
  MobEquipmentPacket,
  NetworkItemStackDescriptor,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait } from "../entity";
import { ItemStack } from "../item";

class MobEquipmentHandler extends NetworkHandler {
  public static readonly packet = Packet.MobEquipment;

  public handle(packet: MobEquipmentPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the player's inventory trait
    const inventory = player.getTrait(EntityInventoryTrait);

    // Get the current selected slot container
    const currentItemStack = inventory.container.getItem(
      inventory.selectedSlot
    );

    // Check if there is a current item stack
    if (currentItemStack) {
      // Iterate through all traits of the current item stack
      for (const trait of currentItemStack.getAllTraits()) {
        try {
          // Call the onHotbarDeselect event for the trait
          trait.onHotbarDeselect?.({
            player: player,
            slot: inventory.selectedSlot
          });
        } catch (reason) {
          // Log the error to the console
          this.serenity.logger.error(
            `Failed to trigger onHotbarDeselect trait event for item "${currentItemStack.type.identifier}"`,
            reason
          );

          // Remove the trait from the item stack
          currentItemStack.removeTrait(trait.identifier);
        }
      }
    }

    // Set the player's selected item
    inventory.selectedSlot = packet.selectedSlot;

    // Get the player's held item
    const item = inventory.getHeldItem();

    // Check if there is a held item
    if (item) {
      // Iterate through all traits of the held item stack
      for (const trait of item.getAllTraits()) {
        try {
          // Call the onHotbarSelect event for the trait
          trait.onHotbarSelect?.({
            player: player,
            slot: inventory.selectedSlot
          });
        } catch (reason) {
          // Log the error to the console
          this.serenity.logger.error(
            `Failed to trigger onHotbarSelect trait event for item "${item.type.identifier}"`,
            reason
          );

          // Remove the trait from the item stack
          item.removeTrait(trait.identifier);
        }
      }
    }

    // Create a new MobEquipmentPacket
    const update = new MobEquipmentPacket();
    update.runtimeEntityId = player.runtimeId;
    update.slot = packet.selectedSlot;
    update.selectedSlot = packet.selectedSlot;
    update.containerId = ContainerId.Inventory;
    update.item =
      item === null
        ? new NetworkItemStackDescriptor(0)
        : ItemStack.toNetworkStack(item);

    // Broadcast the packet to all players, except the player in context
    player.dimension.broadcastExcept(player, update);
  }
}

export { MobEquipmentHandler };
