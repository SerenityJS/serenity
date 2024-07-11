import type { EffectType } from "@serenityjs/protocol";
import type { Entity } from "../entity";

abstract class Effect {
	public abstract readonly effectType: EffectType;
	public readonly instant: boolean = false;
	public duration: number;
	public amplifier: number;
	public showParticles: boolean;
	// TODO: Effect Color & Particle
	protected color: undefined = undefined;

	public constructor(
		duration: number,
		amplifier: number,
		showParticles: boolean
	) {
		this.duration = this.instant ? 0 : duration;
		this.amplifier = amplifier;
		this.showParticles = showParticles;
	}

	/*   static resolve(effectType: EffectType): Effect | undefined {} */

	public get isExpired() {
		return this.duration <= 0;
	}

	public internalTick(entity: Entity): void {
		this.duration -= 2; // 1 second = 40 ticks ???
		this.onTick?.(entity);
	}

	public abstract onTick?(entity: Entity): void;
	public abstract onAdd?(entity: Entity): void;
	public abstract onRemove?(entity: Entity): void;
}

export { Effect };
