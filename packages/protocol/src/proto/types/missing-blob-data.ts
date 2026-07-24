import { BinaryStream, DataType } from "@serenityjs/binarystream";

class MissingBlobData extends DataType {
  public id: bigint;
  public data: string;

  public constructor(id: bigint, data: string) {
    super();

    this.id = id;
    this.data = data;
  }

  public static override read(stream: BinaryStream): Array<MissingBlobData> {
    const entries: Array<MissingBlobData> = [];

    const count = stream.readVarInt();

    for (let i = 0; i < count; i++) {
      const id = stream.readUint64();
      const data = stream.readVarString();

      entries.push(new this(id, data));
    }

    return entries;
  }

  public static override write(
    stream: BinaryStream,
    entries: Array<MissingBlobData>
  ): void {
    stream.writeVarInt(entries.length);

    for (const entry of entries) {
      stream.writeUint64(entry.id);
      stream.writeVarString(entry.data);
    }
  }
}

export { MissingBlobData };
