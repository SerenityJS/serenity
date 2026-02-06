import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { DataStoreValueType } from "../../enums";
import { DataStoreChangeAction } from "../../enums/data-store-change-action";
import { DataStorePropertyValueKind } from "../../types/data-store-property-value-kind";

import { DataStoreChangeOptions } from "./data-store-change-options";
import { DataStoreSetPropertyOptions } from "./data-store-set-property-options";
import { DataStoreSetPropertyPathOptions } from "./data-store-set-property-path-options";

class DataStoreChangeInfoEntry extends DataType {
  public constructor(public value: DataStoreChangeOptions) {
    super();
  }

  public static read(stream: BinaryStream): DataStoreChangeInfoEntry {
    const changeType = stream.readVarInt();
    const dataStoreId = stream.readVarString();
    if (changeType === DataStoreChangeAction.ClearDataStore)
      return new this(DataStoreChangeOptions.createClear(dataStoreId));

    // SetProperty
    const property = stream.readVarString();
    if (changeType === DataStoreChangeAction.SetPropertyValue) {
      const _updateCount = stream.readUint32(Endianness.Little);
      console.log(_updateCount);
      const value = this.readDynamic(stream);
      return new this(
        DataStoreChangeOptions.createSetProperty(dataStoreId, property, value)
      );
    }

    if (changeType === DataStoreChangeAction.SetPropertyPathValue) {
      // SetPropertyPath
      const path = stream.readVarString();
      const value = this.readDynamic(stream);
      const _propertyUpdateCount = stream.readUint32(Endianness.Little);
      const _pathUpdateCount = stream.readUint32(Endianness.Little);
      console.log(_pathUpdateCount, _propertyUpdateCount);
      return new this(
        DataStoreChangeOptions.createSetPropertyPath(
          dataStoreId,
          property,
          path,
          value
        )
      );
    }

    throw new Error(`Unknown DataStoreChangeInfo changeType ${changeType}`);
  }

  public static write(
    stream: BinaryStream,
    entry: DataStoreChangeInfoEntry
  ): void {
    stream.writeVarInt(entry.value.action);
    stream.writeVarString(entry.value.dataStoreId);
    if (entry.value.action === DataStoreChangeAction.ClearDataStore) return;
    if (entry.value instanceof DataStoreSetPropertyOptions) {
      // Property
      stream.writeVarString(entry.value.property);
      // Update Count
      stream.writeUint32(0, Endianness.Little);
      // Value
      this.writeDynamic(stream, entry.value.value);
    } else if (entry.value instanceof DataStoreSetPropertyPathOptions) {
      // Property
      stream.writeVarString(entry.value.property);
      // Property Path
      stream.writeVarString(entry.value.path);
      // Value
      this.writeDynamic(stream, entry.value.value);
      // Update Count
      stream.writeUint32(0, Endianness.Little);
      // Update Path Count
      stream.writeUint32(0, Endianness.Little);
    }
  }
  protected static writeDynamic(
    stream: BinaryStream,
    value: DataStorePropertyValueKind
  ): void {
    switch (typeof value) {
      case "number":
        stream.writeUint32(2, Endianness.Little);
        stream.writeUint64(BigInt(value as number), Endianness.Little);
        return;
      case "boolean":
        stream.writeUint32(DataStoreValueType.Boolean, Endianness.Little);
        stream.writeBool(value as boolean);
        return;
      case "string":
        stream.writeUint32(4, Endianness.Little);
        stream.writeVarString(value as string);
        return;
      case "object": {
        stream.writeUint32(DataStoreValueType.Compound, Endianness.Little);
        const properties = Object.getOwnPropertyNames(value);
        stream.writeVarInt(properties.length);
        for (const key of properties) {
          stream.writeVarString(key);
          this.writeDynamic(stream, value[key as keyof typeof value]);
        }
        return;
      }
      default:
        throw new TypeError(
          "Invalid dynamic type for datastore property " + typeof value
        );
    }
  }
  protected static readDynamic(
    stream: BinaryStream
  ): DataStorePropertyValueKind {
    const type = stream.readUint32(Endianness.Little);
    switch (type) {
      case DataStoreValueType.Number: //Number, thats not number for sure bruh, or idk lets not use it for now
        console.error("I dont thing this is intiger bruh");
        return stream.readFloat64(Endianness.Little);
      case DataStoreValueType.Boolean:
        return stream.readBool();
      case 2:
        return Number(stream.readUint64(Endianness.Little));
      case 4: {
        //Also string?
        const str = stream.readVarString();
        console.log("String type: " + type, str, str.length);
        return str;
      }
      case DataStoreValueType.Compound: {
        const value: Record<string, DataStorePropertyValueKind> = {};
        const count = stream.readVarInt();
        for (let i = 0; i < count; i++) {
          const key = stream.readVarString();
          const data = this.readDynamic(stream);
          value[key] = data;
        }
        return value;
      }
      default:
        throw new TypeError(
          `Fatal error, can't read DDUI property value with unknown type of, type of ${type}, at ${stream.offset.toString(16)}`
        );
    }
  }
}

export { DataStoreChangeInfoEntry };
