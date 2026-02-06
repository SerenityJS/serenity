import { BinaryStream } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";

class DataStoreRemoval extends DataStoreChangeInfo {
  public readonly typeId = 2;

  public constructor(public dataStoreName: string) {
    super();
  }

  public static read(stream: BinaryStream): DataStoreRemoval {
    return new this(stream.readVarString());
  }

  public static write(stream: BinaryStream, value: DataStoreRemoval): void {
    stream.writeVarString(value.dataStoreName);
  }
}

export { DataStoreRemoval };
