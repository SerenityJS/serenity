import {
  AbilityIndex,
  ActorDataId,
  ActorFlag,
  Attribute,
  AttributeName,
  DataItem,
  Rotation,
  Vector3f
} from "@serenityjs/protocol";

import { JSONLikeObject, JSONLikeValue } from "../json";
import { BlockIdentifier, EntityIdentifier, ItemIdentifier } from "../../enums";

interface WorldProviderProperties {
  /**
   * The path of the world provider.
   */
  path: string;
}

interface EntityEntry {
  /**
   * The unique identifier of the entity.
   */
  uniqueId: bigint;

  /**
   * The type identifier of the entity.
   */
  identifier: EntityIdentifier;

  /**
   * The spawn position of the entity.
   */
  position: Vector3f;

  /**
   * The rotation of the entity.
   */
  rotation: Rotation;

  /**
   * The components attached to the entity.
   */
  components: Array<[string, JSONLikeValue]>;

  /**
   * The traits attached to the entity.
   */
  traits: Array<string>;

  /**
   * The metadata attached to the entity.
   */
  metadata: Array<[ActorDataId, DataItem]>;

  /**
   * The flags attached to the entity.
   */
  flags: Array<[ActorFlag, boolean]>;

  /**
   * The attributes attached to the entity.
   */
  attributes: Array<[AttributeName, Attribute]>;

  /**
   * The scoreboard identity identifier attached to the entity.
   */
  scoreboardIdentity: bigint;
}

interface PlayerEntry extends EntityEntry {
  /**
   * The username of the player.
   */
  username: string;

  /**
   * The xuid of the player.
   */
  uuid: string;

  /**
   * The xuid of the player.
   */
  xuid: string;

  /**
   * The abilities of the player.
   */
  abilities: Array<[AbilityIndex, boolean]>;
}

interface ItemStackEntry extends JSONLikeObject {
  /**
   * The identifier of the item stack.
   */
  identifier: ItemIdentifier;

  /**
   * The amount of the item stack.
   */
  amount: number;

  /**
   * The auxillary data of the item stack.
   */
  auxillary: number;

  /**
   * The traits attached to the item stack.
   */
  traits: Array<string>;

  /**
   * The components attached to the item stack.
   */
  components: Array<[string, JSONLikeValue]>;
}

interface BlockEntry extends JSONLikeObject {
  /**
   * The identifier of the block.
   */
  identifier: BlockIdentifier;

  /**
   * The permutation of the block.
   */
  permutation: number;

  /**
   * The position of the block.
   */
  position: [number, number, number];

  /**
   * The traits attached to the block.
   */
  traits: Array<string>;

  /**
   * The components attached to the block.
   */
  components: Array<[string, JSONLikeValue]>;
}

export {
  WorldProviderProperties,
  EntityEntry,
  PlayerEntry,
  ItemStackEntry,
  BlockEntry
};
