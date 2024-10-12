import { DataType } from "@serenityjs/raknet";

import type { InputData } from "../../enums";
import type { BinaryStream } from "@serenityjs/binarystream";

export class PlayerAuthInputData extends DataType {
  /**
   * The flags of the input data.
   */
  public flags: bigint;

  /**
   * Creates a new instance of PlayerAuthInputData.
   * @param flags The flags of the input data.
   */
  public constructor(flags: bigint) {
    super();
    this.flags = flags;
  }

  /**
   * Set a flag of the input data.
   * @param flag The flag to set.
   * @param value The value to set the flag to.
   */
  public setFlag(flag: InputData, value: boolean): void {
    // Mask the flag with the flags of the input data.
    const flagBit = 1n << BigInt(flag);

    // Set the flag based on the value.
    if (value) {
      this.flags |= flagBit;
    } else {
      this.flags &= ~flagBit;
    }
  }

  /**
   * Check if the input data has a flag.
   * @param flag The flag to check.
   * @returns Whether the input data has the flag.
   */
  public hasFlag(flag: InputData): boolean {
    // Mask the flag with the flags of the input data.
    const flagBit = 1n << BigInt(flag);

    // Return whether the flag is set.
    return (this.flags & flagBit) !== 0n;
  }

  public static write(stream: BinaryStream, value: PlayerAuthInputData): void {
    // Write the flags of the input data.
    stream.writeVarLong(value.flags);
  }

  public static read(stream: BinaryStream): PlayerAuthInputData {
    // Read the flags of the input data.
    const flags = stream.readVarLong();

    // Return a new instance of PlayerAuthInputData.
    return new this(flags);
  }
}
