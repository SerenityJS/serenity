import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class RotationByte extends DataType {
  public static read(stream: BinaryStream): number {
    return stream.readInt8() * (360 / 256);
  }

  public static write(stream: BinaryStream, value: number): void {
    stream.writeInt8(value / (360 / 256));
  }
}

export { RotationByte };
