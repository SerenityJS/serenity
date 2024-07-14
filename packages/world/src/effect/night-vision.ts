import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class NightVisionEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.NightVision;
	public color: Color = new Color(255, 31, 31, 161);

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { NightVisionEffect };
