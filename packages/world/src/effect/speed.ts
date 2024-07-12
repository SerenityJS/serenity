import { AttributeName, Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class SpeedEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Speed;
	public color: Color = new Color(255, 124, 175, 198);
	public onTick?(entity: T): void;

	public onAdd?(entity: T): void {
		const speedAttribute = entity.getAttribute(AttributeName.Movement);

		if (!speedAttribute) return;
		entity.setAttribute(
			AttributeName.Movement,
			speedAttribute.current * (1 + 0.2 * this.amplifier),
			true
		);
	}

	public onRemove?(entity: T): void {
		const speedAttribute = entity.getAttribute(AttributeName.Movement);

		if (!speedAttribute) return;
		entity.setAttribute(
			AttributeName.Movement,
			speedAttribute.current / (1 + 0.2 * this.amplifier)
		);
	}
}

export { SpeedEffect };
