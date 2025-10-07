import { Connection } from "@serenityjs/raknet";
import {
  ContainerName,
  ItemStackRequestAction,
  ItemStackRequestPacket,
  Packet
} from "@serenityjs/protocol";

import { NetworkHandler } from "../network";
import { ItemStack, ItemType } from "../item";
import { PlayerCraftingInputTrait, PlayerCursorTrait } from "../entity";
import { PlayerContainerInteractionSignal } from "../events";

class ItemStackRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemStackRequest;

  public handle(packet: ItemStackRequestPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Loop through the requests.
    for (const _request of packet.requests) {
      // Loop through the actions.
      for (const action of _request.actions) {
        // Check if the action is a take or place action.
        if (action.takeOrPlace) {
          // Get the request.
          const request = action.takeOrPlace;

          // Get the source type and destination type.
          const sourceContainer = request.source.container;
          const destinationContainer = request.destination.container;

          // Get the amount of items to take or place.
          const amount = request.amount ?? 1;

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

          // Get the source slot.
          const sourceSlot = request.source.slot % source.size;

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

          // Get the destination slot
          const destinationSlot = request.destination.slot % destination.size;

          // Check if the source type is a creative output.
          if (sourceContainer.identifier === ContainerName.CreativeOutput) {
            // Get the player's crafting input trait.
            const craftingInput = player.getTrait(PlayerCraftingInputTrait);

            // Check if the crafting input exists.
            if (
              craftingInput?.pendingCraftingRecipe &&
              craftingInput.pendingCraftingAmount
            ) {
              // Get the recipe from the crafting input.
              const recipe = craftingInput.pendingCraftingRecipe;
              const amount = craftingInput.pendingCraftingAmount;

              // Iterate over the resultants of the recipe.
              for (const item of recipe.resultants) {
                // Check if the item is an ItemType.
                if (item instanceof ItemType) {
                  // Convert the ItemType to an ItemStack.
                  const itemStack = new ItemStack(item, { stackSize: amount });

                  // Add the item stack to the player's inventory.
                  destination?.setItem(destinationSlot, itemStack);
                } else {
                  // Copy the item stack and set the stack size.
                  const itemStack = ItemStack.from(item);

                  // Get the current stack size and multiply it by the amount.
                  itemStack.setStackSize(itemStack.stackSize * amount);

                  // Add the item stack to the player's inventory.
                  destination?.setItem(destinationSlot, itemStack);
                }
              }

              // Clear the pending crafting recipe and amount.
              craftingInput.pendingCraftingRecipe = null;
              craftingInput.pendingCraftingAmount = null;
            }

            continue;
          }

          // Create a new PlayerContainerInteractionSignal.
          const signal = new PlayerContainerInteractionSignal(
            player,
            source,
            sourceSlot,
            destination,
            destinationSlot,
            amount,
            _request.clientRequestId
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

          if (amount <= sourceItem.stackSize) {
            const item = source.takeItem(sourceSlot, amount);
            if (!item) throw new Error("Invalid item.");
            if (destinationItem) {
              destinationItem.incrementStack(item.stackSize);
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
          const amount = request.amount;

          // Get the source container.
          const container = player.getContainer(source.container.identifier);

          // Check if the container exists.
          if (!container)
            throw new Error(
              `Invalid container: ${source.container.identifier}`
            );

          // Get the slot
          const slot = source.slot % container.size;

          // Create a new PlayerContainerInteractionSignal.
          const signal = new PlayerContainerInteractionSignal(
            player,
            container,
            slot,
            null,
            null,
            amount,
            _request.clientRequestId
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
          const destinationContainer = request.destination.container;

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

          // Get the source slot.
          const sourceSlot = request.source.slot % source.size;

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

          // Get the destination slot.
          const destinationSlot = request.destination.slot % destination.size;

          // Create a new PlayerContainerInteractionSignal.
          const signal = new PlayerContainerInteractionSignal(
            player,
            source,
            sourceSlot,
            destination,
            destinationSlot,
            1,
            _request.clientRequestId
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
          const { source, amount } = action.destroyOrConsume;

          // Get the source container.
          const container = player.getContainer(source.container.identifier);

          // Check if the container exists.
          if (!container) continue;

          // Calculate the source slot.
          const slot = source.slot % container.size;

          // Get the item from the container.
          const item = container.getItem(slot);

          // Check if the item exists.
          if (item) item.decrementStack(amount);
        }

        if (action.craftRecipe) {
          // Get the craft recipe action.
          const { recipeId, amount } = action.craftRecipe;

          // Get the recipe from the player's item palette.
          const recipe =
            player.world.itemPalette.getRecipeByNetworkId(recipeId);

          // Check if the recipe exists.
          if (!recipe)
            throw new Error(
              `Invalid recipe: ${recipeId} for player ${player.username}`
            );

          // Get the players crafting input trait.
          const craftingInput = player.getTrait(PlayerCraftingInputTrait);

          // Check if the crafting input exists.
          if (!craftingInput)
            throw new Error("Player does not have a crafting input trait.");

          // Set the pending crafting recipe.
          craftingInput.pendingCraftingRecipe = recipe;
          craftingInput.pendingCraftingAmount = amount;
        }

        if (action.craftCreative) {
          // Get the destination request.
          const destinationAction = _request
            .actions[2] as ItemStackRequestAction;

          // Check if the destination exists.
          if (!destinationAction?.takeOrPlace)
            throw new Error("Take or place action is required.");

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
          const itemStack = ItemStack.fromNetworkInstance(
            creativeItem.descriptor
          ) as ItemStack;

          // Check if the item stack exists.
          if (creativeItem.stackStorage)
            itemStack.loadLevelStorage(world, creativeItem.stackStorage);

          // Set the amount of the item stack.
          itemStack.setStackSize(amount);

          // Set the item stack in the container
          container.setItem(destination.slot, itemStack);
        }
      }
    }
  }
}

export { ItemStackRequestHandler };
