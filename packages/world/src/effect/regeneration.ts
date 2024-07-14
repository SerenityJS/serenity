import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class RegenerationEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Regeneration;
	public instant: boolean = false;
	public color: Color = new Color(255, 205, 92, 171);

	public onTick?(entity: T): void {
		const ticksPerSecond = Math.max(
			50 / 2 ** (this.amplifier - 1),
			1 * 2 ** (this.amplifier - 5)
		);

		if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0)
			return;
		const entityHealth = entity.getComponent("minecraft:health");

		entityHealth.setCurrentValue(entityHealth.getCurrentValue() + 1);
	}

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { RegenerationEffect };
