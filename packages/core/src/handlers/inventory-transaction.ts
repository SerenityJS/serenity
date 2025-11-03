import {
  BlockPosition,
  ComplexInventoryTransaction,
  Gamemode,
  InventoryAction,
  InventorySourceType,
  InventoryTransactionPacket,
  ItemUseInventoryTransaction,
  ItemUseInventoryTransactionType,
  ItemUseMethod,
  ItemUseOnEntityInventoryTransaction,
  LevelSoundEvent,
  LevelSoundEventPacket,
  Packet,
  PredictedResult,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait, Player } from "../entity";
import { ItemStack, ItemStackUseOnBlockOptions } from "../item";
import { BlockIdentifier, EntityInteractMethod } from "../enums";
import { PlayerPlaceBlockSignal } from "../events";
import { BlockPlacementOptions } from "../types";
import { BlockLevelStorage } from "..";

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
          for (const trait of player.itemTarget.getAllTraits())
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

    // Get the block palette from the dimension
    const blockPalette = dimension.world.blockPalette;

    // Switch the transaction type
    switch (transaction.type) {
      // Handles placing items as blocks
      case ItemUseInventoryTransactionType.Place: {
        // Get the block that the transaction is initially interacting with
        const interacting = dimension.getBlock(transaction.blockPosition);

        // Get the block that will be updated based on the transaction
        let resultant = interacting.face(transaction.face);

        // If the interacting block is air, we don't want to place a block
        if (interacting.isAir) {
          // To prevent ghost blocks from acuring, we send an update block packet to the source of the transaction
          // Create a new UpdateBlockPacket to revert the block state to the source
          const packet = new UpdateBlockPacket();

          // Get the air block from the block palette
          const air = blockPalette.resolvePermutation(BlockIdentifier.Air);

          // Assign the block position, network block id, layer, and flags
          packet.position = interacting.position;
          packet.networkBlockId = air.networkId;
          packet.layer = UpdateBlockLayerType.Normal;
          packet.flags = UpdateBlockFlagsType.Network;

          // Send the packet to the player
          return player.send(packet);
        } else if (interacting.type.hasTag("plant")) {
          // Set the resultant block to the interacting block
          resultant = interacting;
        }

        // Get the held item stack from the player
        const stack = player.getHeldItem();

        // Prepare a flag to determine if the item stack is a block placer
        let placingBlock = true;

        // Get the block placer from the item type
        const blockPlacer = stack?.type.components.getBlockPlacer();

        // Determine if the item stack is a block placer
        if (blockPalette) {
          // Get the block type from the block placer
          const blockType = blockPlacer?.getBlockType();

          // Check if the block type exists and is not air
          if (!blockType || blockType.identifier === BlockIdentifier.Air)
            placingBlock = false;
        }

        // Interact with the block
        const results = interacting.interact({
          origin: player,
          clickedPosition: transaction.clickPosition,
          clickedFace: transaction.face,
          placingBlock
        });

        // Check if the interaction was canceled and the player is placing a block
        if (results.cancel || player.openedContainer) {
          // Update the item stack to reflect the interaction
          if (stack) stack.container?.updateSlot(stack.getSlot());

          // Create a new UpdateBlockPacket to revert the block state
          const packet = new UpdateBlockPacket();
          packet.position = resultant.position;
          packet.networkBlockId = resultant.permutation.networkId;
          packet.layer = UpdateBlockLayerType.Normal;
          packet.flags = UpdateBlockFlagsType.Network;

          // Send the packet to the player
          return player.send(packet);
        }

        // Check if the client prediction failed to place the block
        if (transaction.clientPrediction === PredictedResult.Failure) {
          // Verify that the item stack exists
          if (!stack) return;

          // Verify that the item stack network ids match
          if (stack.type.network !== transaction.item.network) return;

          // Trigger the useOnBlock method for the item stack
          return void stack.useOnBlock(player, {
            method: ItemUseMethod.Interact,
            targetBlock: interacting,
            clickPosition: transaction.clickPosition,
            face: transaction.face
          });
        } else {
          // Get the item stack from the player & the previous block permutation
          const stack = player.getHeldItem() as ItemStack;
          const previousPermutation = resultant.permutation;

          // Check if the item stack exists
          if (!stack) return;

          // Verify that the item stack network ids match
          if (stack.type.network !== transaction.item.network) return;

          // Check if a block type is present for the item stack
          const blockType = stack.components.getBlockPlacer().getBlockType();

          // Create the item use options for placing the block
          const useOptions: ItemStackUseOnBlockOptions = {
            canceled: false,
            method: ItemUseMethod.Place,
            targetBlock: interacting,
            clickPosition: transaction.clickPosition,
            face: transaction.face,
            placingBlock: blockType
          };

          // Call the useOnBlock method for the item stack
          const useSuccess = stack.useOnBlock(player, useOptions);

          // If the item use was canceled, increment the stack
          if (!useSuccess || useOptions.canceled || !useOptions.placingBlock) {
            // Set the previous permutation of the resultant block
            resultant.setPermutation(previousPermutation);

            // Increment the stack count
            return stack.incrementStack();
          }
          // Check if the player is in survival mode
          // If so, decrement the stack
          else if (player.getGamemode() === Gamemode.Survival)
            stack.decrementStack();

          // Check if the block type exists and is not air
          if (useOptions.placingBlock.identifier === BlockIdentifier.Air)
            return; // If so, we skip the block placement

          // Get the permutation to set the block state
          const permutation =
            useOptions.placingBlock.permutations[stack.getAuxiliaryValue()] ??
            useOptions.placingBlock.getPermutation();

          // Create a new BlockPlacementOptions object
          const options: BlockPlacementOptions = {
            cancel: false,
            permutation,
            origin: player,
            clickedPosition: transaction.clickPosition,
            clickedFace: transaction.face
          };

          // Create a new PlayerPlaceBlockSignal
          const signal = new PlayerPlaceBlockSignal(
            resultant,
            player,
            permutation,
            transaction.face,
            transaction.clickPosition
          );

          // Emit the signal
          options.cancel = !signal.emit();

          // Check if the item stack has block nbt property
          if (stack.nbt.has("Block")) {
            // Get the block level storage from the item stack
            const storage = new BlockLevelStorage(
              resultant.getChunk(), // The chunk the block is in
              stack.nbt.get<CompoundTag>("Block")! // The block nbt data from the item stack
            );

            // Set the permutation of the block with the storage
            resultant.setPermutation(permutation, storage);
          } else {
            // Set the permutation of the block
            resultant.setPermutation(permutation);
          }

          // Call the block onPlace trait methods
          for (const trait of resultant.getAllTraits()) {
            // Check if the start break was successful
            const success = trait.onPlace?.(options);

            // If the result is undefined, continue
            // As the trait does not implement the method
            if (success === undefined) continue;

            // If the result is false, cancel the break
            options.cancel = !success;
          }

          // Create a new LevelSoundEventPacket to play the block place sound
          const sound = new LevelSoundEventPacket();
          sound.event = LevelSoundEvent.Place;
          sound.position = BlockPosition.toVector3f(resultant.position);
          sound.data = resultant.permutation.networkId;
          sound.actorIdentifier = String();
          sound.isBabyMob = false;
          sound.isGlobal = false;
          sound.uniqueActorId = -1n;

          // Check if the block placement was canceled, revert the block
          if (options.cancel) {
            // Increment the item stack
            stack.incrementStack();

            // Revert the block to its previous state
            return resultant.setPermutation(previousPermutation);
          } else return resultant.dimension.broadcast(sound); // If not, broadcast the sound
        }
      }

      // Handles when an item is used
      case ItemUseInventoryTransactionType.Use: {
        // Get the players held item stack
        const stack = player.getHeldItem() as ItemStack;

        // Verify that the item stack exists
        if (!stack) return;

        // Verify that the item stack network ids match
        if (stack.type.network !== transaction.item.network) return;

        // Determine the item use method
        // If the player has started the use of an item, we don't know the method. The method will be determined by an external trait.
        // If the player does not have an item target, the method is an interact.
        let method: ItemUseMethod = ItemUseMethod.Interact;

        // Check if the player has an item target
        if (player.itemTarget) {
          // Get the item target from the player
          const type = player.itemTarget.type;

          // Check if the item target has a block placer
          if (type.components.hasBlockPlacer()) {
            // Get the block placer from the item target
            const blockPlacer = type.components.getBlockPlacer();

            // Get the block type from the block placer
            const blockType = blockPlacer.getBlockType();

            // Check if the block type exists and is not air
            if (!blockType.air) method = ItemUseMethod.Place;
          }

          // Clear the player's item target
          player.itemTarget = null;
        }

        // Call the onUse method for the item stack
        return void stack.use(player, { method });
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
        transaction.type === 0 ? ItemUseMethod.Interact : ItemUseMethod.Attack;

      // Call the useOnEntity method for the item stack
      return void stack.useOnEntity(player, {
        method,
        targetEntity: entity
      });
    }
  }
}

export { InventoryTransactionHandler };
