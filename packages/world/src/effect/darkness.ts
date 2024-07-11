import { EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class DarknessEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Darkness;

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { DarknessEffect };
