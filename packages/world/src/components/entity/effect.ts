import {
	type EffectType,
	LevelEvent,
	LevelEventPacket,
	MobEffectEvents,
	MobEffectPacket,
	Vector3f
} from "@serenityjs/protocol";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";
import type { Effect } from "../../effect/effect";

class EntityEffectsComponent extends EntityComponent {
	public static readonly identifier = "minecraft:effects";
	/**
	 * The linked entity effects
	 */
	public readonly effects: Map<EffectType, Effect> = new Map();

	public constructor(entity: Entity) {
		super(entity, EntityEffectsComponent.identifier);
	}

	public onTick(): void {
		for (const [effectType, effect] of this.effects) {
			if (effect.isExpired) {
				effect.onRemove?.(this.entity);
				this.effects.delete(effectType);
				continue;
			}
			// Spawn a particle every 1s
			if (
				this.entity.dimension.world.currentTick %
					(this.effects.size > 1 ? 8n : 2n) ==
				0n
			) {
				// Get all the effects
				const effects = [...this.effects.values()].filter(
					(effect) => effect.showParticles
				);
				// Select randomly an effect
				const randomEffect =
					effects[Math.floor(Math.random() * effects.length)];

				// Show it.
				if (randomEffect) this.showParticles(randomEffect);
			}
			effect.internalTick(this.entity);
		}
	}

	private showParticles(effect: Effect): void {
		const packet = new LevelEventPacket();
		// Potion Effect Particle
		packet.event = LevelEvent.ParticleLegacyEvent | 34;
		packet.data = effect.color.toInt();
		packet.position = this.entity.position.subtract(new Vector3f(0, 1, 0));

		this.entity.dimension.broadcast(packet);
	}

	/**
	 *
	 * @param effect The effect to add to the entity
	 * @returns void
	 */

	public add(effect: Effect): void {
		const currentEffect = this.effects.get(effect.effectType);

		if (currentEffect && !currentEffect.isExpired) {
			return;
		}
		effect.onAdd?.(this.entity);
		this.effects.set(effect.effectType, effect);

		if (!this.entity.isPlayer()) return;
		const packet = new MobEffectPacket();
		packet.runtimeId = this.entity.runtime;
		packet.eventId = MobEffectEvents.EffectAdd;
		packet.effectId = effect.effectType;
		packet.particles = effect.showParticles;
		packet.amplifier = effect.amplifier;
		packet.duration = effect.duration;
		packet.tick = this.entity.dimension.world.currentTick;

		this.entity.session.send(packet);
	}

	/**
	 *
	 * @param effectType The effct to remove from the player
	 * @returns boolean If the effect was removed correctly
	 */

	public remove(effectType: EffectType): boolean {
		if (!this.effects.has(effectType)) return false;
		const effect = this.effects.get(effectType);
		const packet = new MobEffectPacket();

		effect?.onRemove?.(this.entity);
		this.effects.delete(effectType);

		if (!this.entity.isPlayer()) return true;
		packet.runtimeId = this.entity.runtime;
		packet.eventId = MobEffectEvents.EffectRemove;
		packet.effectId = effectType;
		packet.particles = false;
		packet.amplifier = 0;
		packet.duration = 0;
		packet.tick = this.entity.dimension.world.currentTick;

		this.entity.session.send(packet);
		return true;
	}

	/**
	 *
	 * @param effectType The effect type to query on the player
	 * @returns boolean If the player has the effect
	 */

	public has(effectType: EffectType): boolean {
		return this.effects.has(effectType);
	}
}

export { EntityEffectsComponent };
