import {
  Endianness,
  Uint8,
  Uint32,
  Uint64,
  VarString,
  Bool
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type PackType } from "../../enums";
import { ByteArray } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackDataInfo)
class ResourcePackDataInfoPacket extends DataPacket {
  /**
   * The unique identifier for the resource pack.
   */
  @Serialize(VarString) public uuid!: string;

  /**
   * The chunk size for the resource pack data.
   */
  @Serialize(Uint32, { endian: Endianness.Little }) public chunkSize!: number;

  /**
   * The total number of chunks in the resource pack.
   */
  @Serialize(Uint32, { endian: Endianness.Little }) public chunkCount!: number;

  /**
   * The file size of the resource pack in bytes.
   */
  @Serialize(Uint64, { endian: Endianness.Little }) public fileSize!: bigint;

  /**
   * The hash of the file, used for verification.
   */
  @Serialize(ByteArray) public fileHash!: Buffer;

  /**
   * Indicates whether the resource pack is a premium pack.
   * Premium packs require an entitlement to access.
   */
  @Serialize(Bool) public isPremium!: boolean;

  /**
   * The type of the resource pack, such as behavior or texture pack.
   * @see {@link PackType}
   */
  @Serialize(Uint8) public packType!: PackType;
}

export { ResourcePackDataInfoPacket };
