import { BlockPosition } from "./block-position";

import type { BinaryStream } from "@serenityjs/binarystream";

class SignedBlockPosition extends BlockPosition {
  public static read(stream: BinaryStream): SignedBlockPosition {
    // Read the x, y, and z coordinates of the block position.
    const x = stream.readZigZag();
    const y = stream.readZigZag();
    const z = stream.readZigZag();

    // Return a new instance of this class with the x, y, and z coordinates.
    return new this(x, y, z);
  }

  public static write(stream: BinaryStream, value: SignedBlockPosition): void {
    // Write the x, y, and z coordinates of the block position.
    stream.writeZigZag(value.x);
    stream.writeZigZag(value.y);
    stream.writeZigZag(value.z);
  }
}

export { SignedBlockPosition };
