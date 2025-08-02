import { BinaryStream, DataType } from "@serenityjs/binarystream";

class PlayerInputTick extends DataType {
  public static read(stream: BinaryStream): bigint {
    // Read a VarLong from the stream
    const tick = stream.readVarLong();

    // Return a new instance of this class with the input tick
    return tick;
  }

  public static write(stream: BinaryStream, value: bigint): void {
    // Write a VarLong to the stream
    stream.writeVarLong(value);
  }
}

export { PlayerInputTick };
