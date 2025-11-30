import { Connection } from "@serenityjs/raknet";
import {
  ContainerName,
  FullContainerName,
  Gamemode,
  ItemStackActionTakePlace,
  ItemStackRequestActionCraftCreative,
  ItemStackRequestActionCraftRecipe,
  ItemStackRequestActionDestroyConsume,
  ItemStackRequestActionDrop,
  ItemStackRequestActionSwap,
  ItemStackRequestPacket,
  ItemStackResponseContainerInfo,
  ItemStackResponseInfo,
  ItemStackResponsePacket,
  ItemStackResponseResult,
  Packet
} from "@serenityjs/protocol";

import { NetworkHandler } from "../network";
import { ItemStack } from "../item";
import { Player } from "../entity";
import {
  PlayerContainerInteractionSignal,
  PlayerCraftRecipeSignal
} from "../events";

class ItemStackRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.ItemStackRequest;

  public handle(packet: ItemStackRequestPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Create a new ItemStackResponsePacket
    const response = new ItemStackResponsePacket();
    response.responses = []; // Create an empty array for responses

    // Iterate through the requests in the packet
    for (const { clientRequestId, actions } of packet.requests) {
      // Fast lookup by container identifier to merge slots
      const containers = new Map<string, ItemStackResponseContainerInfo>();

      // Iterate through the actions in the request
      for (const action of actions) {
        // Prepare a result variable
        let result: Array<ItemStackResponseContainerInfo> | null = null;

        // Handle take or place actions
        if (action.takeOrPlace) {
          // Update the result variable
          result = this.handleTakeOrPlaceAction(player, action.takeOrPlace);
        }

        // Handle swap actions
        if (action.swap) {
          // Update the result variable
          result = this.handleSwapAction(player, action.swap);
        }

        // Handle drop actions
        if (action.drop) {
          // Update the result variable
          result = this.handleDropAction(player, action.drop);
        }

        // Handle destroy or consume actions
        if (action.destroyOrConsume) {
          // Update the result variable
          result = this.handleDestroyOrConsumeAction(
            player,
            action.destroyOrConsume
          );
        }

        // Handle creative actions
        if (action.craftCreative) {
          // Update the result variable
          result = this.handleCraftCreativeAction(player, action.craftCreative);
        }

        // Handle craft recipe actions
        if (action.craftRecipe) {
          // Update the result variable
          result = this.handleCraftRecipeAction(player, action.craftRecipe);
        }

        // Deprecated actions are ignored
        if (action.resultsDeprecated) continue;

        // If a result was obtained, create a new response info
        if (result) {
          // Check if there are any containers to report
          if (result.length === 0) continue;

          // Iterate through the container infos in the result
          for (const containerInfo of result) {
            // Prepare a unique key for the container
            let key = `${containerInfo.fullContainerName.identifier}`;

            // If there is a dynamic identifier, append it to the key
            if (
              containerInfo.fullContainerName.dynamicIdentifier !== undefined
            ) {
              key += `:${containerInfo.fullContainerName.dynamicIdentifier}`;
            }

            // Check if the container info already exists
            const existing = containers.get(key);

            // Check if the responses already contain this container info
            if (existing) {
              // Merge the slots into the existing container info
              existing.slots.push(...containerInfo.slots);
            } else {
              // Add the container info to the map
              containers.set(key, containerInfo);
            }
          }
        } else {
          // Create a new ItemStackResponseInfo with an error result
          const errorResponse = new ItemStackResponseInfo(
            ItemStackResponseResult.Error,
            clientRequestId
          );

          // Add the error response to the responses array
          response.responses.push(errorResponse);

          // Break out of the actions loop
          break;
        }
      }

      // Check if any containers were added
      if (containers.size > 0) {
        // Create a new ItemStackResponseInfo
        const info = new ItemStackResponseInfo(
          ItemStackResponseResult.Success,
          clientRequestId,
          Array.from(containers.values())
        );

        // Add the info to the responses array
        response.responses.push(info);
      }
    }

    // Send the response packet to the player
    player.send(response);
  }

  private handleTakeOrPlaceAction(
    player: Player,
    action: ItemStackActionTakePlace
  ): Array<ItemStackResponseContainerInfo> | null {
    // Fetch the source and destination containers.
    const source = player.getContainer(action.source.container);
    const destination = player.getContainer(action.destination.container);

    // Check if the source container exists.
    if (!source || !destination) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid source or destination container for take or place action. Source: ${ContainerName[action.source.container.identifier]}, Destination: ${ContainerName[action.destination.container.identifier]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the source and destination slots
    const sourceSlot = action.source.slot;
    const destinationSlot = action.destination.slot;

    // Get the amount to take or place.
    const amount = action.amount ?? 1;

    // Create and emit a PlayerContainerInteractionSignal
    const signal = new PlayerContainerInteractionSignal(
      player,
      source,
      sourceSlot,
      destination,
      destinationSlot,
      amount
    );
    if (!signal.emit()) return null;

    // Check if the player is in creative mode
    if (player.getGamemode() === Gamemode.Creative) {
      // Get the item stack from the source container.
      const item = source.getItem(sourceSlot);

      // Set the item stack amount based on the action amount.
      if (item && item.getStackSize() < amount) item.setStackSize(amount);
    }

    // Take the item from the source container.
    const item = source.takeItem(sourceSlot, amount);
    if (!item) {
      // Log an error message
      this.serenity.logger.error(
        `Failed to take item from source container. Source: ${ContainerName[action.source.container.identifier]}, Slot: ${sourceSlot}, Amount: ${amount}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the destination item stack.
    const destinationStack = destination.getItem(destinationSlot);

    // Check if there is an item stack in the destination slot.
    if (destinationStack) {
      // Increment the stack size of the destination item stack.
      destinationStack.incrementStack(item.getStackSize());
    } else {
      // Set the item stack in the destination container.
      destination.setItem(destinationSlot, item);
    }

    // Get the updated item stacks.
    const sourceStack = source.getItem(sourceSlot);
    const updatedDestinationStack = destination.getItem(destinationSlot);

    // Return the container info array.
    return [
      this.buildContainerInfo(action.source.container, sourceSlot, sourceStack),
      this.buildContainerInfo(
        action.destination.container,
        destinationSlot,
        updatedDestinationStack
      )
    ];
  }

  private handleSwapAction(
    player: Player,
    action: ItemStackRequestActionSwap
  ): Array<ItemStackResponseContainerInfo> | null {
    // Fetch the source and destination containers.
    const source = player.getContainer(action.source.container);
    const destination = player.getContainer(action.destination.container);

    // Check if the source and destination containers exist.
    if (!source || !destination) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid source or destination container for swap action. Source: ${ContainerName[action.source.container.identifier]}, Destination: ${ContainerName[action.destination.container.identifier]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the source and destination slots
    const sourceSlot = action.source.slot;
    const destinationSlot = action.destination.slot;

    // Create and emit a PlayerContainerInteractionSignal
    const signal = new PlayerContainerInteractionSignal(
      player,
      source,
      sourceSlot,
      destination,
      destinationSlot,
      -1
    );
    if (!signal.emit()) return null;

    // Swap the items in the source and destination containers.
    source.swapItems(sourceSlot, destinationSlot, destination);

    // Get the updated item stacks.
    const sourceStack = source.getItem(sourceSlot);
    const destinationStack = destination.getItem(destinationSlot);

    // Return the container info array.
    return [
      this.buildContainerInfo(action.source.container, sourceSlot, sourceStack),
      this.buildContainerInfo(
        action.destination.container,
        destinationSlot,
        destinationStack
      )
    ];
  }

  private handleDropAction(
    player: Player,
    action: ItemStackRequestActionDrop
  ): Array<ItemStackResponseContainerInfo> | null {
    // Fetch the source container.
    const source = player.getContainer(action.source.container);

    // Check if the source container exists.
    if (!source) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid source container for drop action. Source: ${ContainerName[action.source.container.identifier]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the source slot
    const sourceSlot = action.source.slot;

    // Get the amount to drop.
    const amount = action.amount;

    // Create and emit a PlayerContainerInteractionSignal
    const signal = new PlayerContainerInteractionSignal(
      player,
      source,
      sourceSlot,
      null,
      null,
      amount
    );
    if (!signal.emit()) return null;

    // Force the player to drop the item.
    player.dropItem(sourceSlot, amount, source);

    // Get the updated item stack.
    const sourceStack = source.getItem(sourceSlot);

    // Return the container info array.
    return [
      this.buildContainerInfo(action.source.container, sourceSlot, sourceStack)
    ];
  }

  private handleDestroyOrConsumeAction(
    player: Player,
    action: ItemStackRequestActionDestroyConsume
  ): Array<ItemStackResponseContainerInfo> | null {
    // Fetch the source container.
    const source = player.getContainer(action.source.container);

    // Check if the source container exists.
    if (!source) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid source container for destroy or consume action. Source: ${ContainerName[action.source.container.identifier]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the source slot
    const sourceSlot = action.source.slot;

    // Get the amount to destroy or consume.
    const amount = action.amount;

    // Get the item from the source container.
    const item = source.getItem(sourceSlot);

    // Check if the item exists.
    if (!item) {
      // Log an error message
      this.serenity.logger.error(
        `No item found in source container for destroy or consume action. Source: ${ContainerName[action.source.container.identifier]}, Slot: ${sourceSlot}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Decrement the stack size of the item.
    item.decrementStack(amount);

    // Get the updated item stack.
    const sourceStack = source.getItem(sourceSlot);

    // Return the container info array.
    return [
      this.buildContainerInfo(action.source.container, sourceSlot, sourceStack)
    ];
  }

  private handleCraftCreativeAction(
    player: Player,
    action: ItemStackRequestActionCraftCreative
  ): Array<ItemStackResponseContainerInfo> | null {
    // Verify that the player is in creative mode.
    if (player.getGamemode() !== Gamemode.Creative) {
      // Log an error message
      this.serenity.logger.error(
        `Player is not in creative mode for craft creative action. Gamemode: ${Gamemode[player.getGamemode()]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the destination container.
    const destination = player.getContainer({
      identifier: ContainerName.CreativeOutput
    });

    // Check if the destination container exists.
    if (!destination) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid destination container for craft creative action. Destination: ${ContainerName[ContainerName.CreativeOutput]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Clear the destination container.
    destination.clear();

    // Get the creative item from the world item palette.
    const creativeItem =
      player.dimension.world.itemPalette.getCreativeContentByIndex(
        action.creativeIndex
      );

    // Check if the creative item exists.
    if (!creativeItem) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid creative item index for craft creative action. Index: ${action.creativeIndex}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Create the item stack from the network instance.
    const itemStack = ItemStack.fromNetworkInstance(creativeItem.descriptor, {
      stackSize: action.amount,
      storage: creativeItem.stackStorage // NBT data for the item stack
    });

    // Check if the item stack was created successfully.
    if (!itemStack) {
      // Log an error message
      this.serenity.logger.error(
        `Failed to create item stack for creative item index: ${action.creativeIndex}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Set the item stack in the destination container.
    destination.setItem(0, itemStack);

    // Return the container info array.
    return [
      this.buildContainerInfo(
        { identifier: ContainerName.CreativeOutput },
        0,
        destination.getItem(0)
      )
    ];
  }

  private handleCraftRecipeAction(
    player: Player,
    action: ItemStackRequestActionCraftRecipe
  ): Array<ItemStackResponseContainerInfo> | null {
    // Get the destination container.
    const destination = player.getContainer({
      identifier: ContainerName.CraftingOutput
    });

    // Check if the destination container exists.
    if (!destination) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid destination container for craft recipe action. Destination: ${ContainerName[ContainerName.CraftingOutput]}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Get the recipe from the player's item palette.
    const recipe = player.world.itemPalette.getRecipeByNetworkId(
      action.recipeId
    );

    // Check if the recipe exists.
    if (!recipe) {
      // Log an error message
      this.serenity.logger.error(
        `Invalid recipe ID for craft recipe action. Recipe ID: ${action.recipeId}`
      );

      // Return null to indicate failure.
      return null;
    }

    // Create and emit a PlayerCraftRecipeSignal
    const signal = new PlayerCraftRecipeSignal(player, recipe, action.amount);
    if (!signal.emit()) return null;

    // Iterate over the resultants of the recipe.
    for (const item of recipe.resultants) {
      // Check if the item is an ItemType.
      let itemStack: ItemStack;
      if (item instanceof ItemStack) {
        // Copy the item stack.
        itemStack = ItemStack.from(item);
      } else {
        // Convert the ItemType to an ItemStack.
        itemStack = new ItemStack(item, { stackSize: action.amount });
      }

      // Get the current stack size and multiply it by the amount.
      itemStack.setStackSize(itemStack.getStackSize() * action.amount);

      // Add the item stack to the destination container.
      destination.setItem(0, itemStack);
    }

    // Return the container info array.
    return [
      this.buildContainerInfo(
        { identifier: ContainerName.CraftingOutput },
        0,
        destination.getItem(0)
      )
    ];
  }

  /**
   * Builds the container info for the given parameters.
   * @param containerName The full container name.
   * @param slot The slot number.
   * @param itemStack The item stack.
   * @returns The container info.
   */
  private buildContainerInfo(
    containerName: FullContainerName,
    slot: number,
    itemStack: ItemStack | null
  ): ItemStackResponseContainerInfo {
    return {
      fullContainerName: containerName,
      slots: [
        {
          slot: slot,
          amount: itemStack ? itemStack.getStackSize() : 0,
          customName: itemStack ? itemStack.getDisplayName() : "",
          itemStackId: itemStack ? itemStack.networkStackId : 0,
          durabilityCorrection: itemStack ? itemStack.getDamgeDurability() : 0,
          filterCustomName: itemStack ? itemStack.getDisplayName() : ""
        }
      ]
    };
  }
}

export { ItemStackRequestHandler };
