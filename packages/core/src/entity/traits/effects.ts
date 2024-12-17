import {
  EffectType,
  LevelEvent,
  LevelEventPacket,
  MobEffectEvents,
  MobEffectPacket,
  Vector3f
} from "@serenityjs/protocol";

import { Effect } from "../../effect";
import { EntityIdentifier } from "../../enums";
import { EntityEffectOptions } from "../../types";
import { EffectAddSignal, EffectRemoveSignal } from "../../events";

import { EntityTrait } from "./trait";

interface savedEffect {
  effectType: EffectType;
  duration: number;
  amplifier: number;
  showParticles: boolean;
}

class EntityEffectsTrait extends EntityTrait {
  public static readonly type = [EntityIdentifier.Player];
  public static readonly identifier = "effects";

  private readonly effects: Map<EffectType, Effect> = new Map();

  public onTick(): void {
    for (const [type, effect] of this.effects) {
      effect.onTick?.(this.entity);

      if (!effect.isExpired()) {
        // Reduce the effect duration by two ticks.
        effect.duration -= 2;
        continue;
      }
      this.remove(type);
    }

    const particleInterval = this.effects.size > 1 ? 8n : 2n;
    // Spawn a particle based on the effect size interval.
    if (this.entity.world.currentTick % particleInterval == 0n) {
      const effect = this.getParticleEffect();

      if (!effect) return;
      // Spawn the particle.
      const packet = new LevelEventPacket();
      packet.event = LevelEvent.ParticleLegacyEvent | 34;
      packet.data = effect.color.toInt();
      packet.position = this.entity.position.subtract(new Vector3f(0, 1, 0));

      this.entity.dimension.broadcast(packet);
    }
  }

  public remove(effectType: EffectType): void {
    if (!this.effects.has(effectType)) return;
    const signal = new EffectRemoveSignal(this.entity, effectType);

    signal.emit();
    this.effects.get(effectType)?.onRemove?.(this.entity);
    this.effects.delete(effectType);

    if (!this.entity.isPlayer()) return;
    // Create the effect removal packet.
    const packet = new MobEffectPacket();
    packet.runtimeId = this.entity.runtimeId;
    packet.eventId = MobEffectEvents.EffectRemove;
    packet.effectId = effectType;
    packet.particles = false;
    packet.amplifier = 0;
    packet.duration = 0;
    packet.inputTick = this.entity.world.currentTick;

    this.entity.send(packet);
  }

  /**
   * Checks if the entity has an active effect of the specified type.
   *
   * @param effectType - The type of the effect to check.
   * @returns `true` if the entity has an active effect of the specified type; otherwise, `false`.
   */
  public has(effectType: EffectType): boolean {
    return this.effects.has(effectType);
  }

  /**
   * Adds a new effect to the entity.
   *
   * @param effectType - The type of the effect to add.
   * @param duration - The duration of the effect in ticks.
   * @param amplifier - The amplifier of the effect. Optional, defaults to 0.
   * @param showParticles - Whether the effect should show particles. Optional, defaults to true.
   */
  public add(
    effectType: EffectType,
    duration: number,
    options?: EntityEffectOptions
  ): void {
    const showParticles = options?.showParticles ?? true;
    const amplifier = options?.amplifier ?? 0;

    // Get the effect type builder
    const effectBuilder = this.entity.world.effectPalette.getEffect(effectType);
    let effect = this.effects.get(effectType);

    // If there's no active effect and there's effect builder, create a new effect
    if (!effect && effectBuilder)
      effect = new effectBuilder(duration, amplifier, showParticles);
    else if (effect) {
      // Adjust the current effect properties
      effect.duration = effect.duration + duration;
      effect.amplifier = Math.max(effect.amplifier, amplifier ?? 0);
      effect.showParticles = showParticles ?? true;
    }
    // eslint fix
    if (!effect) return;
    const signal = new EffectAddSignal(this.entity, effect);

    if (!signal.emit()) return;

    effect.onAdd?.(this.entity);
    this.effects.set(effectType, effect);

    // If the entity is not a player, exit.
    if (!this.entity.isPlayer()) return;
    // Create the effect addition packet.
    const packet = new MobEffectPacket();
    packet.runtimeId = this.entity.runtimeId;
    packet.eventId = MobEffectEvents.EffectAdd;
    packet.effectId = effectType;
    packet.particles = effect.showParticles;
    packet.amplifier = effect.amplifier;
    packet.duration = effect.duration;
    packet.inputTick = this.entity.world.currentTick;

    // Send the packet to the player.
    this.entity.send(packet);
  }

  /**
   * Retrieves a random particle effect from the entity's active effects list.
   *
   * @returns The randomly selected particle effect or `undefined` if no particle effects are available.
   */
  private getParticleEffect(): Effect {
    // Filter the effects to only include those with showParticles set to true.
    const effects = [...this.effects.values()].filter(
      (effect) => effect.showParticles
    );

    // Return the selected effect or undefined if no particle effects are available.
    return effects[Math.floor(Math.random() * effects.length)]!;
  }

  /*
   * This function retrieves the saved effects from the entity's components,
   * creates new instances of the effects using the data, and adds them to the entity's effects list.
   * The saved effects are loaded from the "entity_effects" component, which is expected to be an array of objects
   */
  public onSpawn(): void {
    // Load the effects from the saved data.
    const entityEffects = (this.entity.components.get("entity_effects") ??
      []) as Array<unknown> as Array<savedEffect>;

    for (const effectEntry of entityEffects) {
      const { effectType, duration, amplifier, showParticles } = effectEntry;
      const effect = this.entity.world.effectPalette.getEffect(effectType);

      if (!effect) return;
      this.effects.set(
        effectType,
        new effect(duration, amplifier, showParticles)
      );
    }
  }

  public onDespawn(): void {
    this.entity.components.set(
      "entity_effects",
      [...this.effects.values()].map((effect) => effect.toString())
    );
  }
}

export { EntityEffectsTrait };
