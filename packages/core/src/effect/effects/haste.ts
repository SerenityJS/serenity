import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";
import { Entity } from "../../entity";

class HasteEffect extends Effect {
  public static readonly type: EffectType = EffectType.Haste;
  public color: Color = new Color(67, 255, 255, 7);

  public onAdd(entity: Entity): void {
    // Only players can mine blocks, so...
    if (!entity.isPlayer()) return;
    entity.miningSpeed *= 1 + (0.2 * this.amplifier);
  }

  public onRemove(entity: Entity): void {
    // Only players can mine blocks, so...
    if (!entity.isPlayer()) return;
    entity.miningSpeed /= 1 + (0.2 * this.amplifier);
  }
}

export { HasteEffect };
