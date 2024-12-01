import {
  ActorDataId,
  ActorDataType,
  ActorFlag,
  DataItem,
  Gamemode
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityCollisionTrait extends EntityTrait {
  public static readonly identifier = "collision";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The height of the entity collision box.
   */
  public get height(): number {
    // Check if the entity has a metadata value for collision height
    if (!this.entity.metadata.has(ActorDataId.Reserved054)) return 0;

    // Get the entity collision height
    return this.entity.metadata.get(ActorDataId.Reserved054).value as number;
  }

  /**
   * The height of the entity collision box.
   */
  public set height(value: number) {
    // Create a new DataItem object
    const data = new DataItem(
      ActorDataId.Reserved054,
      ActorDataType.Float,
      value
    );

    // Set the entity collision height
    this.entity.metadata.set(ActorDataId.Reserved054, data);
  }

  /**
   * The width of the entity collision box.
   */
  public get width(): number {
    // Check if the entity has a metadata value for collision width
    if (!this.entity.metadata.has(ActorDataId.Reserved053)) return 0;

    // Get the entity collision width
    return this.entity.metadata.get(ActorDataId.Reserved053).value as number;
  }

  /**
   * The width of the entity collision box.
   */
  public set width(value: number) {
    // Create a new DataItem object
    const data = new DataItem(
      ActorDataId.Reserved053,
      ActorDataType.Float,
      value
    );

    // Set the entity collision width
    this.entity.metadata.set(ActorDataId.Reserved053, data);
  }

  public onAdd(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.has(ActorFlag.HasCollision)) {
      // Set the entity flag for gravity
      this.entity.flags.set(ActorFlag.HasCollision, true);
    }

    // Check if the entity has a metadata value for collision height
    if (!this.entity.metadata.has(ActorDataId.Reserved054)) {
      // Set the default height value
      this.height = 1.7;
    }

    // Check if the entity has a metadata value for collision width
    if (!this.entity.metadata.has(ActorDataId.Reserved053)) {
      // Set the default width value
      this.width = 0.6;
    }
  }

  public onRemove(): void {
    // Remove the entity flag for gravity
    this.entity.flags.delete(ActorFlag.HasCollision);

    // Remove the entity collision height
    this.entity.metadata.delete(ActorDataId.Reserved054);

    // Remove the entity collision width
    this.entity.metadata.delete(ActorDataId.Reserved053);
  }

  public onGamemodeChange(): void {
    // Check if the entity is not a player
    if (!this.entity.isPlayer()) return;

    // If the player is now in spectator mode, collision should be disabled
    if (this.entity.gamemode === Gamemode.Spectator)
      this.entity.flags.set(ActorFlag.HasCollision, false);
    // If the player is not in spectator mode, collision should be enabled
    else this.entity.flags.set(ActorFlag.HasCollision, true);
  }
}

export { EntityCollisionTrait };
