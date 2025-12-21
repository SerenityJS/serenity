import {
  Uint32,
  BinaryStream,
  DataType,
  Endianness
} from "@serenityjs/binarystream";

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

  public static override read(stream: BinaryStream): Array<Enums> {
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
        values.push(Uint32.read(stream, { endian: Endianness.Little }));
      }

      // Push the enum to the array.
      enums.push(new Enums(name, values));
    }

    // Return the enums.
    return enums;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<Enums>
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
        Uint32.write(stream, value, { endian: Endianness.Little });
      }
    }
  }
}

export { Enums };
