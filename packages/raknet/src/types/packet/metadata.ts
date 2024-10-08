import type { Endianness } from "@serenityjs/binarystream";
import type { ValidTypes } from "./valid";

interface PacketMetadata {
  endian: Endianness | boolean;
  name: string;
  parameter: string;
  type: ValidTypes;
}

export type { PacketMetadata };
