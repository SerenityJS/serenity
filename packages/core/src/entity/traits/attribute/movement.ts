import {
  AttributeName,
  MoveActorDeltaPacket,
  MoveDeltaFlags
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";

import { EntityAttributeTrait } from "./attribute";

class EntityMovementTrait extends EntityAttributeTrait {
  public static readonly identifier = "movement";
  public static readonly types = [EntityIdentifier.Player];

  public readonly attribute = AttributeName.Movement;
  public readonly effectiveMin = 0;
  public readonly effectiveMax = 3.402_823_466e+38;
  public readonly defaultValue = 0.1;

  public onTick(): void {
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
    if (!this.entity.isPlayer() && !this.entity.isItem()) packet.y -= 0.25;

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
}

export { EntityMovementTrait };
