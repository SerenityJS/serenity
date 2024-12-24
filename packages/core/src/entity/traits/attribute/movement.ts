import {
  AttributeName,
  BlockPosition,
  MoveActorDeltaPacket,
  MoveDeltaFlags,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";

import { EntityAttributeTrait } from "./attribute";

class EntityMovementTrait extends EntityAttributeTrait {
  public static readonly identifier = "movement";
  public static readonly types = [EntityIdentifier.Player];

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
      const distance = this.entity.position.distance(this.positionTarget);

      // Check if the entity has reached the target position
      if (distance < 0.5) {
        this.positionTarget = null;
        return;
      }

      this.entity.isMoving = true;

      // Move the entity towards the target position
      this.moveTowards(this.positionTarget);
    }

    // Check if the entity is moving
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

    // Adjust the y position of the entity
    if (!this.entity.isPlayer() && !this.entity.isItem())
      packet.y -= this.entity.hitboxHeight;

    // Check if the entity is on the ground
    if (this.entity.onGround) packet.flags |= MoveDeltaFlags.OnGround;

    // Broadcast the packet to all players
    if (this.entity.isPlayer()) {
      // Check if the moving entity is a player
      // If so, broadcast the packet to all players except the moving entity
      this.entity.dimension.broadcastExcept(this.entity, packet);
    } else {
      this.entity.dimension.broadcast(packet);
    }
  }

  public lookAt(position: BlockPosition | Vector3f) {
    const direction = position.subtract(this.entity.position).floor();
    const headYaw = -Math.atan2(direction.x, direction.z) * (180 / Math.PI);
    const horizontalDistance = Math.sqrt(
      Math.pow(direction.x, 2) + Math.pow(direction.z, 2)
    );
    const pitch =
      -Math.atan2(direction.y, horizontalDistance) * (180 / Math.PI);

    this.entity.rotation.headYaw = headYaw;
    this.entity.rotation.pitch = pitch;
    this.entity.teleport(this.entity.position);
  }

  public moveTowards(position: Vector3f) {
    // Set the target position
    if (this.positionTarget === null) this.positionTarget = position;

    // Calculate the direction to the target position
    const direction = this.calculateDirection(
      this.entity.position,
      position
    ).multiply(this.currentValue);

    this.entity.setMotion(direction);
  }

  protected calculateDirection(from: Vector3f, to: Vector3f): Vector3f {
    // Calculate the direction from the from position to the to position
    const direction = to.subtract(from);

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
