import { ActorFlag } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityInvisibilityTrait extends EntityTrait {
  public static readonly identifier = "visibility";
  public static readonly types: Array<EntityIdentifier> = [
    EntityIdentifier.Player
  ];

  public async onAdd(): Promise<void> {
    // Check if the entity has a metadata flag value for invisibility
    if (!this.entity.flags.has(ActorFlag.Invisible)) {
      // Set the entity flag for invisibility
      await this.entity.flags.set(ActorFlag.Invisible, false);
    }
  }

  public async onRemove(): Promise<void> {
    // Check if the entity has a metadata flag value for invisibility
    if (this.entity.flags.has(ActorFlag.Invisible)) {
      // Remove the entity flag for invisibility
      await this.entity.flags.delete(ActorFlag.Invisible);
    }
  }

  /**
   * Set's the visibility of the entity.
   * @param value Wether or not the entity will be visible.
   */
  public async setInvisibility(value: boolean): Promise<void> {
    await this.entity.flags.set(ActorFlag.Invisible, value);
  }
}

export { EntityInvisibilityTrait };
