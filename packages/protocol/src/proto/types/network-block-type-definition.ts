import { DataType } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import type { BinaryStream } from "@serenityjs/binarystream";

class NetworkBlockTypeDefinition extends DataType {
  /**
   * The identifier of the block type definition.
   */
  public readonly identifier: string;

  /**
   * The nbt data for the block type definition.
   * This includes the states, permutations, and other properties of the block type.
   */
  public readonly nbt: CompoundTag<unknown>;

  /**
   * Create a new block definition.
   * @param identifier The identifier of the block type definition.
   * @param nbt The nbt data for the block type definition.
   */
  public constructor(identifier: string, nbt: CompoundTag<unknown>) {
    super();
    this.identifier = identifier;
    this.nbt = nbt;
  }

  public static read(stream: BinaryStream): Array<NetworkBlockTypeDefinition> {
    // Prepare an array to store the properties.
    const properties: Array<NetworkBlockTypeDefinition> = [];

    // Read the number of properties.
    const amount = stream.readVarInt();

    // We then loop through the amount of properties.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read all the fields for the rule.
      const name = stream.readVarString();

      // Read the nbt for the property.
      const nbt = CompoundTag.read(stream, true);

      // Push the rule to the array.
      properties.push(new this(name, nbt));
    }

    // Return the properties.
    return properties;
  }

  public static write(
    stream: BinaryStream,
    value: Array<NetworkBlockTypeDefinition>
  ): void {
    // Write the number of properties given in the array.
    stream.writeVarInt(value.length);

    // Loop through the properties.
    for (const property of value) {
      // Write the fields for the property.
      stream.writeVarString(property.identifier);

      // Write the nbt for the property.
      CompoundTag.write(stream, property.nbt, true);
    }
  }
}

export { NetworkBlockTypeDefinition };
