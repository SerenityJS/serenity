import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { EffectType } from "@serenityjs/protocol";
import type { Entity } from "../entity";

class EntityEffectRemoveSignal extends WorldEventSignal {
	public static readonly identifier: WorldEvent = WorldEvent.EntityEffectRemove;

	public readonly entity: Entity;

	public readonly effectType: EffectType;

	/**
	 * Creates a effect add signal.
	 * @param enttiy The entity that was removed an effect.
	 */
	public constructor(entity: Entity, effectType: EffectType) {
		super();
		this.entity = entity;
		this.effectType = effectType;

		// TODO: WorldEvents experimental - Remove this once the chosen event system is implemented.
		this.emit();
	}
}

export { EntityEffectRemoveSignal };
