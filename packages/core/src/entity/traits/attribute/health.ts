import {
  AbilityIndex,
  ActorDamageCause,
  ActorEvent,
  ActorEventPacket,
  AttributeName,
  Gamemode,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier, EntityInteractMethod } from "../../../enums";
import { Player } from "../../player";
import { EntityHurtSignal } from "../../../events";
import { Entity } from "../../entity";

import { EntityAttributeTrait } from "./attribute";

class EntityHealthTrait extends EntityAttributeTrait {
  public static readonly identifier = "health";
  public static readonly types = [EntityIdentifier.Player];

  public readonly attribute = AttributeName.Health;

  public applyDamage(
    amount: number,
    damager?: Entity,
    cause?: ActorDamageCause
  ): void {
    const signal = new EntityHurtSignal(this.entity, amount, cause, damager);

    if (!signal.emit()) return;
    // Calculate the new health value
    this.currentValue -= amount;

    // Create a new ActorEventPacket
    const packet = new ActorEventPacket();
    packet.actorRuntimeId = this.entity.runtimeId;
    packet.event = ActorEvent.Hurt;
    packet.data = cause ?? ActorDamageCause.None;

    // Broadcast the packet to all players
    this.entity.dimension.broadcast(packet);

    // Check if the health is less than or equal to 0
    // If so, the entity is dead
    if (this.currentValue <= 0) this.entity.kill(damager, cause);
  }

  public onAdd(): void {
    // Call the super method
    super.onAdd({
      minimumValue: 0,
      maximumValue: 20,
      defaultValue: 20,
      currentValue: 20
    });
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    // Check if the method is not an attack; if it is not, return
    if (method !== EntityInteractMethod.Attack) return;

    // Check if the player has the ability to attack players; if it does not, return
    if (
      !player.abilities.get(AbilityIndex.AttackPlayers) &&
      this.entity.isPlayer()
    )
      return;

    // Check if the player has the ability to attack mobs; if it does not, return
    if (
      !player.abilities.get(AbilityIndex.AttackMobs) &&
      !this.entity.isPlayer()
    )
      return;

    // Check if the target entity is a player and is in creative mode; if it is, return
    if (this.entity.isPlayer() && this.entity.gamemode === Gamemode.Creative)
      return;

    // We want to apply knock back to the entity when it is attacked, based on the direction the player is facing.
    // Get the direction the player is facing
    const { headYaw, pitch } = player.rotation;

    // Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
    const headYawRad = (headYaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Calculate the velocity of the entity based on the player's rotation
    // NOTE: These numbers are not official/vanilla values, these seem to work similar to the vanilla values.
    // If we can get the official values, we should replace these with the official values.
    const x = (-Math.sin(headYawRad) * Math.cos(pitchRad)) / 3.75;
    const y = 0.2;
    const z = (Math.cos(headYawRad) * Math.cos(pitchRad)) / 3.75;

    // Set the velocity of the entity
    this.entity.setMotion(new Vector3f(x, y, z));

    // Apply damage to the entity
    // TODO: Calculate the damage based on the player's item
    this.applyDamage(1, player, ActorDamageCause.EntityAttack);
  }
}

export { EntityHealthTrait };
