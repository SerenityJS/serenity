import { EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class InvisibilityEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Invisibility;

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void {
		entity.setVisibility(false);
	}

	public onRemove?(entity: T): void {
		entity.setVisibility(true);
	}
}

export { InvisibilityEffect };
