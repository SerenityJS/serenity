import { BinaryStream, DataType } from "@serenityjs/binarystream";

class UpdateSoftEnumData extends DataType {
  public values: Array<string>;

  public constructor(values: Array<string>) {
    super();
    this.values = values;
  }

  public static read(stream: BinaryStream): UpdateSoftEnumData {
    const receiptCount = stream.readVarInt();
    const entries: Array<string> = [];

    for (let i = 0; i < receiptCount; i++) {
      entries.push(stream.readVarString());
    }

    return new UpdateSoftEnumData(entries);
  }

  public static write(stream: BinaryStream, value: UpdateSoftEnumData): void {
    stream.writeVarInt(value.values.length);

    for (const entry of value.values) {
      stream.writeVarString(entry);
    }
  }
}

export { UpdateSoftEnumData };
