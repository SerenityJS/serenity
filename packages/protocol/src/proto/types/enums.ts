import {
  Uint16,
  Uint32,
  Uint8,
  type BinaryStream,
  type Endianness
} from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

/**
 * Represents a enum for the available command packet.
 */
class Enums extends DataType {
  /**
   * The name of the enum.
   */
  public readonly name: string;

  /**
   * The indexed values of the enum.
   */
  public readonly values: Array<number>;

  /**
   * Creates a new enum.
   * @param name The name of the enum.
   * @param values The indexed values of the enum.
   */
  public constructor(name: string, values: Array<number>) {
    super();
    this.name = name;
    this.values = values;
  }

  public static override read(
    stream: BinaryStream,
    endian: Endianness,
    enumValues: Array<string>
  ): Array<Enums> {
    // Prepare an array to store the enums.
    const enums: Array<Enums> = [];

    // Read the number of enums
    const amount = stream.readVarInt();

    // We then loop through the amount of enums
    // Reading the string from the stream.
    for (let index = 0; index < amount; index++) {
      // Read the name of the enum.
      const name = stream.readVarString();

      // Prepare an array to store the values of the enum.
      const values: Array<number> = [];

      // Read the number of values in the enum.
      const valueAmount = stream.readVarInt();

      // We then loop through the amount of values in the enum.
      // Reading the value from the stream.
      for (let index = 0; index < valueAmount; index++) {
        // length < 0xff ? 0 : length < 0xffff ? 1 : 2
        const method =
          enumValues.length < 0xff
            ? Uint8
            : enumValues.length < 0xff_ff
              ? Uint16
              : Uint32;

        // Read the value and push it to the array.
        values.push(method.read(stream, endian));
      }

      // Push the enum to the array.
      enums.push(new Enums(name, values));
    }

    // Return the enums.
    return enums;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<Enums>,
    endian: Endianness,
    enumValues: Array<string>
  ): void {
    // Write the number of enums.
    stream.writeVarInt(value.length);

    // We then loop through the enums.
    // Writing the string to the stream.
    for (const enumValue of value) {
      // Write the name of the enum.
      stream.writeVarString(enumValue.name);

      // Write the number of values in the enum.
      stream.writeVarInt(enumValue.values.length);

      // We then loop through the values in the enum.
      // Writing the value to the stream.
      for (const value of enumValue.values) {
        // length < 0xff ? 0 : length < 0xffff ? 1 : 2
        const method =
          enumValues.length < 0xff
            ? Uint8
            : enumValues.length < 0xff_ff
              ? Uint16
              : Uint32;

        // Write the value to the stream.
        method.write(stream, value, endian);
      }
    }
  }
}

export { Enums };
