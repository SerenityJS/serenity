import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { DataStorePropertyValueType } from "../../enums";

/**
 * Represents a value of a property in a data store update, which can be of various types including null, string, bigint, boolean, or another nested DataStorePropertyValue for compound types.
 */
type DataStorePropertyDynamicValue =
  | null
  | string
  | bigint
  | boolean
  | Record<string, DataStorePropertyValue>;

class DataStorePropertyValue extends DataType {
  /**
   * The type of the property value.
   */
  public readonly type: DataStorePropertyValueType;

  /**
   * The value of the property.
   */
  public readonly value: DataStorePropertyDynamicValue;

  /**
   * Creates a new instance of DataStorePropertyValue.
   * @param type The type of the property value.
   * @param value The value of the property, which can be null, a string, a bigint, a boolean, or another DataStorePropertyValue for nested values.
   */
  public constructor(
    type: DataStorePropertyValueType,
    value: DataStorePropertyDynamicValue
  ) {
    super();
    this.type = type;
    this.value = value;
  }

  public static read(stream: BinaryStream): DataStorePropertyValue {
    // Read the type of the property value
    const type: DataStorePropertyValueType = stream.readUint32(
      Endianness.Little
    );

    // Prepare a variable to hold the value of the property
    let value: DataStorePropertyDynamicValue;

    // Switch on the type of the property value to read the appropriate value from the stream
    switch (type) {
      case DataStorePropertyValueType.None: {
        value = null;
        break;
      }

      case DataStorePropertyValueType.Boolean: {
        value = stream.readBool();
        break;
      }

      case DataStorePropertyValueType.Int64: {
        value = stream.readInt64(Endianness.Little);
        break;
      }

      case DataStorePropertyValueType.String: {
        value = stream.readVarString();
        break;
      }

      case DataStorePropertyValueType.Type: {
        // Prepare a record to hold the key-value pairs of the compound type
        const record = {} as Record<string, DataStorePropertyValue>;

        // Read the length of the compound type record
        const length = stream.readVarInt();

        // Iterate over the length of the record to read each key and its corresponding property value
        for (let i = 0; i < length; i++) {
          // Read the key of the property value
          const key = stream.readVarString();

          // Read the property value corresponding to the key
          const propertyValue = DataStorePropertyValue.read(stream);

          // Set the key and its corresponding property value in the record
          record[key] = propertyValue;
        }

        value = record;
        break;
      }
    }

    // Return a new instance of DataStorePropertyValue with the read type and value
    return new this(type, value);
  }

  public static write(
    stream: BinaryStream,
    value: DataStorePropertyValue
  ): void {
    // Write the type of the property value to the stream
    stream.writeUint32(value.type, Endianness.Little);

    // Switch on the type of the property value to write the appropriate value to the stream
    switch (value.type) {
      case DataStorePropertyValueType.None: {
        // No value to write for None type
        break;
      }

      case DataStorePropertyValueType.Boolean: {
        stream.writeBool(value.value as boolean);
        break;
      }

      case DataStorePropertyValueType.Int64: {
        stream.writeInt64(value.value as bigint, Endianness.Little);
        break;
      }

      case DataStorePropertyValueType.String: {
        stream.writeVarString(value.value as string);
        break;
      }

      case DataStorePropertyValueType.Type: {
        // Cast the value to a record of string keys and DataStorePropertyValue values for compound types
        const record = value.value as Record<string, DataStorePropertyValue>;

        // Write the length of the compound type record to the stream
        stream.writeVarInt(Object.keys(record).length);

        // Iterate over each key-value pair in the record to write the key and its corresponding property value to the stream
        for (const [key, propertyValue] of Object.entries(record)) {
          // Write the key of the property value to the stream
          stream.writeVarString(key);

          // Write the property value corresponding to the key to the stream
          DataStorePropertyValue.write(stream, propertyValue);
        }
        break;
      }
    }
  }
}

export { DataStorePropertyValue, DataStorePropertyDynamicValue };
