import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class NauseasEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Nausea;
	public color: Color = new Color(255, 85, 29, 74);

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { NauseasEffect };
