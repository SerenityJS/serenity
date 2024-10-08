import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.StopSound)
class StopSoundPacket extends DataPacket {
  @Serialize(VarString)
  public soundName!: string;

  @Serialize(Bool)
  public stopAllSounds!: boolean;

  @Serialize(Bool)
  // Legacy
  public stopMusic!: boolean;
}

export { StopSoundPacket };
