import {
  ActorFlag,
  BlockFace,
  ComplexInventoryTransaction,
  Gamemode,
  InventoryAction,
  InventorySourceType,
  InventoryTransactionPacket,
  ItemUseInventoryTransaction,
  ItemUseInventoryTransactionType,
  ItemUseMethod,
  ItemUseOnEntityInventoryTransaction,
  ItemUseOnEntityInventoryTransactionType,
  LevelSoundEvent,
  Packet,
  PredictedResult,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binarystream";

import { NetworkHandler } from "../network";
import { EntityInventoryTrait, Player } from "../entity";
import { ItemStack, ItemStackUseOnBlockOptions } from "../item";
import { BlockIdentifier, EntityInteractMethod } from "../enums";
import { PlayerPlaceBlockSignal, PlayerStopUsingItemSignal } from "../events";
import { BlockPlacementOptions } from "../types";
import {
  Block,
  BlockChestTrait,
  BlockLevelStorage,
  BlockPalette,
  BlockPermutation,
  BlockType
} from "..";
import { ItemPlacedBlocks } from "../constants/block-items";

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
        if (player.itemTarget) {
          // Create a new PlayerStopUsingItemSignal
          new PlayerStopUsingItemSignal(player, player.itemTarget).emit();

          // Unset the UsingItem actor flag
          player.flags.setActorFlag(ActorFlag.UsingItem, false);

          // Call the onRelease method for the item stack traits
          for (const trait of player.itemTarget.getAllTraits())
            trait.onStopUse?.(player, { method: ItemUseMethod.Unknown });
        }

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
        } else if (interacting.isReplaceable && !interacting.isLiquid) {
          // A block placed against one like short grass takes its place, rather than going beside it
          resultant = interacting;
        }

        // Get the held item stack from the player
        const stack = player.getHeldItem();

        // Determine if the item stack places a block
        const placingBlock = stack
          ? this.getPlacedBlockType(stack, blockPalette) !== null
          : false;

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
          if (stack) stack.container?.update();

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
        if (
          !results.placingBlock || // If not placing a block, we use the item on the block
          transaction.clientPrediction === PredictedResult.Failure
        ) {
          // Verify that the item stack exists
          if (!stack) return;

          // Check if the client may have placed the block it holds, which the server did not
          if (placingBlock) {
            // Create a new UpdateBlockPacket to show the client what is really in the space
            const packet = new UpdateBlockPacket();
            packet.position = resultant.position;
            packet.networkBlockId = resultant.permutation.networkId;
            packet.layer = UpdateBlockLayerType.Normal;
            packet.flags = UpdateBlockFlagsType.Network;
            player.send(packet);

            // Resync the inventory slot to the client to correct the predicted stack count
            if (stack.container) stack.container.update();
          }

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
          // Get the item stack from the player
          const stack = player.getHeldItem() as ItemStack;

          // Check if the item stack exists
          if (!stack) return;

          // Verify that the item stack network ids match
          if (stack.type.network !== transaction.item.network) return;

          // Get the block type the item stack places
          const blockType =
            this.getPlacedBlockType(stack, blockPalette) ??
            stack.components.getBlockPlacer().getBlockType();

          // A slab placed onto the open half of the same slab, or into a space holding one, makes a double slab
          const slab = this.getDoubleSlab(
            blockType,
            interacting,
            resultant,
            transaction.face
          );
          if (slab) resultant = slab.block;

          // Get the previous block permutation
          const previousPermutation = resultant.permutation;

          // Check if the block can go in the space, as it only takes the place of blocks like air and short grass
          if (!slab && !resultant.isReplaceable) {
            // Create a new UpdateBlockPacket to revert the block for the player
            const packet = new UpdateBlockPacket();
            packet.position = resultant.position;
            packet.networkBlockId = previousPermutation.networkId;
            packet.layer = UpdateBlockLayerType.Normal;
            packet.flags = UpdateBlockFlagsType.Network;
            player.send(packet);

            // Resync the inventory slot to the client to correct the predicted stack count
            if (stack.container) stack.container.update();

            return;
          }

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

          // If the item use was canceled, revert the block and resync the inventory
          if (!useSuccess || useOptions.canceled || !useOptions.placingBlock) {
            // Set the previous permutation of the resultant block§+_
            resultant.setPermutation(previousPermutation);

            // Resync the inventory slot to the client to correct the predicted stack count
            if (stack.container) stack.container.update();

            return;
          }
          // Check if the block type exists and is not air
          if (useOptions.placingBlock.identifier === BlockIdentifier.Air)
            return; // If so, we skip the block placement

          // Get the permutation to set the block state
          const permutation =
            slab?.permutation ??
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
            transaction.clickPosition,
            stack
          );

          // Emit the signal
          options.cancel = !signal.emit();

          // Place the block, holding its block updates until its traits have set its state,
          // so players see it in the state it is placed in rather than the states before
          dimension.holdBlockUpdates(resultant.position, () => {
            // Check if the item stack has block nbt property
            if (stack.nbt.has("Block")) {
              // Copy the block nbt data from the item stack, so the block does not share it with the item
              const stream = new BinaryStream();
              CompoundTag.write(stream, stack.nbt.get<CompoundTag>("Block")!);
              const data = CompoundTag.read(
                new BinaryStream(stream.getBuffer())
              );

              // Create the block level storage from the data, at the position of the block
              const storage = new BlockLevelStorage(resultant.getChunk(), data);
              storage.setPosition(resultant.position);

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

            // Revert the block to its previous state if the placement was canceled
            if (options.cancel) resultant.setPermutation(previousPermutation);
          });

          // Check if the block placement was canceled
          if (options.cancel) {
            // Resync the inventory slot to the client to correct the predicted stack count
            if (stack.container) stack.container.update();

            return;
          } else {
            if (resultant.hasTrait(BlockChestTrait)) {
              resultant.getTrait(BlockChestTrait).pair();
            }

            // Send the data of the placed block to the players, now that they have the block itself
            resultant.sendStorageUpdate();

            // Decrement the stack if the player is in survival mode
            // This is done AFTER th e onPlace check to avoid losing items on canceled placements
            if (player.getGamemode() === Gamemode.Survival)
              stack.decrementStack();

            // Play the sound of the block being placed
            return resultant.playSound(LevelSoundEvent.Place);
          }
        }
      }

      // Handles when an item is used
      case ItemUseInventoryTransactionType.Use: {
        const interacting = dimension.getBlock(transaction.blockPosition);

        const results = interacting.interact({
          origin: player,
          clickedPosition: transaction.clickPosition,
          clickedFace: transaction.face,
          placingBlock: false
        });

        if (results.cancel || player.openedContainer) {
          return;
        }

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
    const method =
      transaction.type === ItemUseOnEntityInventoryTransactionType.Interact
        ? EntityInteractMethod.Interact
        : EntityInteractMethod.Attack;

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

  /**
   * Gets the block type an item stack places: the block its type names, or,
   * for items that place a block of another name, like signs and seeds, that block.
   * @param stack The item stack.
   * @param palette The block palette of the world.
   * @returns The block type the item stack places, or null if it places none.
   */
  public getPlacedBlockType(
    stack: ItemStack,
    palette: BlockPalette
  ): BlockType | null {
    // Check if the item type names the block it places
    const type = stack.type.components.getBlockPlacer().getBlockType();
    if (!type.air) return type;

    // Check if the item places a block of another name
    const identifier = ItemPlacedBlocks[stack.type.identifier];
    return identifier ? (palette.types.get(identifier) ?? null) : null;
  }

  /**
   * Gets the double slab a placed slab makes with another of its kind:
   * the slab it was placed onto the open half of, or the slab in the space it was placed into.
   * @param type The block type being placed.
   * @param interacting The block the slab was placed against.
   * @param resultant The block in the space the slab was placed into.
   * @param face The face of the block the slab was placed against.
   * @returns The block that becomes a double slab, and the permutation of the double slab; or null if there is none.
   */
  public getDoubleSlab(
    type: BlockType,
    interacting: Block,
    resultant: Block,
    face: BlockFace
  ): { block: Block; permutation: BlockPermutation } | null {
    // Check if the block type is a slab, rather than a double slab or another block
    const identifier = type.identifier;
    if (!identifier.endsWith("_slab") || identifier.includes("double"))
      return null;

    // Prepare the slab that becomes a double slab
    let block: Block | null = null;

    // Check if the slab was placed onto the open half of the same slab
    if (interacting.type === type) {
      // Get the open face of the slab, which is its top unless it is a top slab
      const top =
        interacting.getState<string>("minecraft:vertical_half") === "top";
      if (face === (top ? BlockFace.Bottom : BlockFace.Top))
        block = interacting;
    }

    // Check if the slab was placed into a space holding the same slab
    if (!block && resultant.type === type) block = resultant;
    if (!block) return null;

    // Get the double slab of the slab; copper slabs put "double" first
    const double = block.world.blockPalette.types.get(
      identifier.endsWith("cut_copper_slab")
        ? identifier.replace("cut_copper_slab", "double_cut_copper_slab")
        : identifier.replace(/_slab$/, "_double_slab")
    );
    if (!double) return null;

    // The double slab keeps the half of the slab it was made from
    const permutation = double.getPermutation({
      "minecraft:vertical_half": block.getState<string>(
        "minecraft:vertical_half"
      )
    });

    // Return the slab and the permutation of the double slab
    return { block, permutation };
  }
}

export { InventoryTransactionHandler };
