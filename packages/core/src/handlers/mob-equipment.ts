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

    // Set the player's selected item
    inventory.selectedSlot = packet.selectedSlot;

    // Get the player's held item
    const item = inventory.getHeldItem();

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
