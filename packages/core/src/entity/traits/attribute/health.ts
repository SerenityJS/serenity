import {
  ActorDamageCause,
  ActorEvent,
  ActorEventPacket,
  AttributeName
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityHurtSignal } from "../../../events";
import { Entity } from "../../entity";
import { EntityEquipmentTrait } from "../equipment";
import {
  EntityDeathOptions,
  EntityDespawnOptions,
  EntitySpawnOptions
} from "../../../types";
import { ItemStackDurabilityTrait } from "../../../item";

import { EntityAttributeTrait } from "./attribute";

class EntityHealthTrait extends EntityAttributeTrait {
  public static readonly identifier = "health";
  public static readonly types = [EntityIdentifier.Player];
  public static readonly components = ["minecraft:health"];

  public readonly attribute = AttributeName.Health;

  public applyDamage(
    amount: number,
    damager?: Entity,
    cause?: ActorDamageCause
  ): void {
    // Create a new EntityHurtSignal
    const signal = new EntityHurtSignal(this.entity, amount, cause, damager);

    // Emit the signal and check if it was cancelled
    if (!signal.emit()) return;

    // Calculate the new health value
    this.currentValue -= signal.amount;

    // Create a new ActorEventPacket
    const packet = new ActorEventPacket();
    packet.actorRuntimeId = this.entity.runtimeId;
    packet.event = ActorEvent.Hurt;
    packet.data = signal.cause ?? ActorDamageCause.None;

    // Broadcast the packet to all players
    this.entity.dimension.broadcast(packet);

    // Check if the entity has a EntityEquipmentTrait
    if (this.entity.hasTrait(EntityEquipmentTrait)) {
      // Get the EntityEquipmentTrait
      const equipment = this.entity.getTrait(EntityEquipmentTrait);

      // Iterate through the armor storage and process durability for each item stack
      for (const itemStack of equipment.armor.storage) {
        // Check if the item stack is not null
        if (!itemStack) continue;

        // Check if the item stack has a durability trait
        if (itemStack.hasTrait(ItemStackDurabilityTrait)) {
          // Get the durability trait
          const durabilityTrait = itemStack.getTrait(ItemStackDurabilityTrait);

          // Process the damage for the item stack
          durabilityTrait.processDamage(this.entity);
        }
      }
    }

    // Check if the health is less than or equal to 0
    // If so, the entity is dead
    if (this.currentValue <= 0)
      this.entity.kill({ killerSource: damager, damageCause: signal.cause });
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

  public onSpawn(details: EntitySpawnOptions): void {
    // Check if the entity is not being spawned for the first time
    if (details.initialSpawn) return;

    // Reset the health value
    this.currentValue = this.defaultValue;
  }

  public onDespawn(details: EntityDespawnOptions): void {
    // If the entity is disconnected & the current value is less than or equal to the minimum value,
    if (details.disconnected && this.currentValue <= this.minimumValue)
      this.currentValue = this.maximumValue; // Reset the health value to the maximum value
  }

  public onDeath(details: EntityDeathOptions): void {
    // Check if the death was cancelled
    if (details.cancel) {
      // Set the current health value to the minimum value
      this.currentValue = this.maximumValue;

      // Return early
      return;
    }

    // Set the current health value to the minimum value
    this.currentValue = this.minimumValue;
  }
}

export { EntityHealthTrait };
