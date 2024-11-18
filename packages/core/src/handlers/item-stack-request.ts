import { Connection } from "@serenityjs/raknet";
import {
  ContainerName,
  ItemStackRequestAction,
  ItemStackRequestPacket,
  Packet
} from "@serenityjs/protocol";

import { NetworkHandler } from "../network";
import { ItemStack } from "../item";
import { EntityInventoryTrait, PlayerCursorTrait } from "../entity";
import { PlayerContainerInteractionSignal } from "..";

class ItemStackRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemStackRequest;

  public handle(packet: ItemStackRequestPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Loop through the requests.
    for (const request of packet.requests) {
      // Loop through the actions.
      for (const action of request.actions) {
        // Check if the action is a take or place action.
        if (action.takeOrPlace) {
          // Get the request.
          const request = action.takeOrPlace;

          // Get the source type and destination type.
          const sourceContainer = request.source.container;
          const destinationContainer = request.destination.container;

          const sourceSlot = request.source.slot;
          const destinationSlot = request.destination.slot;
          const amount = request.amount ?? 1;

          // Check if the source type is a creative output.
          if (sourceContainer.identifier === ContainerName.CreativeOutput)
            break;

          // Fetch the source container from the player.
          const source = player.getContainer(
            sourceContainer.identifier,
            sourceContainer.dynamicIdentifier
          );

          // Check if the source container exists.
          if (!source)
            throw new Error(
              `Invalid source type: ${ContainerName[sourceContainer.identifier]}`
            );

          // Fetch the destination container from the player.
          const destination = player.getContainer(
            destinationContainer.identifier,
            destinationContainer.dynamicIdentifier
          );

          // Check if the destination container exists.
          if (!destination)
            throw new Error(
              `Invalid destination type: ${ContainerName[destinationContainer.identifier]}`
            );

          // Create a new PlayerContainerInteractionSignal.
          const signal = new PlayerContainerInteractionSignal(
            player,
            source,
            sourceSlot,
            destination,
            destinationSlot,
            amount
          );

          // Emit the signal, and check if it was cancelled.
          if (!signal.emit()) {
            // Update the source and destination containers.
            source.update(player);
            destination.update(player);

            // Continue to the next action.
            continue;
          }

          // Get the source item.
          const sourceItem = source.getItem(sourceSlot);

          // Check if the source item exists.
          if (!sourceItem) continue;

          // Get the destination item.
          const destinationItem = destination.getItem(destinationSlot);

          if (amount <= sourceItem.amount) {
            const item = source.takeItem(sourceSlot, amount);
            if (!item) throw new Error("Invalid item.");
            if (destinationItem) {
              destinationItem.increment(item.amount);
            } else {
              destination.setItem(destinationSlot, item);
              // Clear the cursor, this appears to be a bug in the protocol.
              const cursor = player.getTrait(PlayerCursorTrait);
              if (!cursor) throw new Error("Invalid cursor.");
              if (cursor.container.getItem(0) === null)
                cursor.container.clearSlot(0);
            }
          } else throw new Error("Invalid count possible.");
        }

        if (action.drop) {
          // Get the request.
          const request = action.drop;

          // Get the source and slot.
          const source = request.source;
          const slot = source.slot;
          const amount = request.amount;

          // Get the source container.
          const container = player.getContainer(source.container.identifier);

          // Check if the container exists.
          if (!container)
            throw new Error(
              `Invalid container: ${source.container.identifier}`
            );

          // Create a new PlayerContainerInteractionSignal.
          const signal = new PlayerContainerInteractionSignal(
            player,
            container,
            slot,
            null,
            null,
            amount
          );

          // Emit the signal, and check if it was cancelled.
          if (!signal.emit()) {
            // Update the container.
            container.update(player);

            // Continue to the next action.
            continue;
          }

          // Force the player to drop the item.
          player.dropItem(slot, amount, container);
        }

        if (action.swap) {
          // Get the request.
          const request = action.swap;

          // Get the source and destination.
          const sourceContainer = request.source.container;
          const sourceSlot = request.source.slot;
          const destinationContainer = request.destination.container;
          const destinationSlot = request.destination.slot;

          // Get the source container.
          const source = player.getContainer(
            sourceContainer.identifier,
            sourceContainer.dynamicIdentifier
          );

          // Check if the source container exists.
          if (!source)
            throw new Error(
              `Invalid source container: ${sourceContainer.identifier}`
            );

          // Get the destination container.
          const destination = player.getContainer(
            destinationContainer.identifier,
            destinationContainer.dynamicIdentifier
          );

          // Check if the destination container exists.
          if (!destination)
            throw new Error(
              `Invalid destination container: ${destinationContainer.identifier}`
            );

          // Create a new PlayerContainerInteractionSignal.
          const signal = new PlayerContainerInteractionSignal(
            player,
            source,
            sourceSlot,
            destination,
            destinationSlot,
            1
          );

          // Emit the signal, and check if it was cancelled.
          if (!signal.emit()) {
            // Update the source and destination containers.
            source.update(player);
            destination.update(player);

            // Continue to the next action.
            continue;
          }

          // Get the source item.
          const sourceItem = source.getItem(sourceSlot);

          // Check if the source item exists.
          if (!sourceItem) continue;

          // Get the destination item.
          const destinationItem = destination.getItem(destinationSlot);

          // Check if the destination item exists.
          if (!destinationItem) continue;

          // Swap the items.
          source.swapItems(sourceSlot, destinationSlot, destination);
        }

        // Check if the action is a destroy or consume action.
        if (action.destroyOrConsume) {
          // Get the request.
          const request = action.destroyOrConsume;

          // Get the source.
          const source = request.source;
          if (!source) continue;

          // Check if the source is the cursor.
          if (source.container.identifier === ContainerName.Cursor) {
            // Get the cursor component.
            const cursor = player.getTrait(PlayerCursorTrait);

            // Clear the cursor.
            cursor.container.clearSlot(0);
          } else {
            // Get the inventory component
            const inventory = player.getTrait(EntityInventoryTrait);

            // Clear the source.
            inventory.container.clearSlot(source.slot);
          }
        }

        if (action.craftRecipe) {
          // Get the item instance action.
          const itemInstanceAction = request
            .actions[1] as ItemStackRequestAction;

          // Check if the item instance action exists.
          if (!itemInstanceAction.resultsDeprecated)
            throw new Error("Invalid item instance action.");

          // Get the items being crafted.
          const descriptors = itemInstanceAction.resultsDeprecated.resultants;

          // Get the destination action.
          const destinationAction = request.actions.at(
            -1
          ) as ItemStackRequestAction;

          // Check if the destination action exists.
          if (!destinationAction.takeOrPlace)
            throw new Error("Invalid destination action.");

          // Get the destination.
          const destination = player.getContainer(
            destinationAction.takeOrPlace.destination.container.identifier
          );

          // Check if the destination exists.
          if (!destination)
            throw new Error(
              `Invalid destination: ${destinationAction.takeOrPlace.destination.container.identifier}`
            );

          // Add the items to the destination.
          for (const descriptor of descriptors) {
            // Convert the descriptor to an item stack.
            const itemStack = ItemStack.fromNetworkInstance(descriptor);

            // Check if the item stack exists
            if (!itemStack)
              throw new Error(
                "Failed to convert network descriptor to item stack."
              );

            // Set the amount of the item stack.
            itemStack.setAmount(itemStack.amount * action.craftRecipe.amount);

            // Add the item stack to the destination.
            destination.addItem(itemStack);
          }
        }

        if (action.craftCreative) {
          // Get the destination request.
          const destinationAction = request
            .actions[2] as ItemStackRequestAction;

          // Check if the destination exists.
          if (!destinationAction.takeOrPlace)
            throw new Error("Invalid destination.");

          // Get the destination.
          const destination = destinationAction.takeOrPlace.destination;
          const amount = destinationAction.takeOrPlace.amount;

          // Get the container.
          const container = player.getContainer(
            destination.container.identifier
          );

          // Check if the container exists.
          if (!container)
            throw new Error(
              `Invalid container: ${destination.container.identifier}`
            );

          // Get the request.
          const craft = action.craftCreative;

          // Get the world of the player, and the creative item.
          const world = player.dimension.world;
          const creativeItem = world.itemPalette.getCreativeContentByIndex(
            craft.creativeIndex
          );

          // Check if the creative item exists
          if (!creativeItem)
            throw new Error(
              `Received invalid creative item: ${craft.creativeIndex}`
            );

          // Create the item stack.
          const itemStack = new ItemStack(creativeItem.type, { amount, world });

          // Set the item stack in the container
          container.setItem(destination.slot, itemStack);
        }
      }
    }
  }
}

export { ItemStackRequestHandler };
