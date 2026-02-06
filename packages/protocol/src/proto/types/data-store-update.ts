import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { DataStoreChangeInfo } from "./data-store-change-info";

class DataStoreUpdate extends DataStoreChangeInfo {
  public readonly typeId = 0;

  public constructor(
    public dataStoreName: string,
    public property: string,
    public path: string,
    public data: number | boolean | string,
    public propertyUpdateCount: number,
    public pathUpdateCount: number
  ) {
    super();
  }

  public static read(stream: BinaryStream): DataStoreUpdate {
    stream.offset += 3;

    const dataStoreName = stream.readVarString();
    const property = stream.readVarString();
    const path = stream.readVarString();

    const dataType = stream.readVarInt();
    let data: number | boolean | string;

    console.log({ dataStoreName, property, path, dataType });

    switch (dataType) {
      case 0:
        data = stream.readFloat64(Endianness.Little);
        break;
      case 1:
        data = stream.readBool();
        break;
      case 2:
        data = stream.readVarString();
        break;
      default:
        throw new Error(`Unknown DataStoreUpdate data type ${dataType}`);
    }

    const propertyUpdateCount = stream.readUint32(Endianness.Little);
    const pathUpdateCount = stream.readUint32(Endianness.Little);

    console.log({
      dataStoreName,
      property,
      path,
      data,
      propertyUpdateCount,
      pathUpdateCount
    });

    return new this(
      dataStoreName,
      property,
      path,
      data,
      propertyUpdateCount,
      pathUpdateCount
    );
  }

  public static write(stream: BinaryStream, value: DataStoreUpdate): void {
    stream.writeVarString(value.dataStoreName);
    stream.writeVarString(value.property);
    stream.writeVarString(value.path);

    if (typeof value.data === "number") {
      stream.writeUint32(0, Endianness.Little);
      stream.writeFloat64(value.data);
    } else if (typeof value.data === "boolean") {
      stream.writeUint32(1, Endianness.Little);
      stream.writeBool(value.data);
    } else {
      stream.writeUint32(2, Endianness.Little);
      stream.writeVarString(value.data);
    }

    stream.writeUint32(value.propertyUpdateCount, Endianness.Little);
    stream.writeUint32(value.pathUpdateCount, Endianness.Little);
  }
}

export { DataStoreUpdate };
