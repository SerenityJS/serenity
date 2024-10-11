import { Rotation, Vector3f } from "@serenityjs/protocol";
import { CompoundTag, NamedBinaryTag } from "@serenityjs/nbt";

import { Dimension } from "../world";
import { EntityIdentifier } from "../enums";

import { EntityType } from "./identity";

class Entity {
  public static runtimeId = 0n;

  // public readonly properties: EntityProperties;

  public readonly type: EntityType;

  public readonly runtimeId = ++Entity.runtimeId;

  public readonly uniqueId: bigint;

  public readonly position = new Vector3f(0, 0, 0);

  public readonly velocity = new Vector3f(0, 0, 0);

  public readonly rotation = new Rotation(0, 0, 0);

  public dimension: Dimension;

  public constructor(
    dimension: Dimension,
    type: EntityType | EntityIdentifier
  ) {
    // Assign the dimension and type to the entity
    this.dimension = dimension;
    this.type =
      type instanceof EntityType ? type : (EntityType.get(type) as EntityType);

    // Create a unique id for the entity
    this.uniqueId = Entity.createUniqueId(this.type.network, this.runtimeId);
  }

  public static createUniqueId(network: number, runtimeId: bigint): bigint {
    // Generate a unique id for the entity
    const unique = BigInt(Math.abs(Date.now() >> 4) & 0x1_ff);

    return BigInt(network << 19) | (unique << 10n) | runtimeId;
  }
}

export { Entity };
