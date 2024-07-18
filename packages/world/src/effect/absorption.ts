import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class AbsorptionEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Absorption;
	public color: Color = new Color(255, 37, 82, 165);

	public onTick?(entity: T): void;

	public onAdd?(entity: T): void {
		if (!entity.isPlayer()) return;
		const playerAbsorption = entity.getComponent("minecraft:absorption");

		if (this.amplifier * 4 == playerAbsorption.getCurrentValue()) return;
		playerAbsorption.setCurrentValue(this.amplifier * 4, true);
	}

	public onRemove?(entity: T): void {
		if (!entity.isPlayer()) return;
		const playerAbsorption = entity.getComponent("minecraft:absorption");

		playerAbsorption.resetToDefaultValue();
	}
}

export { AbsorptionEffect };
