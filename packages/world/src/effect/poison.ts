import { ActorEventIds, ActorEventPacket, EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class PoisonEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Poison;
  public instant: boolean = false;

  onTick?(entity: T): void {
    let ticksPerSecond = Math.floor(Math.max(25 * Math.pow(0.5, this.amplifier - 1), 12));
    ticksPerSecond = Math.min(ticksPerSecond, 10);

    if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0) return;
    const entityHealth = entity.getComponent("minecraft:health");

    if (entityHealth.getCurrentValue() <= 1) return;
    const packet = new ActorEventPacket();
    packet.actorRuntimeId = entity.runtime;
    packet.eventId = ActorEventIds.HURT_ANIMATION;
    packet.eventData = -1;

    entity.dimension.broadcast(packet);
    entityHealth.decreaseValue(1);
  }

  onAdd?(entity: T): void {}

  onRemove?(entity: T): void {}
}

export { PoisonEffect };
