import { ActorEventIds, ActorEventPacket, EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class RegenerationEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Regeneration;
  public instant: boolean = false;

  onTick?(entity: T): void {
    let ticksPerSecond = Math.max(50 / 2 ** (this.amplifier - 1), 1 * 2 ** (this.amplifier - 5));

    if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0) return;
    const entityHealth = entity.getComponent("minecraft:health");

    entityHealth.setCurrentValue(entityHealth.getCurrentValue() + 1);
  }

  onAdd?(entity: T): void {}

  onRemove?(entity: T): void {}
}

export { RegenerationEffect };
