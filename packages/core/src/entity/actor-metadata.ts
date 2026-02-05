import {
  ActorDataId,
  ActorDataType,
  BlockPosition,
  DataItem,
  SetActorDataPacket,
  Vector3f
} from "@serenityjs/protocol";
import { CompoundTag } from "@serenityjs/nbt";

import { Entity } from "./entity";

// Map the ActorDataType to the corresponding type
interface EntityActorMetadataValue {
  [ActorDataType.Byte]: number;
  [ActorDataType.Short]: number;
  [ActorDataType.Int]: number;
  [ActorDataType.Float]: number;
  [ActorDataType.String]: string;
  [ActorDataType.CompoundTag]: CompoundTag;
  [ActorDataType.BlockPos]: BlockPosition;
  [ActorDataType.Long]: bigint;
  [ActorDataType.Vec3]: Vector3f;
}

// Union type of all possible metadata value types
type EntityActorMetadataValueUnion =
  EntityActorMetadataValue[keyof EntityActorMetadataValue];

class EntityActorMetadata {
  /**
   * The entity that this metadata set is attached to.
   */
  private readonly entity: Entity;

  /**
   * The map of actor metadata for this entity.
   */
  private readonly metadata = new Map<ActorDataId, DataItem>();

  /**
   * Whether to silently set metadata without sending updates.
   */
  private silent = false;

  /**
   * Create a new EntityActorMetadata instance.
   * @param entity The entity that this metadata set is attached to.
   */
  public constructor(entity: Entity, silent = false) {
    // Assign the entity to the private field
    this.entity = entity;
    this.silent = silent;
  }

  /**
   * Get all actor metadata as an array of tuples.
   * @returns An array of tuples containing the actor metadata id, type, and value.
   */
  public getAllActorMetadata(): Array<
    [ActorDataId, ActorDataType, EntityActorMetadataValueUnion]
  > {
    return Array.from(this.metadata.entries()).map(([id, item]) => [
      id,
      item.type,
      item.value as EntityActorMetadataValueUnion
    ]);
  }

  /**
   * Check if the entity has a metadata value for the given identifier.
   * @param id The metadata identifier.
   * @returns True if the entity has a metadata value for the given identifier, false otherwise.
   */
  public hasActorMetadata(id: ActorDataId): boolean {
    return this.metadata.has(id);
  }

  /**
   * Get a metadata value for the entity.
   * @param id The metadata identifier.
   * @param type The metadata type.
   * @returns The metadata value, or null if it does not exist or the type does not match.
   */
  public getActorMetadata<T extends ActorDataType>(
    id: ActorDataId,
    type: T
  ): EntityActorMetadataValue[T] | null {
    // Get the data item from the map
    const dataItem = this.metadata.get(id);

    // If the data item exists and the type matches, return the value
    if (dataItem && dataItem.type === type) {
      return dataItem.value as EntityActorMetadataValue[T];
    }

    // Otherwise, return null
    return null;
  }

  /**
   * Set a metadata value for the entity.
   * @param id The metadata identifier.
   * @param type The metadata type, or null to delete the metadata.
   * @param value The metadata value, corresponding to the type, or null to delete the metadata.
   */
  public setActorMetadata<
    T extends ActorDataType,
    V extends EntityActorMetadataValue[T]
  >(id: ActorDataId, type?: T | null, value?: V | null): void {
    // Check if the type or value is null or undefined, if so delete the metadata
    if (
      type === null ||
      value === null ||
      type === undefined ||
      value === undefined
    ) {
      this.metadata.delete(id);
    } else {
      // Create a new data item
      const dataItem = new DataItem(id, type, value);

      // Set the metadata in the map
      this.metadata.set(id, dataItem);

      // If not silent, send an update packet
      if (!this.silent) {
        // Create a new SetActorDataPacket
        const packet = new SetActorDataPacket();
        packet.runtimeEntityId = this.entity.runtimeId;
        packet.inputTick = this.entity.isPlayer()
          ? this.entity.inputInfo.tick
          : this.entity.dimension.world.currentTick;
        packet.data = this.getAllActorMetadataAsDataItems();
        packet.properties =
          this.entity.sharedProperties.getSharedPropertiesAsSyncData();

        // Iterate over the flags set on the entity
        for (const [flat, enabled] of this.entity.flags.getAllActorFlags())
          packet.setActorFlag(flat, enabled);

        // Send the packet to the dimension
        this.entity.dimension.broadcast(packet);
      }
    }
  }

  /**
   * Get all actor metadata as an array of DataItems.
   * @returns An array of DataItems containing all actor metadata.
   */
  public getAllActorMetadataAsDataItems(): Array<DataItem> {
    return Array.from(this.metadata.values());
  }

  /**
   * Clone the actor metadata from one entity to another.
   * @param source The source entity actor metadata.
   * @param target The target entity.
   * @returns The cloned entity actor metadata.
   */
  public static clone(
    source: EntityActorMetadata,
    target: Entity,
    silent = false
  ): EntityActorMetadata {
    // Create a new EntityActorMetadata instance for the target entity
    const cloned = new EntityActorMetadata(target, silent);

    // Iterate over the source metadata and copy each item to the cloned metadata
    for (const [id, item] of source.metadata.entries()) {
      // Create a new DataItem and set it in the cloned metadata
      cloned.metadata.set(id, new DataItem(id, item.type, item.value));
    }

    // Return the cloned metadata
    return cloned;
  }
}

export { EntityActorMetadata };
