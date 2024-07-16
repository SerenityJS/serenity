import { ActorDamageCause, EffectType, Gamemode } from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class InstantDamage<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.InstantDamage;
	public instant: boolean = true;

	public onTick?(_entity: T): void {}

	public onAdd?(entity: T): void {
		// TODO: Undead check for healing
		//if (entity)

		if (entity.isPlayer() && entity.gamemode == Gamemode.Creative) return;

		entity.applyDamage(3 * 2 ** this.amplifier, ActorDamageCause.Magic);
	}

	public onRemove?(_entity: T): void {}
}

export { InstantDamage };
