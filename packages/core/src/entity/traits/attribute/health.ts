import {
  ActorDamageCause,
  ActorEvent,
  ActorEventPacket,
  AttributeName
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityHurtSignal } from "../../../events";
import { Entity } from "../../entity";
import { EntitySpawnOptions } from "../../..";

import { EntityAttributeTrait } from "./attribute";

class EntityHealthTrait extends EntityAttributeTrait {
  public static readonly identifier = "health";
  public static readonly types = [EntityIdentifier.Player];

  public readonly attribute = AttributeName.Health;

  public async applyDamage(
    amount: number,
    damager?: Entity,
    cause?: ActorDamageCause
  ): Promise<void> {
    const signal = new EntityHurtSignal(this.entity, amount, cause, damager);

    if (!(await signal.emit())) return;
    // Calculate the new health value
    this.currentValue -= amount;

    // Create a new ActorEventPacket
    const packet = new ActorEventPacket();
    packet.actorRuntimeId = this.entity.runtimeId;
    packet.event = ActorEvent.Hurt;
    packet.data = cause ?? ActorDamageCause.None;

    // Broadcast the packet to all players
    await this.entity.dimension.broadcast(packet);

    // Check if the health is less than or equal to 0
    // If so, the entity is dead
    if (this.currentValue <= 0)
      await this.entity.kill({ killerSource: damager, damageCause: cause });
  }

  public async onAdd(): Promise<void> {
    // Call the super method
    return super.onAdd({
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

  public onDeath(): void {
    this.currentValue = this.minimumValue;
  }
}

export { EntityHealthTrait };
