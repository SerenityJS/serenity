import { ActorDataId, ActorDataType } from "@serenityjs/protocol";
import { ByteTag, StringTag } from "@serenityjs/nbt";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityNameableTrait extends EntityTrait {
  public static readonly identifier = "nameable";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * Get the nametag of the entity.
   * @returns The nametag of the entity
   */
  public getNametag(): string {
    // Get the nametag from the entity storage
    const nametag = this.entity.getStorageEntry<StringTag>("CustomName");

    // If the nametag exists, return its value
    if (nametag) return nametag.valueOf();

    // Otherwise, return an empty string
    return "";
  }

  /**
   * Set the nametag of the entity.
   * @param nametag
   */
  public setNametag(nametag: string): void {
    // Set the nametag in the entity metadata
    this.entity.metadata.setActorMetadata(
      ActorDataId.Name,
      ActorDataType.String,
      nametag
    );

    // Set the CustomName tag in the storage
    this.entity.setStorageEntry("CustomName", new StringTag(nametag));
  }

  /**
   * Get whether the nametag is always visible.
   * @returns Whether the nametag is always visible.
   */
  public getNametagAlwaysVisible(): boolean {
    // Get the nametag visibility from the entity metadata
    const visibility =
      this.entity.getStorageEntry<ByteTag>("CustomNameVisible");

    // If the visibility exists, return its boolean value
    if (visibility) return Boolean(visibility.valueOf());

    // Otherwise, return false
    return false;
  }

  /**
   * Set whether the nametag is always visible.
   * @param visible Whether the nametag should be always visible.
   */
  public setNametagAlwaysVisible(visible: boolean): void {
    // Set the nametag visibility in the entity metadata
    this.entity.metadata.setActorMetadata(
      ActorDataId.NametagAlwaysShow,
      ActorDataType.Byte,
      visible ? 1 : 0
    );

    // Set the CustomNameVisible tag in the storage
    this.entity.setStorageEntry(
      "CustomNameVisible",
      new ByteTag(visible ? 1 : 0)
    );
  }

  public onAdd(): void {
    // Ensure the nametag & visibility are synced when the trait is added
    this.setNametag(this.getNametag());
    this.setNametagAlwaysVisible(this.getNametagAlwaysVisible());
  }

  public onRemove(): void {
    // Delete the nametag from the entity metadata when the trait is removed
    this.entity.metadata.setActorMetadata(
      ActorDataId.Name,
      ActorDataType.String,
      null
    );

    // Remove the CustomName tag from the storage
    this.entity.removeStorageEntry("CustomName");

    // Delete the nametag visibility from the entity metadata when the trait is removed
    this.entity.metadata.setActorMetadata(
      ActorDataId.NametagAlwaysShow,
      ActorDataType.Byte,
      null
    );

    // Remove the CustomNameVisible tag from the storage
    this.entity.removeStorageEntry("CustomNameVisible");
  }
}

export { EntityNameableTrait };
