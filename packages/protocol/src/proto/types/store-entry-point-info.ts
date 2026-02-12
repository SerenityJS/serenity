import { BinaryStream, DataType } from "@serenityjs/binarystream";

class StoreEntryPointInfo extends DataType {
  public storeId: string;

  public storeName: string;

  public constructor(storeId: string, storeName: string) {
    super();
    this.storeId = storeId;
    this.storeName = storeName;
  }

  public static read(stream: BinaryStream): StoreEntryPointInfo {
    const storeId = stream.readVarString();
    const storeName = stream.readVarString();

    return new this(storeId, storeName);
  }

  public static write(stream: BinaryStream, value: StoreEntryPointInfo): void {
    stream.writeVarString(value.storeId);
    stream.writeVarString(value.storeName);
  }
}

export { StoreEntryPointInfo };
