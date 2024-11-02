import { Color, EffectType } from "@serenityjs/protocol";

import { Entity } from "../../entity";

class Effect {
  // The minecraft effect type.
  public static readonly type: EffectType;

  // Whether the effect is instantaneous or not. Default is false.
  public static readonly instant: boolean = false;

  // The effect's particle color.
  public readonly color: Color = new Color(255, 255, 255, 255);

  // Effect duration.
  public duration: number;

  // The effect's amplifier. Default is 0.
  public amplifier: number;

  // Wether the effect should show particles or not. Default is true.
  public showParticles: boolean;

  public constructor(
    duration: number,
    amplifier?: number,
    showParticles?: boolean
  ) {
    this.duration = Object.getPrototypeOf(this).instant ? 0 : duration;
    this.amplifier = amplifier ?? 0;
    this.showParticles = showParticles ?? true;
  }

  public toString(): string {
    return JSON.stringify({
      effectType: Object.getPrototypeOf(this).type,
      duration: this.duration,
      amplifier: this.amplifier,
      showParticles: this.showParticles
    });
  }

  /**
   * Checks if the effect has expired.
   * @returns Wether or not the effect has expired.
   */

  public isExpired(): boolean {
    return this.duration <= 0;
  }

  public onAdd?(entity: Entity): void;

  public onRemove?(entity: Entity): void;

  public onTick?(entity: Entity): void;
}

export { Effect };
