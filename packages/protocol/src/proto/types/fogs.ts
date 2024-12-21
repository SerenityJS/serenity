import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class Fogs extends DataType {
  public fogs: Array<string>;

  public constructor(fogs: Array<string> = []) {
    super();
    this.fogs = fogs;
  }

  public static read(stream: BinaryStream): Fogs {
    const fogs = new Fogs();
    const length = stream.readVarInt();
    for (let i = 0; i < length; i++) {
      const fog = stream.readVarString();
      fogs.fogs.push(fog);
    }
    return fogs;
  }

  public static write(stream: BinaryStream, value: Fogs): void {
    stream.writeVarInt(value.fogs.length);
    for (const fog of value.fogs) {
      stream.writeVarString(fog);
    }
  }
}

export { Fogs };
