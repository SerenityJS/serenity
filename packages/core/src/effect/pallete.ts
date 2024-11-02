import { EffectType } from "@serenityjs/protocol";

import { EntityEffects } from ".";

import type { Effect } from "./effects/effect";

class EffectPallete {
  public effects: Map<EffectType, typeof Effect> = new Map();

  public constructor() {
    // Register all effect types.
    for (const effect of EntityEffects) this.registerEffect(effect);
  }

  /**
   * Registers an effect type in the effect registry.
   * @param effect The effect type to be registered.
   */
  public registerEffect(effect: typeof Effect): void {
    this.effects.set(effect.type, effect);
  }

  /**
   * Fetches a effect type from the effect registry.
   * @param type The effect type to be fetched from the registry.
   * @returns The effect if found.
   */
  public getEffect(type: EffectType): typeof Effect | undefined {
    return this.effects.get(type);
  }

  /**
   * Get's all the effects that are in the registry,
   * @returns All the effects that are registered.
   */

  public getAllEffects(): Array<typeof Effect> {
    return [...this.effects.values()];
  }

  /**
   * Removes an effect from the effect registry.
   * @param type The effect type to remove from the registry.
   */
  public removeEffect(type: EffectType): void {
    this.effects.delete(type);
  }
}

export { EffectPallete };
