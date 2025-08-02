import { BinaryStream } from "@serenityjs/binarystream";

class Framer {
  public static unframe(buffer: Buffer): Array<Buffer> {
    const stream = new BinaryStream(buffer);
    const frames: Array<Buffer> = [];

    do {
      const length = stream.readVarInt();
      const buffer = stream.read(length);

      frames.push(buffer);
    } while (!stream.feof());

    return frames;
  }

  public static frame(...buffers: Array<Buffer>): Buffer {
    const stream = new BinaryStream();

    for (const buffer of buffers) {
      stream.writeVarInt(buffer.length);
      stream.write(buffer);
    }

    return stream.getBuffer();
  }
}

export { Framer };
