import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";

class DataStoreUpdate extends DataStoreChangeInfo {
  /**
   * The type identifier for a data store update.
   */
  public readonly typeId = 0;

  /**
   * The name of the data store that was updated. This is used to identify which data store was updated when reading from the binary stream.
   */
  public dataStoreName: string;

  /**
   * The name of the property that was updated. This is used to identify which property was updated when reading from the binary stream.
   */
  public property: string;

  /**
   * The path of the property that was updated. This is used to identify which property was updated when reading from the binary stream.
   */
  public path: string;

  /**
   * The new value of the property after the update. This is used to update the client with the new value of the property after the update.
   */
  public value: number | boolean | string;

  /**
   * The number of times the property has been updated, including this update. This is used to determine if an update is out of order or if an update was missed.
   */
  public propertyUpdateCount: number;

  /**
   * The number of times the property has been updated, including this update. This is used to determine if an update is out of order or if an update was missed.
   */
  public pathUpdateCount: number;

  /**
   * Creates a new instance of the DataStoreUpdate class.
   * @param dataStoreName The name of the data store that was updated.
   * @param property The name of the property that was updated. This is used to identify which property was updated when reading from the binary stream.
   * @param path The path of the property that was updated. This is used to identify which property was updated when reading from the binary stream.
   * @param value The new value of the property after the update.
   * @param propertyUpdateCount The number of times the property has been updated, including this update.
   * @param pathUpdateCount The number of times the property has been updated, including this update. This is used to determine if an update is out of order or if an update was missed.
   */
  public constructor(
    dataStoreName: string,
    property: string,
    path: string,
    value: number | boolean | string,
    propertyUpdateCount: number,
    pathUpdateCount: number
  ) {
    super();
    this.dataStoreName = dataStoreName;
    this.property = property;
    this.value = value;
    this.path = path;
    this.propertyUpdateCount = propertyUpdateCount;
    this.pathUpdateCount = pathUpdateCount;
  }

  public static read(stream: BinaryStream): DataStoreUpdate {
    // Read the name of the data store that was updated from the binary stream
    const dataStoreName = stream.readVarString();
    const property = stream.readVarString();
    const path = stream.readVarString();

    // Read the type of the value from the binary stream to determine how to read the value
    const valueType = stream.readVarInt();

    // Prepare a variable to hold the value of the property after reading it from the stream
    let value: number | boolean | string;

    // Switch on the type of the value to read the appropriate value from the stream based on its type
    switch (valueType) {
      case 0: {
        value = stream.readFloat64(Endianness.Little);
        break;
      }

      case 1: {
        value = stream.readBool();
        break;
      }

      case 2: {
        value = stream.readVarString();
        break;
      }

      default: {
        throw new Error(`Unknown value type: ${valueType}`);
      }
    }

    // Read the property update count and path update count from the binary stream to determine if any updates were missed or if the update is out of order
    const propertyUpdateCount = stream.readUint32(Endianness.Little);
    const pathUpdateCount = stream.readUint32(Endianness.Little);

    // Return a new instance of the DataStoreUpdate class with the read values
    return new this(
      dataStoreName,
      property,
      path,
      value,
      propertyUpdateCount,
      pathUpdateCount
    );
  }

  public static write(stream: BinaryStream, value: DataStoreUpdate): void {
    // Write the name of the data store that was updated to the binary stream
    stream.writeVarString(value.dataStoreName);
    stream.writeVarString(value.property);
    stream.writeVarString(value.path);

    // Determine the type of the value and write the appropriate type identifier to the binary stream
    if (typeof value.value === "number") {
      stream.writeVarInt(0);
      stream.writeFloat64(value.value, Endianness.Little);
    } else if (typeof value.value === "boolean") {
      stream.writeVarInt(1);
      stream.writeBool(value.value);
    } else if (typeof value.value === "string") {
      stream.writeVarInt(2);
      stream.writeVarString(value.value);
    } else {
      throw new Error(`Unsupported value type: ${typeof value.value}`);
    }

    stream.writeUint32(value.propertyUpdateCount, Endianness.Little);
    stream.writeUint32(value.pathUpdateCount, Endianness.Little);
  }
}

export { DataStoreUpdate };
