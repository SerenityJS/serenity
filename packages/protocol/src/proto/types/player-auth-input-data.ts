import { DataType } from "@serenityjs/raknet";

import { InputData } from "../../enums";

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
  public static setFlag(
    data: PlayerAuthInputData,
    flag: InputData,
    value: boolean
  ): void {
    // Mask the flag with the flags of the input data.
    const flagBit = 1n << BigInt(flag);

    // Set the flag based on the value.
    if (value) {
      data.flags |= flagBit;
    } else {
      data.flags &= ~flagBit;
    }
  }

  /**
   * Check if the input data has a flag.
   * @param flag The flag to check.
   * @returns Whether the input data has the flag.
   */
  public static hasFlag(data: PlayerAuthInputData, flag: InputData): boolean {
    // Mask the flag with the flags of the input data.
    const flagBit = 1n << BigInt(flag);

    // Return whether the flag is set.
    return (data.flags & flagBit) !== 0n;
  }

  /**
   * Gets all the flags of the input data.
   * @returns An array of flags.
   */
  public static getFlags(data: PlayerAuthInputData): Array<InputData> {
    // Prepare an array to store the flags.
    const flags: Array<InputData> = [];

    // Get the values of the input data.q
    const inputDataValues = Object.values(InputData).filter(
      (value) => typeof value === "number"
    );

    // Iterate over the values of the input data.
    for (const value of inputDataValues) {
      // Check if the input data has the flag.
      if (this.hasFlag(data, value as InputData)) {
        // Add the flag to the array.
        flags.push(value as InputData);
      }
    }

    // Return the array of flags.
    return flags;
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
