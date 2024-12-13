import {
  BlockPosition,
  ComplexInventoryTransaction,
  Gamemode,
  InventoryAction,
  InventorySourceType,
  InventoryTransactionPacket,
  ItemUseInventoryTransaction,
  ItemUseInventoryTransactionType,
  ItemUseOnEntityInventoryTransaction,
  LevelSoundEvent,
  LevelSoundEventPacket,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait, Player } from "../entity";
import { ItemStack } from "../item";
import { BlockIdentifier, EntityInteractMethod, ItemUseMethod } from "../enums";
import {
  PlayerDropItemSignal,
  PlayerPlaceBlockSignal,
  PlayerUseItemSignal
} from "../events";
import { BlockEntry } from "../types";

class InventoryTransactionHandler extends NetworkHandler {
  public static readonly packet = Packet.InventoryTransaction;

  public handle(
    packet: InventoryTransactionPacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the packet has a transaction
    // There should always be a transaction, but we can never be too sure...
    if (!packet.transaction) return;

    // Switch the transaction type
    switch (packet.transaction.type) {
      // Normal transactions include dropping items
      case ComplexInventoryTransaction.NormalTransaction:
        return this.handleNormalTransaction(player, packet.transaction.actions);

      // Item use transactions include using items, placing blocks, etc.
      case ComplexInventoryTransaction.ItemUseTransaction: {
        // Get the item use transaction
        const transaction = packet.transaction.itemUse;

        // Validate that the transaction actually contains an item use transaction
        if (!transaction)
          throw new Error("ItemUse object missing from ItemUseTransaction");

        // Handle the item use transaction
        return this.handleItemUseTransaction(player, transaction);
      }

      // Item use on entity transactions include using items on entities
      case ComplexInventoryTransaction.ItemUseOnEntityTransaction: {
        // Get the item use on entity transaction
        const transaction = packet.transaction.itemUseOnEntity;

        // Validate that the transaction actually contains an item use on entity transaction
        if (!transaction)
          throw new Error(
            "ItemUseOnEntity object missing from ItemUseOnEntityTransaction"
          );

        // Handle the item use on entity transaction
        return this.handleItemUseOnEntityTransaction(player, transaction);
      }

      case ComplexInventoryTransaction.ItemReleaseTransaction: {
        // Get the item release transaction
        const transaction = packet.transaction.itemRelease;

        // Validate that the transaction actually contains an item release transaction
        if (!transaction)
          throw new Error(
            "ItemRelease object missing from ItemReleaseTransaction"
          );

        // Check if the player is using an item
        if (player.itemTarget)
          // Call the onRelease method for the item stack traits
          for (const trait of player.itemTarget.traits.values())
            trait.onRelease?.(player);

        // Set the player's item target to null
        player.itemTarget = null;
      }
    }
  }

  public handleNormalTransaction(
    player: Player,
    actions: Array<InventoryAction>
  ): void {
    // Iterate through each action
    for (const action of actions) {
      // Switch the action source type
      switch (action.source.type) {
        // Log unimplemented source types
        default: {
          // Debug log the unimplemented source type
          this.serenity.logger.debug(
            `InventoryTransactionHandler: Unimplemented inventory source type: ${InventorySourceType[action.source.type]}`
          );
          break;
        }

        case InventorySourceType.ContainerInventory: {
          // TODO: Implement validation for container inventory
          break;
        }

        // Handle dropping items into the world
        case InventorySourceType.WorldInteraction: {
          // Get the stack amount from the action
          const amount = action.newItem.stackSize ?? 1;

          // Get the player's inventory trait
          const inventory = player.getTrait(EntityInventoryTrait);

          // Get the item stack from the player's inventory
          const itemStack = inventory.container.getItem(
            action.slot
          ) as ItemStack;

          // Create a new PlayerDropItemSignal
          const signal = new PlayerDropItemSignal(
            player,
            itemStack,
            amount
          ).emit();

          // If the signal was canceled, we don't want to drop the item
          if (!signal) {
            // Update the item stack in the inventory
            itemStack.update();

            // Break from the switch statement
            break;
          }

          // Make the player drop the item
          player.dropItem(inventory.selectedSlot, amount, inventory.container);
          break;
        }
      }
    }
  }

