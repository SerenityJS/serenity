import {
  EntityPickRequestPacket,
  Gamemode,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { ItemIdentifier } from "../enums";
import { ItemStack } from "../item";
import { EntityInventoryTrait } from "../entity";

class EntityPickRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.EntityPickRequest;

  public handle(packet: EntityPickRequestPacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the player is in creative mode.
    if (player.gamemode !== Gamemode.Creative) return;

    // Separate the unique actor ID and with data from the packet.
    const { uniqueActorId, withData } = packet;

    // Get the entity from the unique actor ID.
    const entity = player.dimension.getEntity(uniqueActorId, false);

    // Check if the entity is defined and not a player.
    if (!entity || entity.isPlayer()) return;

    // Attempt to parse the item identifier from the entity.
    const itemId = `${entity.identifier}_spawn_egg` as ItemIdentifier;

    // Get the item type from the player's world.
    const itemType = player.world.itemPalette.getType(itemId);

    // Check if the item type is defined.
    if (!itemType) return;

    // Create the item stack from the item type.
    const itemStack = new ItemStack(itemType, { world: player.world });

    // Check if the entity data should be added to the item stack.
    if (withData) {
      // // Get the entity data entry.
      // const entry = entity.getDataEntry();
      // // Add the entity data entry to the item stack components.
      // itemStack.components.set("entity_data", entry);
    }

    // Get the player's inventory container.
    const { container } = player.getTrait(EntityInventoryTrait);

    // Add the item stack to the player's inventory.
    container.addItem(itemStack);
  }
}

export { EntityPickRequestHandler };
