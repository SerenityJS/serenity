import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

class NbtLoop extends DataType {
  public data: CompoundTag<unknown> | null;

  public constructor(data: CompoundTag<unknown> | null) {
    super();
    this.data = data;
  }

  public static read(stream: BinaryStream): NbtLoop {
    try {
      const buffer = stream.readRemainingBuffer();
      const wrappedBuffer = new BinaryStream(
        Buffer.concat([Buffer.from([0x0a, 0x00]), buffer, Buffer.from([0x00])])
      );
      const compound = CompoundTag.read(wrappedBuffer, true);
      return new NbtLoop(compound);
    } catch (reason) {
      throw new Error(`Error reading NbtLoop: ${(reason as Error).message}`);
    }
  }

  public static write(stream: BinaryStream, entry: NbtLoop): void {
    if (entry.data === null) {
      stream.writeBuffer(Buffer.from([0x00]));
      return;
    }

    try {
      const tempStream = new BinaryStream();
      CompoundTag.write(tempStream, entry.data, true);
      const buffer = tempStream.getBuffer();

      // Remove the compound wrapper (first 2 bytes and last byte)
      const unwrappedBuffer = buffer.slice(2, buffer.length - 1);

      stream.writeBuffer(unwrappedBuffer);
    } catch (reason) {
      throw new Error(`Error writing NbtLoop: ${(reason as Error).message}`);
    }
  }
}

export { NbtLoop };
