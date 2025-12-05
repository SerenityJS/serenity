import { Color, EffectType } from "@serenityjs/protocol";
import { ByteTag, CompoundTag, IntTag, ShortTag } from "@serenityjs/nbt";

import { Entity } from "../../entity";

class Effect {
  // The minecraft effect type.
  public static readonly type: EffectType;

  // Whether the effect is instantaneous or not. Default is false.
  public readonly instant: boolean = false;

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
    this.duration = this.instant ? 0 : duration;
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

  public serialize(): CompoundTag {
    const compoundTag = new CompoundTag();
    const effectType = (this.constructor as typeof Effect).type;

    compoundTag.add(new ByteTag(effectType, "effect_type"));
    compoundTag.add(new IntTag(this.duration, "effect_duration"));
    compoundTag.add(new ShortTag(this.amplifier, "effect_amplifier"));
    compoundTag.add(new ByteTag(Number(this.showParticles), "show_particles"));

    return compoundTag;
  }

  public static deserialize(compoundTag: CompoundTag): Effect {
    const effectDuration = compoundTag.get<IntTag>("effect_duration")!.toJSON();
    const showParticles = Boolean(compoundTag.get<ByteTag>("show_particles")!);
    const effectAmplifier = compoundTag
      .get<ShortTag>("effect_amplifier")!
      .toJSON();

    return new this(effectDuration, effectAmplifier, showParticles);
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
