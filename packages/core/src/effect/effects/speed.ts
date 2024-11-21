import { Color, EffectType } from "@serenityjs/protocol";

import { Entity, EntityMovementTrait } from "../../entity";

import { Effect } from "./effect";

class SpeedEffect extends Effect {
  public static readonly type: EffectType = EffectType.Speed;
  public readonly color: Color = new Color(255, 124, 175, 198);

  public onAdd(entity: Entity): void {
    const movementTrait = entity.getTrait(EntityMovementTrait);

    movementTrait.currentValue =
      movementTrait.currentValue * (1 + 0.2 * this.amplifier);
  }

  public onRemove(entity: Entity): void {
    const movementTrait = entity.getTrait(EntityMovementTrait);
    movementTrait.currentValue = movementTrait.defaultValue;
  }
}

export { SpeedEffect };
