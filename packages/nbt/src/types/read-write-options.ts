import type { DataTypeOptions } from "@serenityjs/binarystream";

interface ReadWriteOptions extends DataTypeOptions {
  name: boolean;
  type: boolean;
  varint: boolean;
}

export type { ReadWriteOptions };
