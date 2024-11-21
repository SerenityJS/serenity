import { Color, EffectType } from "@serenityjs/protocol";

import { Entity, EntityMovementTrait } from "../../entity";

import { Effect } from "./effect";

class SlownessEffect extends Effect {
  public static readonly type: EffectType = EffectType.Slowness;

  public readonly color: Color = new Color(255, 90, 108, 129);

  public onAdd(entity: Entity): void {
    const movementTrait = entity.getTrait(EntityMovementTrait);

    movementTrait.currentValue =
      movementTrait.currentValue * (1 - 0.15 * this.amplifier);
  }

  public onRemove(entity: Entity): void {
    const movementTrait = entity.getTrait(EntityMovementTrait);
    movementTrait.currentValue = movementTrait.defaultValue;
  }
}

export { SlownessEffect };
