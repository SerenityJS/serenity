import { AbilityIndex, ActorFlag } from "@serenityjs/protocol";

import { JSONLikeObject, JSONLikeValue } from "../json";
import { BlockIdentifier, EntityIdentifier, ItemIdentifier } from "../../enums";

interface WorldProviderProperties {
  /**
   * The path of the world provider.
   */
  path: string;
}

interface EntityEntry extends JSONLikeObject {
  /**
   * The unique identifier of the entity.
   */
  uniqueId: string;

  /**
   * The type identifier of the entity.
   */
  identifier: EntityIdentifier;

  /**
   * The spawn position of the entity.
   */
  position: [number, number, number];

  /**
   * The rotation of the entity.
   */
  rotation: [number, number, number];

  /**
   * The dynamic properties attached to the entity.
   */
  dynamicProperties: Array<[string, JSONLikeValue]>;

  /**
   * The traits attached to the entity.
   */
  traits: Array<string>;

  /**
   * The metadata attached to the entity.
   * Serialized as a base64 string.
   */
  metadata: string;

  /**
   * The flags attached to the entity.
   */
  flags: Array<[ActorFlag, boolean]>;

  /**
   * The attributes attached to the entity.
   * Serialized as a base64 string.
   */
  attributes: string;

  /**
   * The scoreboard identity identifier attached to the entity.
   */
  scoreboardIdentity: string;
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
   * The metadata value of the item stack.
   */
  metadata: number;

  /**
   * The traits attached to the item stack.
   */
  traits: Array<string>;

  /**
   * The dynamic properties attached to the item stack.
   */
  dynamicProperties: Array<[string, JSONLikeValue]>;

  /**
   * The nbt data serialized as a base64 string.
   */
  nbtProperties: string;
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
   * The dynamic properties attached to the block.
   */
  dynamicProperties: Array<[string, JSONLikeValue]>;

  /**
   * The nbt data serialized as a base64 string.
   */
  nbtProperties: string;
}

export {
  WorldProviderProperties,
  EntityEntry,
  PlayerEntry,
  ItemStackEntry,
  BlockEntry
};
