import type { PacketDataTypeOptions } from "./options";
import type { DataType } from "@serenityjs/binarystream";

interface PacketMetadata {
  name: string;
  type: typeof DataType;
  options?: PacketDataTypeOptions;
}

export type { PacketMetadata };
