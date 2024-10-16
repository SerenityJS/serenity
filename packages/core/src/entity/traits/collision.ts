import {
  ActorDataId,
  ActorDataType,
  ActorFlag,
  DataItem
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityCollision extends EntityTrait {
  public static readonly identifier = "collision";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The height of the entity collision box.
   */
  public height: number = 1.7;

  /**
   * The width of the entity collision box.
   */
  public width: number = 0.6;

  public onSpawn(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.has(ActorFlag.HasCollision)) {
      // Set the entity flag for gravity
      this.entity.flags.set(ActorFlag.HasCollision, true);
    }

    // Check if the entity has a metadata value for collision height
    if (!this.entity.metadata.has(ActorDataId.Reserved054)) {
      // Set the default height value
      this.setHeight(this.height);
    }

    // Check if the entity has a metadata value for collision width
    if (!this.entity.metadata.has(ActorDataId.Reserved053)) {
      // Set the default width value
      this.setWidth(this.width);
    }
  }

  /**
   * Sets the height of the entity collision box.
   * @param height The height of the entity collision box.
   */
  public setHeight(height: number): void {
    // Create a new DataItem object
    const data = new DataItem(
      ActorDataId.Reserved054,
      ActorDataType.Float,
      height
    );

    // Set the entity collision height
    this.entity.metadata.set(ActorDataId.Reserved054, data);

    // Update the height value
    this.height = height;
  }

  /**
   * Sets the width of the entity collision box.
   * @param width The width of the entity collision box.
   */
  public setWidth(width: number): void {
    // Create a new DataItem object
    const data = new DataItem(
      ActorDataId.Reserved053,
      ActorDataType.Float,
      width
    );

    // Set the entity collision width
    this.entity.metadata.set(ActorDataId.Reserved053, data);

    // Update the width value
    this.width = width;
  }
}

export { EntityCollision };
