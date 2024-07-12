import { AttributeName, Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class SlownessEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Slowness;
	public color: Color = new Color(255, 90, 108, 129);

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void {
		const speedAttribute = entity.getAttribute(AttributeName.Movement);

		if (!speedAttribute) return;
		entity.setAttribute(
			AttributeName.Movement,
			speedAttribute.current * (1 - 0.15 * this.amplifier),
			true
		);
	}

	public onRemove?(entity: T): void {
		const speedAttribute = entity.getAttribute(AttributeName.Movement);

		if (!speedAttribute) return;
		entity.setAttribute(
			AttributeName.Movement,
			speedAttribute.current / (1 - 0.15 * this.amplifier),
			true
		);
	}
}

export { SlownessEffect };
