import {
  AbilityIndex,
  ActorFlag,
  BlockPosition,
  CorrectPlayerMovePredictionPacket,
  Gamemode,
  InputData,
  ItemStackRequestActionMineBlock,
  ItemStackRequestActionType,
  ItemUseMethod,
  LevelEvent,
  LevelEventPacket,
  Packet,
  PlayerActionType,
  PlayerAuthInputPacket,
  PlayerBlockActionData,
  PredictionType,
  Rotation,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket,
  Vector3f
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { EntityMovementTrait, EntityRidingTrait, Player } from "../entity";
import {
  PlayerStartUsingItemSignal,
  PlayerStopUsingItemSignal,
  PlayerUseItemSignal
} from "../events";
import { TickSchedule } from "../world";

class PlayerAuthInputHandler extends NetworkHandler {
  public static readonly packet = Packet.PlayerAuthInput;

  /**
   * The pending schedules for the server-side block break.
   */
  private readonly schedules = new Map<bigint, TickSchedule>();

  /**
   * The set of players that should skip client prediction.
   */
  private readonly skipClientPrediction = new Set<bigint>();

  public handle(packet: PlayerAuthInputPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Update the player's input information
    player.inputInfo.tick = packet.inputTick;
    player.inputInfo.movementVector.x = packet.rawMoveVector.x;
    player.inputInfo.movementVector.y = packet.rawMoveVector.y;

    // Adjust the player's position based on the input data
    packet.position.y -= player.getCollisionHeight();

    // Validate the player's motion
    if (
      !this.validatePlayerMotion(player, packet.position, packet.positionDelta)
    ) {
      // Create a new CorrectPlayerMovePredictionPacket
      const rewind = new CorrectPlayerMovePredictionPacket();
      rewind.prediction = PredictionType.Player;
      rewind.position = player.position;
      rewind.velocity = new Vector3f(0, 0, 0);
      rewind.onGround = player.onGround;
      rewind.inputTick = packet.inputTick;

      // Adjust the rewind position based on the player's hitbox height
      rewind.position.y += player.getCollisionHeight();

      // Send the packet to the player
      return player.sendImmediate(rewind);
    }

    // Determine if the player is on the ground
    player.onGround =
      packet.inputData.hasFlag(InputData.VerticalCollision) &&
      !packet.inputData.hasFlag(InputData.Jumping);

    // Create a new Rotation object from the packet data
    const rotation = new Rotation(
      packet.rotation.y,
      packet.rotation.x,
      packet.headYaw
    );

    // Determine if the player is moving
    player.isMoving =
      packet.position.distance(player.position) !== 0 ||
      !player.rotation.equals(rotation);

    // Set the player's position
    player.position.set(packet.position);

    // Set the player's rotation
    player.rotation.set(rotation);

    // Check if the player is riding an entity
    if (player.hasTrait(EntityRidingTrait)) {
      // Get the riding trait from the player
      const riding = player.getTrait(EntityRidingTrait);

      // Check if the riding entity is valid
      if (!riding.entityRidingOn) return player.removeTrait(EntityRidingTrait);

      // Get the seat from the riding entity and check if it has a driver
      const seat = riding.getSeat();
      if (!seat || !seat.driver) return;

      // Get the movement trait from the entity
      const movement = riding.entityRidingOn.getTrait(EntityMovementTrait);

      // Get movement amount from input
      let forward = player.inputInfo.movementVector.y;
      let strafe = player.inputInfo.movementVector.x;

      // Normalize diagonal movement (optional but recommended)
      if (strafe !== 0 && forward !== 0) {
        const invSqrt2 = 1 / Math.sqrt(2); // ≈ 0.7071
        forward *= invSqrt2;
        strafe *= invSqrt2;
      }

      // Get movement speed
      const speed = movement.currentValue; // (this is blocks per second normally)

      // Calculate input motion vector
      const moveX = strafe * speed;
      const moveZ = forward * speed;

      // Get the head yaw in radians
      const headYawRad = (rotation.headYaw * Math.PI) / 180;

      // Rotate movement vector by head yaw
      const sinYaw = Math.sin(headYawRad);
      const cosYaw = Math.cos(headYawRad);

      // Calculate the new x and z components of the motion vector
      const vx = moveX * cosYaw - moveZ * sinYaw;
      const vz = moveZ * cosYaw + moveX * sinYaw;

      // Add motion to the entity based on the rotated vector
      riding.entityRidingOn.addMotion(new Vector3f(vx, 0, vz));
    }

    // Set the player device information
    player.clientSystemInfo.inputMode = packet.inputMode; // TODO: move this to input info
    player.clientSystemInfo.interactionMode = packet.interactionMode;
    player.clientSystemInfo.playMode = packet.playMode;

    // Check if the player is moving
    if (!player.isMoving) {
      // Reset the player's velocity
      player.velocity.x = 0;
      player.velocity.y = 0;
      player.velocity.z = 0;
    } else {
      // Set the player's velocity
      player.velocity.x = packet.positionDelta.x;
      player.velocity.y = packet.positionDelta.y + 0.07840000092983246; // The client has a constant gravity force, so we need to add it here
      player.velocity.z = packet.positionDelta.z;
    }

    // Check if the packet contains block actions
    if (packet.blockActions) {
      // Check if an item stack request was provided
      if (packet.itemStackRequest) {
        // Check if the actions include mining a block
        // If so, this indicates the player is using a tool to mine a block
        const action = packet.itemStackRequest.actions.find(
          (x) =>
            x.action === ItemStackRequestActionType.ScreenHUDMineBlock &&
            x.mineBlock
        );

        // If the player is mining a block, handle the block actions
        if (action)
          this.handleBlockActions(
            player,
            packet.blockActions.actions,
            action.mineBlock as ItemStackRequestActionMineBlock
          );
      } else {
        // Handle the block actions
        this.handleBlockActions(player, packet.blockActions.actions);
      }
    }

    // Handle the player's actions
    this.handleActorActions(player, packet.inputData.getFlags());
  }

  /**
   * Validates the player's motion
   * @param player The player to validate the motion for
   * @param position The new position of the player
   * @param delta The delta position of the player
   * @returns True if the player's motion is valid, false otherwise
   */
  public validatePlayerMotion(
    player: Player,
    position: Vector3f,
    delta: Vector3f
  ): boolean {
    // Get the player's movement validation properties
    const { movementValidation, movementRewindThreshold } =
      this.serenity.properties;

    // Check if the movement validation is disabled
    if (!movementValidation) return true;

    // Check if the player is in creative mode or spectator mode
    if (player.gamemode === Gamemode.Creative) return true;
    if (player.gamemode === Gamemode.Spectator) return true;

    // Check if the player is flying, if so the movement is valid.
    if (player.abilities.get(AbilityIndex.Flying)) return true;

    // Check if the delta x is greater than the movement threshold
    if (Math.abs(delta.x) >= movementRewindThreshold) return false;

    // Check if the delta y is greater than the movement threshold
    if (delta.y >= movementRewindThreshold)
      return false; // Return false, as the player is moving up
    // Check if the delta y is less than the movement threshold
    else if (delta.y <= -movementRewindThreshold * 1.25) {
      // Check if the player is falling, if so the movement is valid
      if (player.isFalling) return true;

      // If the player is not falling, return false
      return false;
    }

    // Check if the delta z is greater than the movement threshold
    if (Math.abs(delta.z) >= movementRewindThreshold) return false;

    // Check if the player has teleported
    if (player.position.distance(position) >= 4) return false;

    // Return true, as the movement is valid
    return true;
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

          // Check if the player is already sneaking
          if (sneaking === true) {
            // Signal the player to stop sneaking
            for (const trait of player.traits.values())
              trait.onStopSneaking?.();
          } else {
            // Signal the player to start sneaking
            for (const trait of player.traits.values())
              trait.onStartSneaking?.();
          }

          // Set the sneaking flag based on the action
          player.flags.set(ActorFlag.Sneaking, !sneaking);
          break;
        }

        // Handle when a player sprints
        case InputData.StartSprinting:
        case InputData.StopSprinting: {
          // Get the sprinting flag from the player
          const sprinting = player.flags.get(ActorFlag.Sprinting) ?? false;

          // Check if the player is already sprinting
          if (sprinting === true) {
            // Signal the player to stop sprinting
            for (const trait of player.traits.values())
              trait.onStopSprinting?.();
          } else {
            // Signal the player to start sprinting
            for (const trait of player.traits.values())
              trait.onStartSprinting?.();
          }

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

        case InputData.StartFlying:
        case InputData.StopFlying: {
          // Get the flying ability from the player
          const flying = player.abilities.get(AbilityIndex.Flying) ?? false;
          const mayFly = player.abilities.get(AbilityIndex.MayFly) ?? false;

          // Check if the player is not allowed to fly
          // This stops the Horion fly exploit
          if (!flying && !mayFly) {
            // Disable flying if the player does not have the may fly ability
            player.abilities.set(AbilityIndex.Flying, false);
          } else {
            // Set the flying ability based on the action
            player.abilities.set(AbilityIndex.Flying, !flying);
          }
          break;
        }

        case InputData.StartJumping: {
          // Signal the player to jump
          for (const trait of player.traits.values()) trait.onJump?.();
          break;
        }

        // Handle when a player starts using an item. (Eating, drinking, etc.)
        case InputData.StartUsingItem: {
          // Set the item target for the player
          player.itemTarget = player.getHeldItem();

          // Check if the target item is not null
          if (player.itemTarget)
            // Call the item onStartUse trait methods
            for (const trait of player.itemTarget.traits.values())
              trait.onStartUse?.(player, { method: ItemUseMethod.UseTool });
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
    actions: Array<PlayerBlockActionData>,
    request?: ItemStackRequestActionMineBlock
  ): void {
    // Iterate over the actions
    for (const action of actions) {
      // Get the dimension from the player
      const dimension = player.dimension;

      // Switch on the action type
      switch (action.type) {
        // Log unimplemented actions
        default: {
          this.serenity.logger.debug(
            `PlayerAuthInputHandler: Unimplemented block action: ${PlayerActionType[action.type]}`
          );
          break;
        }

        case PlayerActionType.ContinueDestroyBlock:
        case PlayerActionType.StartDestroyBlock: {
          // Check if the player is in creative mode
          // If so, skip the block break
          if (player.gamemode === Gamemode.Creative) continue;

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

          // Check if the block is air, if so, the client has a ghost block
          if (block.isAir) {
            // Get the block permutation from the dimension
            const permutation = block.permutation;

            // Update the block permutation to the client
            const packet = new UpdateBlockPacket();
            packet.position = BlockPosition.toVector3f(block.position);
            packet.layer = UpdateBlockLayerType.Normal;
            packet.flags = UpdateBlockFlagsType.Network;
            packet.networkBlockId = permutation.networkId;

            // Send the packet to the player
            player.send(packet);
            continue;
          }

          // Call the block onStartBreak trait methods
          let canceled = false;
          for (const [, trait] of block.traits) {
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

          // Check if a schedule already exists for the player
          if (this.schedules.has(player.uniqueId)) {
            // Get the schedule from the dimension
            const schedule = this.schedules.get(player.uniqueId)!;

            // Cancel the schedule
            schedule.cancel();

            // Remove the schedule from the map
            this.schedules.delete(player.uniqueId);
          }

          // Check if the break time is valid
          if (breakTime > 0 && breakTime < 9999) {
            // Create a new schedule for the player
            const schedule = dimension.schedule(breakTime);

            // Wait for the schedule to finish
            schedule.on(() => {
              // Delete the schedule from the map
              this.schedules.delete(player.uniqueId);

              // Check if the player does not have a block target
              // And if the player is not in creative mode; also check if the signal was canceled
              if (
                player.blockTarget !== block.position &&
                player.gamemode !== Gamemode.Creative
              ) {
                // Create a new UpdateBlockPacket for the block update
                const packet = new UpdateBlockPacket();
                packet.position = BlockPosition.toVector3f(block.position);
                packet.layer = UpdateBlockLayerType.Normal;
                packet.flags = UpdateBlockFlagsType.Network;
                packet.networkBlockId = block.permutation.networkId;

                // Send the packet to the player
                return player.send(packet);
              } else {
                // Attempt to break the block
                const success = block.destroy({
                  origin: player,
                  dropLoot: true
                });

                // Check if the block was not destroyed
                if (!success) {
                  // Create a new UpdateBlockPacket for the block update
                  const packet = new UpdateBlockPacket();
                  packet.position = BlockPosition.toVector3f(block.position);
                  packet.layer = UpdateBlockLayerType.Normal;
                  packet.flags = UpdateBlockFlagsType.Network;
                  packet.networkBlockId = block.permutation.networkId;

                  // Add the player to the skip client prediction set
                  this.skipClientPrediction.add(player.uniqueId);

                  // Send the packet to the player
                  return player.send(packet);
                }
              }
            });

            // Add the schedule to the map
            this.schedules.set(player.uniqueId, schedule);
          }

          // Check if the player was holding an item
          if (heldItem) {
            // Set the use method for the trait
            const method = ItemUseMethod.UseTool;

            // Create a new PlayerStartUsingItemSignal
            let canceled = !new PlayerStartUsingItemSignal(
              player,
              heldItem,
              method
            ).emit();

            // Call the item onStartUse trait methods
            for (const [, trait] of heldItem.traits) {
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
            // Get the block from the players block target
            const block = dimension.getBlock(player.blockTarget);

            // Call the block onStopBreak trait methods
            // We will ignore the result of the method
            for (const [, trait] of block.traits) trait.onStopBreak?.(player);

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

          // Check if the player has a schedule
          if (this.schedules.has(player.uniqueId)) {
            // Get the schedule from the dimension
            const schedule = this.schedules.get(player.uniqueId)!;

            // Cancel the schedule
            schedule.cancel();

            // Remove the schedule from the map
            this.schedules.delete(player.uniqueId);
          }

          // Check if the player was holding an item
          if (player.itemTarget) {
            // Create a new PlayerStopUsingItemSignal
            new PlayerStopUsingItemSignal(player, player.itemTarget).emit();

            // Call the item onStopUse trait methods
            for (const trait of player.itemTarget.traits.values())
              trait.onStopUse?.(player, { method: ItemUseMethod.UseTool });

            // Reset the players item use time
            player.itemTarget = null;
          }

          // Break out of the switch statement
          break;
        }

        case PlayerActionType.PredictDestroyBlock: {
          // Get the block from the action position
          const block = dimension.getBlock(action.position);

          // Create a new LevelEventPacket for the block break
          const packet = new LevelEventPacket();
          packet.event = LevelEvent.StopBlockCracking;
          packet.position = BlockPosition.toVector3f(block.position);
          packet.data = 0;

          // Broadcast the packet to the dimension
          dimension.broadcast(packet);

          // Check if the client prediction should be skipped
          if (this.skipClientPrediction.has(player.uniqueId)) {
            // Remove the player from the skip client prediction set
            this.skipClientPrediction.delete(player.uniqueId);

            // Create a new update block packet for the block update
            const packet = new UpdateBlockPacket();
            packet.position = BlockPosition.toVector3f(block.position);
            packet.layer = UpdateBlockLayerType.Normal;
            packet.flags = UpdateBlockFlagsType.Network;
            packet.networkBlockId = block.permutation.networkId;

            // Send the packet to the player
            return player.send(packet);
          }

          // Check if there is a pending server-side break schedule
          if (this.schedules.has(player.uniqueId)) {
            // Get the schedule from the dimension
            const schedule = this.schedules.get(player.uniqueId)!;

            // Cancel the schedule
            schedule.cancel();

            // Remove the schedule from the map
            this.schedules.delete(player.uniqueId);
          }

          // Check if the player does not have a block target
          // And if the player is not in creative mode; also check if the signal was canceled
          if (!player.blockTarget && player.gamemode !== Gamemode.Creative) {
            // Create a new UpdateBlockPacket for the block update
            const packet = new UpdateBlockPacket();
            packet.position = BlockPosition.toVector3f(block.position);
            packet.layer = UpdateBlockLayerType.Normal;
            packet.flags = UpdateBlockFlagsType.Network;
            packet.networkBlockId = block.permutation.networkId;

            // Send the packet to the player
            return player.send(packet);
          } else {
            // Break the block based on the signal drop loot flag
            const success = block.destroy({
              origin: player,
              dropLoot: true
            });

            // If the block was not destroyed, update the block
            if (!success) {
              // Create a new UpdateBlockPacket for the block update
              const packet = new UpdateBlockPacket();
              packet.position = BlockPosition.toVector3f(block.position);
              packet.layer = UpdateBlockLayerType.Normal;
              packet.flags = UpdateBlockFlagsType.Network;
              packet.networkBlockId = block.permutation.networkId;

              // Send the packet to the player
              return player.send(packet);
            }
          }

          // Check if a mine block request was provided
          // If not, skip the block break
          if (!request || !player.itemTarget) continue;

          // Get the item stack from the player
          const stack = player.itemTarget;

          // Set the use method for the trait, predicted durability, and target block
          const method = ItemUseMethod.UseTool;
          const predictedDurability = request.predictedDurability;
          const _targetBlock = block;

          // Check if the predicted durability will equal the item stack durability
          stack.use(player, { method, predictedDurability });

          // Create a new PlayerUseItemSignal
          new PlayerUseItemSignal(player, stack, method).emit();

          // Break out of the switch statement
          continue;
        }
      }
    }
  }
}

export { PlayerAuthInputHandler };
