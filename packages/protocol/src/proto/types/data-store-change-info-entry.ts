import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";
import { DataStoreUpdate } from "./data-store-update";
import { DataStoreChange } from "./data-store-change";
import { DataStoreRemoval } from "./data-store-removal";

class DataStoreChangeInfoEntry extends DataType {
  public static read(stream: BinaryStream): DataStoreChangeInfo {
    // Read the change type to determine which subclass to instantiate
    const changeType = stream.readVarInt();

    // Switch on the change type to read the appropriate subclass of DataStoreChangeInfo
    switch (changeType) {
      case 0:
        return DataStoreUpdate.read(stream);
      case 1:
        return DataStoreChange.read(stream);
      case 2:
        return DataStoreRemoval.read(stream);
      default:
        throw new Error(`Unknown DataStoreChangeInfo changeType ${changeType}`);
    }
  }

  public static write(stream: BinaryStream, entry: DataStoreChangeInfo): void {
    // Write the type identifier of the change to the binary stream to indicate which subclass of DataStoreChangeInfo is being written
    stream.writeVarInt(entry.typeId);

    // Switch on the type identifier of the change to write the appropriate subclass of DataStoreChangeInfo to the binary stream
    switch (entry.typeId) {
      case 0:
        DataStoreUpdate.write(stream, entry as DataStoreUpdate);
        break;
      case 1:
        DataStoreChange.write(stream, entry as DataStoreChange);
        break;
      case 2:
        DataStoreRemoval.write(stream, entry as DataStoreRemoval);
        break;
      default:
        throw new Error(`Unknown DataStoreChangeInfo typeId ${entry.typeId}`);
    }
  }
}

export { DataStoreChangeInfoEntry };
