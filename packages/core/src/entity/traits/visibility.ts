import { ActorFlag } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityInvisibilityTrait extends EntityTrait {
  public static readonly identifier = "visibility";
  public static readonly types: Array<EntityIdentifier> = [
    EntityIdentifier.Player
  ];

  public onAdd(): void {
    // Check if the entity has a metadata flag value for invisibility
    if (!this.entity.flags.getActorFlag(ActorFlag.Invisible)) {
      // Set the entity flag for invisibility
      this.entity.flags.setActorFlag(ActorFlag.Invisible, false);
    }
  }

  public onRemove(): void {
    // Check if the entity has a metadata flag value for invisibility
    if (this.entity.flags.getActorFlag(ActorFlag.Invisible)) {
      // Remove the entity flag for invisibility
      this.entity.flags.setActorFlag(ActorFlag.Invisible);
    }
  }

  /**
   * Set's the visibility of the entity.
   * @param value Wether or not the entity will be visible.
   */
  public setInvisibility(value: boolean): void {
    this.entity.flags.setActorFlag(ActorFlag.Invisible, value);
  }
}

export { EntityInvisibilityTrait };