  public handleItemUseTransaction(
    player: Player,
    transaction: ItemUseInventoryTransaction
  ): void {
    // Get the player's dimension
    const dimension = player.dimension;

    // Switch the transaction type
    switch (transaction.type) {
      // Handles placing items as blocks
      case ItemUseInventoryTransactionType.Place: {
        // Get the block that the transaction is initially interacting with
        const interacting = dimension.getBlock(transaction.blockPosition);

        // Check if the transaction is the initial action
        // If it isn't, we don't want to place a block
        if (!transaction.initialTransaction) {
          // Interact with the block at the position
          return void interacting.interact(
            player,
            transaction.initialTransaction
          );
        }

        // If the block is air, we can't place a block there
        if (interacting.isAir) return;

        // Make the player interact with the block
        if (!interacting.interact(player, transaction.initialTransaction))
          return;

        // Check if the interaction opened a container or if the player isn't using an item
        // If so, we skip the block placement
        if (player.openedContainer || !player.itemTarget) return;

        // Get the item stack from the player
        const stack = player.itemTarget as ItemStack;

        // Verify that the item stack network ids match
        if (stack.type.network !== transaction.item.network) return;

        // Check if a block type is present for the item stack
        const blockType = stack.type.block;
        if (!blockType || blockType.identifier === BlockIdentifier.Air) return;

        // Get the resulting block using the face provided by the transaction
        const result = interacting.face(transaction.face);
        const oldPermutation = result.getPermutation();

        // If the is's air, we can't place a block there
        if (!result.isAir) return;

        // Get the permutation to set the block state
        const permutation =
          blockType.permutations[stack.auxillary] ?? blockType.getPermutation();

        // Create a new PlayerPlaceBlockSignal
        const signal = new PlayerPlaceBlockSignal(
          result,
          player,
          permutation,
          transaction.face,
          transaction.clickPosition
        ).emit();

        // Check if the item stack has a block_data component
        if (stack.components.has("block_data")) {
          // Get the block data entry from the item stack
          const entry = stack.components.get("block_data") as BlockEntry;

          // Set the block data entry to the block
          result.loadDataEntry(result.getWorld(), entry);

          // Set the permutation of the block with the block data
          result.setPermutation(permutation, entry);
        } else {
          // Set the permutation of the block
          result.setPermutation(permutation);
        }

        // Call the block onPlace trait methods
        let placeCanceled = false;
        for (const trait of result.traits.values()) {
          // Get the click position from the transaction
          const clickPosition = transaction.clickPosition;

          // Check if the start break was successful
          const success = trait.onPlace?.(player, clickPosition);

          // If the result is undefined, continue
          // As the trait does not implement the method
          if (success === undefined) continue;

          // If the result is false, cancel the break
          placeCanceled = !success;
        }

        // Get the use method of the action & target block
        const method = ItemUseMethod.Place;
        const targetBlock = result;

        // Call the onUse method for the item stack
        const useSuccess =
          stack.use(player, { method, targetBlock }) &&
          new PlayerUseItemSignal(player, stack, method).emit();

        // Create a new LevelSoundEventPacket to play the block place sound
        const sound = new LevelSoundEventPacket();
        sound.event = LevelSoundEvent.Place;
        sound.position = BlockPosition.toVector3f(result.position);
        sound.data = result.permutation.network;
        sound.actorIdentifier = String();
        sound.isBabyMob = false;
        sound.isGlobal = false;

        // If the block placement was canceled, revert the block
        if (placeCanceled || !signal)
          return result.setPermutation(oldPermutation);
        else result.dimension.broadcast(sound);

        // If the item use was canceled, increment the stack
        // If not, decrement the stack
        if (!useSuccess) return stack.increment();
        else if (player.gamemode === Gamemode.Survival)
          return stack.decrement();
        break;
      }

      // Handles when an item is used
      case ItemUseInventoryTransactionType.Use: {
        // Get the players held item stack
        const stack = player.getHeldItem() as ItemStack;

        // Verify that the item stack network ids match
        if (stack.type.network !== transaction.item.network) return;

        // Get the use method of the action depending if there is an item target
        const method = player.itemTarget
          ? ItemUseMethod.Use
          : ItemUseMethod.Click;

        // Call the onUse method for the item stack
        stack.use(player, { method });

        // Create a new PlayerUseItemSignal
        new PlayerUseItemSignal(player, stack, method).emit();

        // Break from the switch statement
        break;
      }

      case ItemUseInventoryTransactionType.Destroy: {
        console.log("TODO: Implement destroy item use transaction");
      }
    }
  }

  public handleItemUseOnEntityTransaction(
    player: Player,
    transaction: ItemUseOnEntityInventoryTransaction
  ): void {
    // Get the dimension from the player
    const dimension = player.dimension;

    // Get the entity from the dimension using the runtime id
    const entity = dimension.getEntity(transaction.actorRuntimeId, true);

    // Return if the entity is not found
    if (!entity) return;

    // Get the entity interact method
    const method = transaction.type as unknown as EntityInteractMethod;

    // Call the onInteract method for the entity
    entity.interact(player, method);

    // Call the onUse method for the item stack
    if (player.getHeldItem()) {
      // Get the item stack from the player
      const stack = player.getHeldItem() as ItemStack;

      // Get the use method of the action
      const method =
        transaction.type === 0 ? ItemUseMethod.Place : ItemUseMethod.Use;

      // Call the onUse method for the item stack
      stack.use(player, { method, targetEntity: entity });

      // Create a new PlayerUseItemSignal
      new PlayerUseItemSignal(player, stack, method).emit();
    }
  }
}

export { InventoryTransactionHandler };
