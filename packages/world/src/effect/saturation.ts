import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class SaturationEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Saturation;
	public instant: boolean = true;
	public color: Color = new Color(255, 248, 36, 33);

	public onTick?(entity: T): void {
		// TODO: Difficulty Check
		if (!entity.isPlayer()) return;
		const playerHungerComponent = entity.getComponent(
			"minecraft:player.hunger"
		);
		const playerSaturationComponent = entity.getComponent(
			"minecraft:player.saturation"
		);

		playerHungerComponent.increaseValue(2 * this.amplifier);
		playerSaturationComponent.increaseValue(2 * this.amplifier);
	}

	public onAdd?(_entity: T): void {}

	public onRemove?(_entity: T): void {}
}

export { SaturationEffect };
