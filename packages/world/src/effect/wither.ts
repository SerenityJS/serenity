import {
	ActorDamageCause,
	Color,
	EffectType,
	Gamemode
} from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class WitherEffect<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.Wither;
	public instant: boolean = false;
	public color: Color = new Color(255, 53, 42, 39);

	public onTick?(entity: T): void {
		const ticksPerSecond = Math.max(40 / Math.pow(2, this.amplifier - 1), 10);

		if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0)
			return;
		if (entity.isPlayer() && entity.gamemode == Gamemode.Creative) return;

		entity.applyDamage(1, ActorDamageCause.Magic);
	}

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { WitherEffect };
