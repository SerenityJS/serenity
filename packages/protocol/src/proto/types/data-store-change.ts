import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";
import { DataStorePropertyValue } from "./data-store-property-value";

class DataStoreChange extends DataStoreChangeInfo {
  /**
   * The type identifier for a property update change.
   */
  public readonly typeId = 1;

  /**
   * The name of the data store that was updated. This is used to identify which data store was updated when reading from the binary stream.
   */
  public dataStoreName: string;

  /**
   * The name of the property that was updated.
   */
  public property: string;

  /**
   * The number of times the property has been updated, including this update. This is used to determine if an update is out of order or if an update was missed.
   */
  public updateCount: number;

  /**
   * The new value of the property after the update. This is used to update the client with the new value of the property after the update.
   */
  public readonly value: DataStorePropertyValue;

  /**
   * Creates a new instance of the DataStoreChange class.
   * @param dataStoreName The name of the data store that was updated.
   * @param property The name of the property that was updated.
   * @param updateCount The number of times the property has been updated, including this update.
   * @param value The new value of the property after the update.
   */
  public constructor(
    dataStoreName: string,
    property: string,
    updateCount: number,
    value: DataStorePropertyValue
  ) {
    super();
    this.dataStoreName = dataStoreName;
    this.property = property;
    this.updateCount = updateCount;
    this.value = value;
  }

  public static read(stream: BinaryStream): DataStoreChange {
    // Read the name of the data store that was updated from the binary stream
    const dataStoreName = stream.readVarString();
    const property = stream.readVarString();
    const updateCount = stream.readUint32(Endianness.Little);
    const value = DataStorePropertyValue.read(stream);

    // Create and return a new instance of the DataStoreChange class with the read values
    return new this(dataStoreName, property, updateCount, value);
  }

  public static write(stream: BinaryStream, value: DataStoreChange): void {
    // Write the name of the data store that was updated to the binary stream
    stream.writeVarString(value.dataStoreName);
    stream.writeVarString(value.property);
    stream.writeUint32(value.updateCount, Endianness.Little);
    DataStorePropertyValue.write(stream, value.value);
  }
}

export { DataStoreChange };
