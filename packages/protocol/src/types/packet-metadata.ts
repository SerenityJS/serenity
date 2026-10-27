import type { PacketDataTypeOptions } from "./packet-data-type-options";
import type { DataType } from "@serenityjs/binarystream";

interface PacketMetadata {
  name: string;
  type: typeof DataType;
  options?: PacketDataTypeOptions;
}

export type { PacketMetadata };
