import { ActorEventIds, ActorEventPacket, EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class InstantDamage<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.InstantDamage;
  public instant: boolean = true;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {
    const entityHealth = entity.getComponent("minecraft:health");

    // TODO: Undead check for healing
    //if (entity)

    /*     if (currentValue >= entityHealth.effectiveMax) return; */

    const packet = new ActorEventPacket();
    packet.actorRuntimeId = entity.runtime;
    packet.eventId = ActorEventIds.HURT_ANIMATION;
    packet.eventData = -1;

    entity.dimension.broadcast(packet);
    entityHealth.decreaseValue(3 * 2 ** this.amplifier);
  }

  onRemove?(entity: T): void {}
}

export { InstantDamage };
