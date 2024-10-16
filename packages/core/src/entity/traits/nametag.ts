import {
  ActorDataId,
  ActorDataType,
  ActorFlag,
  DataItem
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityNameTagTrait extends EntityTrait {
  public static readonly identifier = "nametag";

  public static readonly types = [EntityIdentifier.Player];

  public onSpawn(): void {
    // Check if the entity has a metadata value for the entity name tag
    if (!this.entity.metadata.has(ActorDataId.Name)) {
      // Get the default name tag value
      const nametag = this.entity.isPlayer() ? this.entity.username : String();

      // Set the default name tag value
      this.setNameTag(nametag);
    }

    // Check if the entity has a metadata value for the entity name tag visibility
    if (!this.entity.metadata.has(ActorDataId.NametagAlwaysShow)) {
      // Set the default name tag visibility value
      if (this.entity.isPlayer()) {
        // Player name tags are always visible
        this.setVisibility(true);
      } else {
        // Other entity name tags are not always visible
        this.setVisibility(false);
      }
    }
  }

  /**
   * Sets the name tag of the entity.
   * @param name The name tag of the entity.
   */
  public setNameTag(name: string): void {
    // Create a new DataItem object
    const data = new DataItem(ActorDataId.Name, ActorDataType.String, name);

    // Set the entity collision height
    this.entity.metadata.set(ActorDataId.Name, data);
  }

  /**
   * Gets the name tag of the entity.
   * @returns The name tag of the entity.
   */
  public getNameTag(): string {
    // Get the metadata value for the entity name tag
    const data = this.entity.metadata.get(ActorDataId.Name);

    // Check if the metadata value is valid
    return data ? (data.value as string) : String();
  }

  /**
   * Gets whether the name tag of the entity is always visible.
   * @returns Whether the name tag of the entity is always visible.
   */
  public getVisibility(): boolean {
    // Get the metadata value for the entity name tag visibility
    const data = this.entity.metadata.get(ActorDataId.NametagAlwaysShow);

    // Check if the metadata value is valid
    return data ? (data.value as number) === 1 : false;
  }

  /**
   * Sets whether the name tag of the entity is always visible.
   * @param visible Whether the name tag of the entity is always visible.
   */
  public setVisibility(visible: boolean): void {
    // Create a new DataItem object
    const data = new DataItem(
      ActorDataId.NametagAlwaysShow,
      ActorDataType.Byte,
      visible ? 1 : 0
    );

    // Set the entity collision height
    this.entity.metadata.set(ActorDataId.NametagAlwaysShow, data);
    this.entity.flags.set(ActorFlag.AlwaysShowName, visible); // ? Not sure why this is both in metadata and flags
  }
}

export { EntityNameTagTrait };
