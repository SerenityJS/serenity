import { EffectType, MobEffectEvents, MobEffectPacket } from "@serenityjs/protocol";
import { Effect } from "../../effect/effect";
import { EntityComponent } from "./entity-component";
import { Entity } from "../../entity";

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
      effect.internalTick(this.entity);
    }
  }

  /**
   *
   * @param effect The effect to add to the entity
   * @returns void
   */

  add(effect: Effect): void {
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

  remove(effectType: EffectType): boolean {
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

  has(effectType: EffectType): boolean {
    return this.effects.has(effectType);
  }
}

export { EntityEffectsComponent };
