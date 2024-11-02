import { Color, EffectType } from "@serenityjs/protocol";

import { Entity, EntityInvisibilityTrait } from "../../entity";

import { Effect } from "./effect";

class InvisibilityEffect extends Effect {
  public static readonly type: EffectType = EffectType.Invisibility;

  public readonly color: Color = new Color(255, 127, 131, 146);

  public onAdd(entity: Entity): void {
    // Make the entity invisible.
    entity.getTrait(EntityInvisibilityTrait)?.setInvisibility(true);
  }

  public onRemove(entity: Entity): void {
    // Make the entity visible again.
    entity.getTrait(EntityInvisibilityTrait)?.setInvisibility(false);
  }
}

export { InvisibilityEffect };
