import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class HungerEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Hunger;
	public color: Color = new Color(255, 88, 118, 83);

	public onTick?(entity: T): void {
		// TODO: Difficulty Check
		if (!entity.isPlayer()) return;
		const playerHungerComponent = entity.getComponent(
			"minecraft:player.hunger"
		);

		playerHungerComponent.exhaust(0.005 * this.amplifier);
	}

	public onAdd?(_entity: T): void {}

	public onRemove?(_entity: T): void {}
}

export { HungerEffect };
