import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class DarknessEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Darkness;
	public color: Color = new Color(255, 41, 39, 33);

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { DarknessEffect };
