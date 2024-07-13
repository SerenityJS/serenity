import {
	ActorEventIds,
	ActorEventPacket,
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
		const entityHealth = entity.getComponent("minecraft:health");

		if (!entity.isAlive) {
			this.duration = 0;
			return;
		}
		const packet = new ActorEventPacket();
		packet.actorRuntimeId = entity.runtime;
		packet.eventId = ActorEventIds.HURT_ANIMATION;
		packet.eventData = -1;

		entity.dimension.broadcast(packet);
		entityHealth.decreaseValue(1);
	}

	public onAdd?(entity: T): void;

	public onRemove?(entity: T): void;
}

export { WitherEffect };
