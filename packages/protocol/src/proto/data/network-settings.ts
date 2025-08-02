import {
  Bool,
  Endianness,
  Float32,
  Uint16,
  Uint8
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type CompressionMethod, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.NetworkSettings)
class NetworkSettingsPacket extends DataPacket {
  @Serialize(Uint16, { endian: Endianness.Little })
  public compressionThreshold!: number;

  @Serialize(Uint16, { endian: Endianness.Little })
  public compressionMethod!: CompressionMethod;

  @Serialize(Bool) public clientThrottle!: boolean;
  @Serialize(Uint8) public clientThreshold!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public clientScalar!: number;
}

export { NetworkSettingsPacket };
