import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class PlayerInputTick extends DataType {
  /**
   * The current input tick of the player.
   */
  public readonly tick: bigint;

  /**
   * Creates a new instance of the PlayerInputTick class.
   * @param tick The current input tick of the player.
   */
  public constructor(tick: bigint) {
    super();
    this.tick = tick;
  }

  public static read(stream: BinaryStream): PlayerInputTick {
    // Read a VarLong from the stream
    const tick = stream.readVarLong();

    // Return a new instance of this class with the input tick
    return new this(tick);
  }

  public static write(stream: BinaryStream, value: PlayerInputTick): void {
    // Write a VarLong to the stream
    stream.writeVarLong(value.tick);
  }
}

export { PlayerInputTick };
