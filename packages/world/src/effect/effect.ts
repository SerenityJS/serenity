import { EffectType } from "@serenityjs/protocol";
import { Entity } from "../entity";

abstract class Effect {
  public abstract readonly effectType: EffectType;
  public readonly instant: boolean = false;
  public duration: number;
  public amplifier: number;
  public showParticles: boolean;
  // TODO: Effect Color & Particle
  protected color: void = undefined;

  constructor(duration: number, amplifier: number, showParticles: boolean) {
    this.duration = this.instant ? 0 : duration;
    this.amplifier = amplifier;
    this.showParticles = showParticles;
  }

  /*   static resolve(effectType: EffectType): Effect | undefined {} */

  public get isExpired() {
    return this.duration <= 0;
  }

  internalTick(entity: Entity): void {
    this.duration -= 2; // 1 second = 40 ticks ???
    this.onTick?.(entity);
  }

  abstract onTick?(entity: Entity): void;
  abstract onAdd?(entity: Entity): void;
  abstract onRemove?(entity: Entity): void;
}

export { Effect };
