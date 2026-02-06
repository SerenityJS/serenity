import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";
import { DataStoreUpdate } from "./data-store-update";
import { DataStoreChange } from "./data-store-change";
import { DataStoreRemoval } from "./data-store-removal";

class DataStoreChangeInfoEntry extends DataType {
  public constructor(public value: DataStoreChangeInfo) {
    super();
  }

  public static read(stream: BinaryStream): DataStoreChangeInfoEntry {
    const changeType = stream.readVarInt();

    console.log({ changeType });

    switch (changeType) {
      case 0:
        return new this(DataStoreUpdate.read(stream));
      case 1:
        return new this(DataStoreChange.read(stream));
      case 2:
        return new this(DataStoreRemoval.read(stream));
      default:
        throw new Error(`Unknown DataStoreChangeInfo changeType ${changeType}`);
    }
  }

  public static write(
    stream: BinaryStream,
    entry: DataStoreChangeInfoEntry
  ): void {
    stream.writeVarInt(entry.value.typeId);

    if (entry.value instanceof DataStoreUpdate) {
      DataStoreUpdate.write(stream, entry.value);
    } else if (entry.value instanceof DataStoreChange) {
      DataStoreChange.write(stream, entry.value);
    } else if (entry.value instanceof DataStoreRemoval) {
      DataStoreRemoval.write(stream, entry.value);
    }
  }
}

export { DataStoreChangeInfoEntry };
