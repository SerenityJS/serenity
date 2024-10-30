import { SerializedSkin } from "@serenityjs/protocol";

import { PlayerEntry } from "../world";
import { Device } from "../../entity";

import { EntityProperties } from "./entity";

interface PlayerProperties extends EntityProperties {
  username: string;
  xuid: string;
  uuid: string;
  skin: SerializedSkin;
  device: Device;
  entry?: PlayerEntry;
}

export { PlayerProperties };
