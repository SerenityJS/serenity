import { ActorFlag } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityInvisibilityTrait extends EntityTrait {
  public static readonly identifier = "visibility";
  public static readonly types: Array<EntityIdentifier> = [
    EntityIdentifier.Player
  ];

  public onSpawn(): void {
    if (!this.entity.flags.has(ActorFlag.Invisible)) {
      this.entity.flags.set(ActorFlag.Invisible, false);
    }
  }

  /**
   * Set's the visibility of the entity.
   * @param value Wether or not the entity will be visible.
   */
  public setInvisibility(value: boolean): void {
    this.entity.flags.set(ActorFlag.Invisible, value);
  }
}

export { EntityInvisibilityTrait };
