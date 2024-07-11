import {
	ActorEventIds,
	ActorEventPacket,
	EffectType
} from "@serenityjs/protocol";

import { Effect } from "./effect";

import type { Entity } from "../entity";

class InstantDamage<T extends Entity> extends Effect {
	public effectType: EffectType = EffectType.InstantDamage;
	public instant: boolean = true;

	public onTick?(_entity: T): void {}

	public onAdd?(entity: T): void {
		const entityHealth = entity.getComponent("minecraft:health");

		// TODO: Undead check for healing
		//if (entity)

		/*     if (currentValue >= entityHealth.effectiveMax) return; */

		const packet = new ActorEventPacket();
		packet.actorRuntimeId = entity.runtime;
		packet.eventId = ActorEventIds.HURT_ANIMATION;
		packet.eventData = -1;

		entity.dimension.broadcast(packet);
		entityHealth.decreaseValue(3 * 2 ** this.amplifier);
	}

	public onRemove?(_entity: T): void {}
}

export { InstantDamage };
