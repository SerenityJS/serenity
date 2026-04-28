import { BinaryStream } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";

class DataStoreRemoval extends DataStoreChangeInfo {
  /**
   * The type identifier for a data store removal. This is used to identify the type of change when reading from the binary stream.
   */
  public readonly typeId = 2;

  /**
   * The name of the data store that was removed. This is used to identify which data store was removed when reading from the binary stream.
   */
  public dataStoreName: string;

  /**
   * Creates a new instance of the DataStoreRemoval class.
   * @param dataStoreName The name of the data store that was removed.
   */
  public constructor(dataStoreName: string) {
    super();
    this.dataStoreName = dataStoreName;
  }

  public static read(stream: BinaryStream): DataStoreRemoval {
    // Read the name of the data store that was updated from the binary stream
    const dataStoreName = stream.readVarString();

    // Create and return a new instance of the DataStoreRemoval class with the read values
    return new this(dataStoreName);
  }

  public static write(stream: BinaryStream, value: DataStoreRemoval): void {
    // Write the name of the data store that was updated to the binary stream
    stream.writeVarString(value.dataStoreName);
  }
}

export { DataStoreRemoval };
