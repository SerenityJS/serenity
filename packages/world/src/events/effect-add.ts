import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Entity } from "../entity";
import type { Effect } from "../effect/effect";

class EntityEffectAddSignal extends WorldEventSignal {
	public static readonly identifier: WorldEvent = WorldEvent.EntityEffectAdd;

	public readonly entity: Entity;

	public readonly effect: Effect;

	/**
	 * Creates a effect add signal.
	 * @param enttiy The entity that was added an effect.
	 */
	public constructor(entity: Entity, effect: Effect) {
		super(entity.dimension.world);
		this.entity = entity;
		this.effect = effect;
	}
}

export { EntityEffectAddSignal };
