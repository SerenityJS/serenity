import { PermissionLevel, SerializedSkin } from "@serenityjs/protocol";

import { PlayerEntry } from "../world";

import { EntityProperties } from "./entity";

interface PlayerProperties extends EntityProperties {
  username: string;
  xuid: string;
  uuid: string;
  permission: PermissionLevel;
  skin: SerializedSkin;
  entry?: PlayerEntry;
}

export { PlayerProperties };
