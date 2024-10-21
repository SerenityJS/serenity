import {
  AbilityIndex,
  ActorDataId,
  ActorFlag,
  Attribute,
  AttributeName,
  DataItem,
  Gamemode,
  PermissionLevel,
  Rotation,
  Vector3f
} from "@serenityjs/protocol";

import { JSONLikeValue } from "../json";

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
  identifier: string;

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
   * The permission level of the player.
   */
  permission: PermissionLevel;

  /**
   * The gamemode of the player.
   */
  gamemode: Gamemode;

  /**
   * The abilities of the player.
   */
  abilities: Array<[AbilityIndex, boolean]>;
}

export { WorldProviderProperties, EntityEntry, PlayerEntry };
