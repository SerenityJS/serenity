import { ActorEventIds, ActorEventPacket, EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class WitherEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Wither;
  public instant: boolean = false;

  onTick?(entity: T): void {
    let ticksPerSecond = Math.max(40 / Math.pow(2, this.amplifier - 1), 10);

    if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0) return;
    const entityHealth = entity.getComponent("minecraft:health");

    if (!entity.isAlive) {
      this.duration = 0;
      return;
    }
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

export { WitherEffect };
