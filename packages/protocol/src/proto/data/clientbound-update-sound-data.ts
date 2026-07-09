import { Endianness, Uint64, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundUpdateSoundData)
class ClientboundUpdateSoundDataPacket extends DataPacket {
  @Serialize(Uint64, { endian: Endianness.Little })
  public serverSoundHandle!: bigint;
  /**
   * Not sure if the events are same as in LevelSoundEventPacket or not
   * but both are strings so it is possible
   */
  @Serialize(VarString) public soundEvent!: string;
}

export { ClientboundUpdateSoundDataPacket };
