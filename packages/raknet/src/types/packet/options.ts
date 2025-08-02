import type { DataTypeOptions } from "@serenityjs/binarystream";

type PacketDataTypeOptionsUnknown = string | number | boolean | unknown;

interface PacketDataTypeOptions<T = PacketDataTypeOptionsUnknown>
  extends DataTypeOptions {
  parameter?: T;
  varint?: boolean;
}

export type { PacketDataTypeOptions };
