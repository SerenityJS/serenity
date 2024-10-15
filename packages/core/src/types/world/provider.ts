import { AbilityIndex, Rotation, Vector3f } from "@serenityjs/protocol";

import { JSONLikeValue } from "../json";

interface WorldProviderProperties {
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
  components: Map<string, JSONLikeValue>;

  /**
   * The traits attached to the entity.
   */
  traits: Array<string>;
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
  abilities: Map<AbilityIndex, boolean>;
}

export { WorldProviderProperties, EntityEntry, PlayerEntry };
