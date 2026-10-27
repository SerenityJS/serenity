import { Endianness, Uint64 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { SoundDataUpdate } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Updates an in-flight sound identified by its server sound handle.
 * Since v2225, a single tagged update is sent per packet.
 */
@Proto(Packet.ClientboundUpdateSoundData)
class ClientboundUpdateSoundDataPacket extends DataPacket {
  /**
   * The server sound handle of the sound instance to update.
   */
  @Serialize(Uint64, { endian: Endianness.Little })
  public serverSoundHandle!: bigint;

  /**
   * The update to apply to the sound instance.
   */
  @Serialize(SoundDataUpdate) public event!: SoundDataUpdate;
}

export { ClientboundUpdateSoundDataPacket };
