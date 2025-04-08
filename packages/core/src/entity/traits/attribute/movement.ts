import {
  AttributeName,
  BlockPosition,
  MoveActorDeltaPacket,
  MoveDeltaFlags,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { PlayerEntityRenderingTrait } from "../player";

import { EntityAttributeTrait } from "./attribute";

class EntityMovementTrait extends EntityAttributeTrait {
  public static readonly identifier = "movement";
  public static readonly types = [EntityIdentifier.Player];
  public static readonly components = ["minecraft:movement"];

  public readonly attribute = AttributeName.Movement;

  /**
   * The position that the entity is targeting to move to.
   */
  public positionTarget: Vector3f | null = null;

  public onAdd(): void {
    // Call the super method
    super.onAdd({
      minimumValue: 0,
      maximumValue: 3.402_823_466e+38,
      defaultValue: 0.1,
      currentValue: 0.1
    });
  }

  public onTick(): void {
    if (this.positionTarget !== null) {
      // Calculate the distance to the target position
      // TODO: The position operation should use the bigger position sign
      // TODO: We should refactor Y so its at foot level and not at head level?
      const distance = this.positionTarget
        .floor()
        .distance(this.entity.position.floor().subtract(new Vector3f(0, 1, 0)));

      // Check if the entity has reached the target position
      if (distance < 0.5) {
        this.positionTarget = null;
        return;
      }

      this.entity.isMoving = true;

      // Move the entity towards the target position
      this.moveTowards(this.positionTarget);
    }

    // Check if the entity is not moving, and if the entity is not a player
    if (!this.entity.isMoving) return;

    // Create a new MoveActorDeltaPacket
    const packet = new MoveActorDeltaPacket();

    // Assign the packet properties
    packet.runtimeId = this.entity.runtimeId;
    packet.flags = MoveDeltaFlags.All;
    packet.x = this.entity.position.x;
    packet.y = this.entity.position.y;
    packet.z = this.entity.position.z;
    packet.yaw = this.entity.rotation.yaw;
    packet.headYaw = this.entity.rotation.headYaw;
    packet.pitch = this.entity.rotation.pitch;

    // Adjust the y position of the entity according to the entity type
    if (this.entity.isPlayer()) packet.y += this.entity.hitboxHeight;
    if (this.entity.isItem()) packet.y += 0.1;

    // Check if the entity is on the ground
    if (this.entity.onGround) packet.flags |= MoveDeltaFlags.OnGround;

    // Broadcast the packet to all players
    if (this.entity.isPlayer()) {
      // Iterate over all players in the dimension
      for (const player of this.entity.dimension.getPlayers()) {
        // Check if the player is the moving entity
        if (player === this.entity) continue;

        // Get the players entity rendering trait
        const rendering = player.getTrait(PlayerEntityRenderingTrait);
        if (!rendering) continue;

        // Check if the player has the entity in their entities list
        if (!rendering.entities.has(this.entity.uniqueId)) continue;

        // Send the packet to the player
        player.send(packet);
      }
    } else {
      // Iterate over all players in the dimension
      for (const player of this.entity.dimension.getPlayers()) {
        // Get the players entity rendering trait
        const rendering = player.getTrait(PlayerEntityRenderingTrait);
        if (!rendering) continue;

        // Check if the player has the entity in their entities list
        if (!rendering.entities.has(this.entity.uniqueId)) continue;

        // Send the packet to the player
        player.send(packet);
      }
    }
  }

  public lookAt(position: BlockPosition | Vector3f) {
    // Convert the block position to a vector
    const vector = BlockPosition.toVector3f(position);

    // Calculate the direction to the target position
    const direction = this.calculateDirection(this.entity.position, vector);

    // Calculate the yaw and pitch from the direction
    let yaw = Math.atan2(direction.z, direction.x) * (180 / Math.PI) - 90;

    // Calculate the pitch from the direction
    const pitch =
      -Math.atan2(
        direction.y,
        Math.sqrt(direction.x * direction.x + direction.z * direction.z)
      ) *
      (180 / Math.PI);

    // Normalize the yaw if it is out of range
    if (yaw > 180) yaw -= 360;
    if (yaw < -180) yaw += 360;

    // Normalize the pitch if it is out of range
    if (pitch > 180) yaw -= 360;
    if (pitch < -180) yaw += 360;

    // Set the entity rotation
    this.entity.rotation.yaw = yaw;
    this.entity.rotation.headYaw = yaw;
    this.entity.rotation.pitch = pitch;

    // Create a new MoveActorDeltaPacket
    const packet = new MoveActorDeltaPacket();

    // Assign the packet properties
    packet.runtimeId = this.entity.runtimeId;
    packet.flags = MoveDeltaFlags.All;
    packet.x = this.entity.position.x;

    // Asjust the y position of the entity
    packet.y = this.entity.isPlayer()
      ? this.entity.position.y
      : this.entity.position.y - 0.1;

    // Assign the z position and rotation properties
    packet.z = this.entity.position.z;
    packet.yaw = this.entity.rotation.yaw;
    packet.headYaw = this.entity.rotation.headYaw;
    packet.pitch = this.entity.rotation.pitch;

    // Adjust the y position of the entity
    if (!this.entity.isPlayer() && !this.entity.isItem())
      packet.y -= this.entity.hitboxHeight;

    // Check if the entity is on the ground
    if (this.entity.onGround) packet.flags |= MoveDeltaFlags.OnGround;

    // Broadcast the packet to all players
    if (this.entity.isPlayer()) {
      // Iterate over all players in the dimension
      for (const player of this.entity.dimension.getPlayers()) {
        // Check if the player is the moving entity
        if (player === this.entity) continue;

        // Get the players entity rendering trait
        const rendering = player.getTrait(PlayerEntityRenderingTrait);

        // Check if the player has the entity in their entities list
        if (!rendering.entities.has(this.entity.uniqueId)) continue;

        // Send the packet to the player
        player.send(packet);
      }
    } else {
      // Iterate over all players in the dimension
      for (const player of this.entity.dimension.getPlayers()) {
        // Get the players entity rendering trait
        const rendering = player.getTrait(PlayerEntityRenderingTrait);

        // Check if the player has the entity in their entities list
        if (!rendering.entities.has(this.entity.uniqueId)) continue;

        // Send the packet to the player
        player.send(packet);
      }
    }
  }

  /**
   * Move the entity towards a position.
   * @param position The position to move towards.
   */
  public moveTowards(position: Vector3f) {
    // Set the target position
    if (this.positionTarget === null) this.positionTarget = position;

    // Calculate the direction to the target position
    const direction = this.calculateDirection(this.entity.position, position);

    // Apply the movement speed to the direction
    direction.x *= this.currentValue * 2.5;
    direction.y *= this.currentValue * 2.5;
    direction.z *= this.currentValue * 2.5;

    /* this.lookAt(position); */

    // Add the direction to the entity motion
    this.entity.addMotion(direction);
  }

  protected calculateDirection(from: Vector3f, to: Vector3f): Vector3f {
    // Calculate the direction from the from position to the to position
    const direction = to.floor().subtract(from.floor());

    // Calculate the magnitude of the direction
    const magnitude = Math.sqrt(
      Math.pow(direction.x, 2) +
        Math.pow(direction.y, 2) +
        Math.pow(direction.z, 2)
    );

    // Return the normalized direction
    return direction.divide(magnitude);
  }
}

export { EntityMovementTrait };
