import {
  BlockPosition,
  ComplexInventoryTransaction,
  Gamemode,
  InventoryAction,
  InventorySourceType,
  InventoryTransactionPacket,
  ItemUseInventoryTransaction,
  ItemUseInventoryTransactionType,
  LevelSoundEvent,
  LevelSoundEventPacket,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait, Player } from "../entity";
import { ItemStack } from "../item";
import { BlockIdentifier, ItemUseMethod } from "../enums";

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

        // Handle dropping items into the world
        case InventorySourceType.WorldInteraction: {
          // Get the stack amount from the action
          const amount = action.newItem.stackSize ?? 1;

          // Get the player's inventory trait
          const inventory = player.getTrait(EntityInventoryTrait);

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
        // Check if the transaction is the initial action
        // If it isn't, we don't want to place a block
        if (!transaction.initialTransaction) return;

        // Get the block that the transaction is initially interacting with
        const interacting = dimension.getBlock(transaction.blockPosition);

        // If the block is air, we can't place a block there
        if (interacting.isAir()) return;

        // Make the player interact with the block
        interacting.interact(player);

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
        if (!result.isAir()) return;

        // Get the permutation to set the block state
        const permutation = blockType.permutations[stack.auxillary];

        // Set the permutation of the block
        result.setPermutation(permutation ?? blockType.getPermutation());

        // Call the block onPlace trait methods
        let placeCanceled = false;
        for (const trait of result.traits.values()) {
          // Check if the start break was successful
          const success = trait.onPlace?.(player);

          // If the result is undefined, continue
          // As the trait does not implement the method
          if (success === undefined) continue;

          // If the result is false, cancel the break
          placeCanceled = !success;
        }

        // Call the onUse method for the item stack
        let useCanceled = false;
        for (const trait of stack.traits.values()) {
          // Get the use method of the action & target block
          const method = ItemUseMethod.Place;
          const targetBlock = result;

          // Check if the start break was successful
          const success = trait.onUse?.(player, { method, targetBlock });

          // If the result is undefined, continue
          // As the trait does not implement the method
          if (success === undefined) continue;

          // If the result is false, cancel the break
          useCanceled = !success;
        }

        // Create a new LevelSoundEventPacket to play the block place sound
        const sound = new LevelSoundEventPacket();
        sound.event = LevelSoundEvent.Place;
        sound.position = BlockPosition.toVector3f(result.position);
        sound.data = result.permutation.network;
        sound.actorIdentifier = String();
        sound.isBabyMob = false;
        sound.isGlobal = false;

        // If the block placement was canceled, revert the block
        if (placeCanceled) return result.setPermutation(oldPermutation);
        else result.dimension.broadcast(sound);

        // If the item use was canceled, increment the stack
        // If not, decrement the stack
        if (useCanceled) return stack.increment();
        else if (player.gamemode === Gamemode.Survival)
          return stack.decrement();
        break;
      }

      // Handles when an item is used
      case ItemUseInventoryTransactionType.Use: {
        // Check if the player is using an item
        if (!player.itemTarget) return;

        // Get the item stack from the player
        const stack = player.itemTarget as ItemStack;

        // Verify that the item stack network ids match
        if (stack.type.network !== transaction.item.network) return;

        // Call the onUse method for the item stack
        for (const trait of stack.traits.values()) {
          // Get the use method of the action
          const method = ItemUseMethod.Use;

          // Call the onUse method for the item stack
          trait.onUse?.(player, { method });
        }
      }
    }
  }
}

export { InventoryTransactionHandler };
