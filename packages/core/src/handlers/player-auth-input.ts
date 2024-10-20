import {
  ActorFlag,
  BlockPosition,
  InputData,
  LevelEvent,
  LevelEventPacket,
  Packet,
  PlayerActionType,
  PlayerAuthInputPacket,
  PlayerBlockActionData,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { Player } from "../entity";
import { ItemUseMethod } from "../enums";

class PlayerAuthInputHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerAuthInput;

  public handle(packet: PlayerAuthInputPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Set the player's position
    player.position.x = packet.position.x;
    player.position.y = packet.position.y;
    player.position.z = packet.position.z;

    // Set the player's rotation
    player.rotation.pitch = packet.rotation.x;
    player.rotation.yaw = packet.rotation.y;
    player.rotation.headYaw = packet.headYaw;

    // Convert the player's position to a block position
    const position = player.position.floor();

    // Get the block permutation below the player
    // Getting the permutation rather than the block will reduce server load
    // As getting the block will construct a block instance, the permutation is already loaded
    const permutation = player.dimension.getPermutation({
      ...position,
      y: position.y - 2
    });

    // Update the player's onGround status
    player.onGround = permutation.type.solid;

    // Check if the packet contains block actions
    if (packet.blockActions)
      this.handleBlockActions(player, packet.blockActions.actions);

    // Handle the player's actions
    this.handleActorActions(player, packet.inputData.getFlags());
  }

  /**
   * Handles actor actions from the player
   * @param player The player that performed the actions
   * @param actions The actions performed by the player
   */
  public handleActorActions(player: Player, actions: Array<InputData>): void {
    // Iterate over the actions
    for (const action of actions) {
      // Handle the action
      switch (action) {
        // Handle when a player sneaks
        case InputData.StartSneaking:
        case InputData.StopSneaking: {
          // Get the sneaking flag from the player
          const sneaking = player.flags.get(ActorFlag.Sneaking) ?? false;

          // Set the sneaking flag based on the action
          player.flags.set(ActorFlag.Sneaking, !sneaking);
          break;
        }

        // Handle when a player sprints
        case InputData.StartSprinting:
        case InputData.StopSprinting: {
          // Get the sprinting flag from the player
          const sprinting = player.flags.get(ActorFlag.Sprinting) ?? false;

          // Set the sprinting flag based on the action
          player.flags.set(ActorFlag.Sprinting, !sprinting);
          break;
        }

        // Handle then a player swims
        case InputData.StartSwimming:
        case InputData.StopSwimming: {
          // Get the swimming flag from the player
          const swimming = player.flags.get(ActorFlag.Swimming) ?? false;

          // Set the swimming flag based on the action
          player.flags.set(ActorFlag.Swimming, !swimming);
          break;
        }

        // Handle when a player crawls
        case InputData.StartCrawling:
        case InputData.StopCrawling: {
          // Get the crawling flag from the player
          const crawling = player.flags.get(ActorFlag.Crawling) ?? false;

          // Set the crawling flag based on the action
          player.flags.set(ActorFlag.Crawling, !crawling);
          break;
        }

        // Handle when a player is gliding
        case InputData.StartGliding:
        case InputData.StopGliding: {
          // Get the gliding flag from the player
          const gliding = player.flags.get(ActorFlag.Gliding) ?? false;

          // Set the gliding flag based on the action
          player.flags.set(ActorFlag.Gliding, !gliding);
          break;
        }
      }
    }
  }

  /**
   * Handles block actions from the player
   * @param player The player that performed the block actions
   * @param actions The block actions performed by the player
   */
  public handleBlockActions(
    player: Player,
    actions: Array<PlayerBlockActionData>
  ): void {
    // Iterate over the actions
    for (const action of actions) {
      // Get the dimension from the player
      const dimension = player.dimension;

      // Switch on the action type
      switch (action.type) {
        case PlayerActionType.ContinueDestroyBlock:
        case PlayerActionType.StartDestroyBlock: {
          // Check if the player already has a block target
          if (player.blockTarget) {
            // Call the block onStopBreak trait methods
            // We will ignore the result of the method
            for (const trait of dimension
              .getBlock(player.blockTarget)
              .traits.values())
              trait.onStopBreak?.(player);

            // Create a new LevelEventPacket for the block break
            const packet = new LevelEventPacket();
            packet.event = LevelEvent.StopBlockCracking;
            packet.position = BlockPosition.toVector3f(player.blockTarget);
            packet.data = 0;

            // Broadcast the packet to the dimension
            dimension.broadcast(packet);

            // Reset the players block target
            player.blockTarget = null;
          }

          // Get the block from the action position
          const block = dimension.getBlock(action.position);

          // Call the block onStartBreak trait methods
          let canceled = false;
          for (const trait of block.traits.values()) {
            // Check if the start break was successful
            const success = trait.onStartBreak?.(player);

            // If the result is undefined, continue
            // As the trait does not implement the method
            if (success === undefined) continue;

            // If the result is false, cancel the break
            canceled = !success;
          }

          // If the break was canceled, skip the block break
          if (canceled) continue;

          // Set the players targeted block to the block
          player.blockTarget = block.position;

          // Get the players held item, and calculate the break time
          const heldItem = player.getHeldItem();
          const breakTime = block.getBreakTime(heldItem);

          // Create a new LevelEventPacket for the block break
          const packet = new LevelEventPacket();
          packet.event = LevelEvent.StartBlockCracking;
          packet.position = BlockPosition.toVector3f(block.position);
          packet.data = 65535 / breakTime;

          // Broadcast the packet to the dimension
          dimension.broadcast(packet);

          // Check if the player was holding an item
          if (heldItem) {
            // Call the item onStartUse trait methods
            let canceled = false;
            for (const trait of heldItem.traits.values()) {
              // Set the use method for the trait
              const method = ItemUseMethod.Break;

              // Check if the start use was successful
              const success = trait.onStartUse?.(player, { method });

              // If the result is undefined, continue
              // As the trait does not implement the method
              if (success === undefined) continue;

              // If the result is false, cancel the use
              canceled = !success;
            }

            // If the use was canceled, skip the item use
            if (canceled) continue;

            // Set the players item use time
            player.itemTarget = heldItem;
          }

          // Break out of the switch statement
          break;
        }

        case PlayerActionType.AbortDestroyBlock: {
          // Check if the player already has a block target
          if (player.blockTarget) {
            // Call the block onStopBreak trait methods
            // We will ignore the result of the method
            for (const trait of dimension
              .getBlock(player.blockTarget)
              .traits.values())
              trait.onStopBreak?.(player);

            // Create a new LevelEventPacket for the block break
            const packet = new LevelEventPacket();
            packet.event = LevelEvent.StopBlockCracking;
            packet.position = BlockPosition.toVector3f(player.blockTarget);
            packet.data = 0;

            // Broadcast the packet to the dimension
            dimension.broadcast(packet);

            // Reset the players block target
            player.blockTarget = null;
          }

          // Check if the player was holding an item
          if (player.itemTarget) {
            // Call the item onStopUse trait methods
            for (const trait of player.itemTarget.traits.values())
              trait.onStopUse?.(player, { method: ItemUseMethod.Break });

            // Reset the players item use time
            player.itemTarget = null;
          }

          // Break out of the switch statement
          break;
        }

        case PlayerActionType.PredictDestroyBlock: {
          // Get the block from the action position
          const block = dimension.getBlock(action.position);

          // Check if the player does not have a block target
          if (!player.blockTarget) {
            // Create a new UpdateBlockPacket for the block update
            const packet = new UpdateBlockPacket();
            packet.position = BlockPosition.toVector3f(block.position);
            packet.layer = UpdateBlockLayerType.Normal;
            packet.flags = UpdateBlockFlagsType.Network;
            packet.networkBlockId = block.permutation.network;

            // Send the packet to the player
            player.send(packet);
          } else {
            // Break the block
            const success = block.destroy(player);

            // If the block was not destroyed, update the block
            if (!success) {
              // Create a new UpdateBlockPacket for the block update
              const packet = new UpdateBlockPacket();
              packet.position = BlockPosition.toVector3f(block.position);
              packet.layer = UpdateBlockLayerType.Normal;
              packet.flags = UpdateBlockFlagsType.Network;
              packet.networkBlockId = block.permutation.network;

              // Send the packet to the player
              player.send(packet);
            }
          }
        }
      }
    }
  }
}

export { PlayerAuthInputHandler };
