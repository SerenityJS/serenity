import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { DataStoreValueType } from "../../enums";

import { DataStoreChangeInfo } from "./data-store-change-info";

class DataStoreChange extends DataStoreChangeInfo {
  public readonly typeId = 1;

  public constructor(
    public dataStoreName: string,
    public property: string,
    public updateCount: number,
    public value: boolean | number | string
  ) {
    super();
  }

  public static read(stream: BinaryStream): DataStoreChange {
    const dataStoreName = stream.readVarString();
    const property = stream.readVarString();
    const updateCount = stream.readUint32(Endianness.Little);

    let value: boolean | number | string;

    const valueType: DataStoreValueType = stream.readVarInt();

    switch (valueType) {
      case DataStoreValueType.Boolean:
        value = stream.readBool();
        break;
      case DataStoreValueType.Double:
        value = stream.readFloat64(Endianness.Little);
        break;
      case DataStoreValueType.String:
        value = stream.readVarString();
        break;
      default:
        throw new Error(`Unknown DataStoreChange value type ${valueType}`);
    }

    console.log({
      dataStoreName,
      property,
      updateCount,
      value
    });

    return new this(dataStoreName, property, updateCount, value);
  }

  public static write(stream: BinaryStream, value: DataStoreChange): void {
    stream.writeVarString(value.dataStoreName);
    stream.writeVarString(value.property);
    stream.writeUint32(value.updateCount, Endianness.Little);

    if (typeof value.value === "boolean") {
      stream.writeBool(value.value);
    } else if (typeof value.value === "number") {
      stream.writeFloat64(value.value);
    } else {
      stream.writeVarString(value.value);
    }
  }
}

export { DataStoreChange };
