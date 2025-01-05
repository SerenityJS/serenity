import { IPosition, SerializedSkin } from "@serenityjs/protocol";

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

interface PlaySoundOptions {
  /**
   * The position to play the sound at.
   * If not provided, the sound will be played at the player's current position.
   */
  position?: IPosition;

  /**
   * The volume level of the sound.
   */
  volume?: number;

  /**
   * The pitch level of the sound.
   */
  pitch?: number;
}

export { PlayerProperties, PlaySoundOptions };
