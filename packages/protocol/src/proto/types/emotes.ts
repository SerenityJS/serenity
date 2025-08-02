import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Uuid } from "./uuid";

class Emotes extends DataType {
  public uuid: string;

  public constructor(uuid: string) {
    super();

    this.uuid = uuid;
  }

  public static override read(stream: BinaryStream): Array<Emotes> {
    const emotes: Array<Emotes> = [];

    const amount = stream.readVarInt();

    for (let index = 0; index < amount; index++) {
      const uuid = Uuid.read(stream);
      emotes.push(new Emotes(uuid));
    }

    return emotes;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<Emotes>
  ): void {
    stream.writeVarInt(value.length);

    for (const pack of value) {
      Uuid.write(stream, pack.uuid);
    }
  }
}

export { Emotes };
