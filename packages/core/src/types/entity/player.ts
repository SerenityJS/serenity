import { PermissionLevel } from "@serenityjs/protocol";

import { EntityProperties } from "./entity";

interface PlayerProperties extends EntityProperties {
  username: string;
  xuid: string;
  uuid: string;
  permission: PermissionLevel;
}

export { PlayerProperties };
