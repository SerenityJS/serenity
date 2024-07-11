import { EffectType, Vector3f } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class LevitationEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Levitation;

	public onTick?(entity: T): void {
		// TODO: Replace Hack
		entity.applyImpulse(new Vector3f(0, 0.001, 0));
	}

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { LevitationEffect };
