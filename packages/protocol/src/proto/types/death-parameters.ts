import { BinaryStream, DataType } from "@serenityjs/binarystream";

class DeathParameters extends DataType {
  public message: string;

  public constructor(message: string) {
    super();

    this.message = message;
  }

  public static override read(stream: BinaryStream): Array<DeathParameters> {
    const entries: Array<DeathParameters> = [];

    const amount = stream.readVarInt();

    for (let index = 0; index < amount; index++) {
      const message = stream.readVarString();
      entries.push(new DeathParameters(message));
    }

    return entries;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<DeathParameters>
  ): void {
    stream.writeVarInt(value.length);

    for (const entry of value) {
      stream.writeVarString(entry.message);
    }
  }
}

export { DeathParameters };
