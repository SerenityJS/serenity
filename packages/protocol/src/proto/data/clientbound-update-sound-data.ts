import { Endianness, Uint64 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { SoundDataUpdate } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Updates an in-flight sound identified by its server sound handle.
 * Each slot is always written; unused slots are sent as `SoundDataUpdateType.Stop`.
 */
@Proto(Packet.ClientboundUpdateSoundData)
class ClientboundUpdateSoundDataPacket extends DataPacket {
  @Serialize(Uint64, { endian: Endianness.Little })
  public serverSoundHandle!: bigint;

  @Serialize(SoundDataUpdate) public stop!: SoundDataUpdate;
  @Serialize(SoundDataUpdate) public setVolume!: SoundDataUpdate;
  @Serialize(SoundDataUpdate) public setPitch!: SoundDataUpdate;
  @Serialize(SoundDataUpdate) public fade!: SoundDataUpdate;
  @Serialize(SoundDataUpdate) public seekTo!: SoundDataUpdate;
  @Serialize(SoundDataUpdate) public pause!: SoundDataUpdate;
  @Serialize(SoundDataUpdate) public resume!: SoundDataUpdate;
}

export { ClientboundUpdateSoundDataPacket };
