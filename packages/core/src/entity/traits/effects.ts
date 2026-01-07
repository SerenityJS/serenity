import {
  EffectType,
  LevelEvent,
  LevelEventPacket,
  MobEffectEvents,
  MobEffectPacket
} from "@serenityjs/protocol";
import { ListTag, CompoundTag, ByteTag } from "@serenityjs/nbt";

import { Effect } from "../../effect";
import { EntityIdentifier } from "../../enums";
import { EntityDespawnOptions, EntityEffectOptions } from "../../types";
import { EffectAddSignal, EffectRemoveSignal } from "../../events";
import { Entity } from "../entity";

import { EntityTrait } from "./trait";

interface MobEffectOptions {
  action: MobEffectEvents;
  effectType: EffectType;
  effect?: Effect;
}

class EntityEffectsTrait extends EntityTrait {
  public static readonly types = [EntityIdentifier.Player];

  public static readonly identifier = "entity_effects";

  public readonly effectMap: Map<EffectType, Effect>;

  public constructor(entity: Entity) {
    super(entity);

    this.effectMap = new Map();
  }

  public onTick(): void {
    for (const [type, effect] of this.effectMap) {
      if (effect.isExpired()) {
        this.removeEffect(type);
        continue;
      }
      effect.duration -= 2;
      effect.onTick?.(this.entity);
    }
    this.handleParticles();
  }

  public removeEffect(effectType: EffectType): void {
    if (!this.effectMap.has(effectType)) return;
    const signal = new EffectRemoveSignal(this.entity, effectType);

    signal.emit();
    this.effectMap.get(effectType)?.onRemove?.(this.entity);
    this.effectMap.delete(effectType);

    if (!this.entity.isPlayer()) return;
    this.sendPacket({ action: MobEffectEvents.EffectRemove, effectType });
  }

  /**
   * Checks if the entity has an active effect of the specified type.
   *
   * @param effectType - The type of the effect to check.
   * @returns `true` if the entity has an active effect of the specified type; otherwise, `false`.
   */
  public hasEffect(effectType: EffectType): boolean {
    return this.effectMap.has(effectType);
  }

  /**
   * Retrieves all active effects on the entity.
   * @returns An array of active effects.
   */
  public getEffects(): Array<EffectType> {
    return [...this.effectMap.keys()];
  }

  public addEffect(
    effectType: EffectType,
    duration: number,
    options?: EntityEffectOptions
  ): void {
    const showParticles = options?.showParticles ?? true;
    const amplifier = options?.amplifier ?? 0;

    // Get the effect type builder
    const effectBuilder = this.entity.world.effectPalette.getEffect(effectType);
    let effect = this.effectMap.get(effectType);

    if (!effect) {
      if (!effectBuilder) return;
      effect = new effectBuilder(duration, amplifier, showParticles);
    } else {
      // Adjust the current effect properties
      effect.duration = effect.duration + duration;
      effect.amplifier = Math.max(effect.amplifier, amplifier ?? 0);
      effect.showParticles = showParticles ?? true;

      // Send a modify packet to the player.
      return this.sendPacket({
        effectType,
        effect,
        action: MobEffectEvents.EffectModify
      });
    }
    const signal = new EffectAddSignal(this.entity, effect);

    if (!signal.emit()) return;
    effect.onAdd?.(this.entity);
    this.effectMap.set(effectType, effect);

    // If the entity is not a player, exit.
    if (!this.entity.isPlayer()) return;
    this.sendPacket({
      action: MobEffectEvents.EffectAdd,
      effectType,
      effect
    });
  }

  private sendPacket(packetOptions: MobEffectOptions): void {
    if (!this.entity.isPlayer()) return;
    const { effectType, action, effect } = packetOptions;
    const packet = new MobEffectPacket();

    packet.runtimeId = this.entity.runtimeId;
    packet.eventId = action;
    packet.effectId = effectType;
    packet.particles = effect?.showParticles ?? false;
    packet.amplifier = effect?.amplifier ?? 0;
    packet.duration = effect?.duration ?? 0;
    packet.inputTick = this.entity.world.currentTick;
    packet.isAmbient = false; // TODO: investigate ambient effects

    this.entity.send(packet);
  }

  public onSpawn(): void {
    const world = this.entity.world;
    const effectList =
      this.entity.getStorageEntry<ListTag<CompoundTag>>("entity_effects");

    if (!effectList) return;

    for (const effectTag of effectList) {
      const effectType = effectTag
        .get<ByteTag>("effect_type")!
        .toJSON() as EffectType;
      const effectBuilder = world.effectPalette.getEffect(effectType);

      if (!effectBuilder) continue;
      const effect = effectBuilder.deserialize(effectTag);

      this.effectMap.set(effectType, effect);
      // If the entity is not a player, exit.
      if (!this.entity.isPlayer()) return;
      this.sendPacket({
        action: MobEffectEvents.EffectAdd,
        effectType,
        effect
      });
    }
  }

  public onDespawn(details: EntityDespawnOptions): void {
    if (!details.disconnected) return;
    const entityEffects = new ListTag();

    for (const effect of this.effectMap.values()) {
      entityEffects.push(effect.serialize());
    }
    this.entity.setStorageEntry("entity_effects", entityEffects);
  }

  public handleParticles(): void {
    if (this.effectMap.size == 0) return;
    const particleInterval = 10n;

    if (this.entity.world.currentTick % particleInterval != 0n) return;
    for (const effect of this.effectMap.values()) {
      if (!effect.showParticles) continue;

      const particlePacket = new LevelEventPacket();
      particlePacket.event = LevelEvent.ParticleLegacyEvent | 34;
      particlePacket.data = effect.color.toInt();
      particlePacket.position = this.entity.position;

      this.entity.dimension.broadcast(particlePacket);
    }
  }
}

export { EntityEffectsTrait };
