import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class InvisibilityEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Invisibility;
	public color: Color = new Color(255, 127, 131, 146);

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void {
		entity.setVisibility(false);
	}

	public onRemove?(entity: T): void {
		entity.setVisibility(true);
	}
}

export { InvisibilityEffect };
