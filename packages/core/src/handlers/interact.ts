import { InteractAction, InteractPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait } from "../entity";

class InteractHandler extends NetworkHandler {
  public static readonly packet = Packet.Interact;

  public handle(packet: InteractPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the player's dimension
    const dimension = player.dimension;

    // Switch on the action type
    switch (packet.action) {
      // Log unimplemented actions
      default: {
        return dimension.world.logger.debug(
          `InteractHandler: Unimplemented action ${[InteractAction[packet.action]]}`
        );
      }

      // This fires when a player looks at an entity
      // If the runtime id is 0, the player is no longer looking at the entity
      case InteractAction.InteractUpdate: {
        // Check if the runtime id is 0
        if (packet.actorRuntimeId === 0n)
          return void (player.entityTarget = null);

        // Get the target entity from the dimension
        const entity = dimension.getEntity(packet.actorRuntimeId, true);

        // Check if the entity exists
        if (!entity) return;

        // Set the player's target entity
        return void (player.entityTarget = entity);
      }

      // The action occurs when the player is opening their inventory
      case InteractAction.OpenInventory: {
        // Get the target entity from the dimension
        const entity = dimension.getEntity(packet.actorRuntimeId, true);

        // Check if the entity has a inventory trait
        if (!entity || !entity.hasTrait(EntityInventoryTrait))
          return console.log("Entity does not have an inventory trait");

        // Get the inventory trait from the entity
        const { container } = entity.getTrait(EntityInventoryTrait);

        // Show the container to the player
        return container.show(player);
      }
    }
  }
}

export { InteractHandler };
