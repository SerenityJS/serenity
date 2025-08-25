import { BinaryStream, DataType } from "@serenityjs/binarystream";

class AnimateEntity extends DataType {
  public static read(stream: BinaryStream): Array<bigint> {
    const elements: Array<bigint> = [];

    const amount = stream.readVarInt();

    for (let index = 0; index < amount; index++) {
      elements.push(stream.readVarLong());
    }

    return elements;
  }

  public static write(stream: BinaryStream, value: Array<bigint>): void {
    stream.writeVarInt(value.length);

    for (const runtimeId of value) {
      stream.writeVarLong(runtimeId);
    }
  }
}

export { AnimateEntity };
