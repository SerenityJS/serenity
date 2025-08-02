import { BinaryStream, DataType } from "@serenityjs/binarystream";

class RotationByte extends DataType {
  public static read(stream: BinaryStream): number {
    return stream.readInt8() * (360 / 256);
  }

  public static write(stream: BinaryStream, value: number): void {
    // Normalize the value to the range of -128 to 127.
    value = value / (360 / 256);

    // Clamp the value to the range of -128 to 127.
    if (value < -128) value = -128;
    else if (value > 127) value = 127;

    // Write the value as an int8 to the stream.
    stream.writeInt8(value);
  }
}

export { RotationByte };
