import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { CreativeItemCategory } from "../../enums";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

class CreativeGroup extends DataType {
  /**
   * The category of the creative group.
   */
  public category: CreativeItemCategory;

  /**
   * The name of the creative group.
   */
  public name: string;

  /**
   * The icon of the creative group.
   */
  public icon: NetworkItemInstanceDescriptor;

  /**
   * Creates a new creative group.
   * @param category The category of the creative group.
   * @param name The name of the creative group.
   * @param icon The icon of the creative group.
   */
  public constructor(
    category: CreativeItemCategory,
    name: string,
    icon: NetworkItemInstanceDescriptor
  ) {
    super();

    // Assign the properties of the creative group.
    this.category = category;
    this.name = name;
    this.icon = icon;
  }

  public static read(stream: BinaryStream): Array<CreativeGroup> {
    // Prepare an array to store the creative groups.
    const groups: Array<CreativeGroup> = [];

    // Read the amount of creative groups.
    const amount = stream.readVarInt();

    // Iterate over the amount of creative groups.
    for (let i = 0; i < amount; i++) {
      // Read the category of the creative group.
      const category = stream.readInt32(Endianness.Little);

      // Read the name of the creative group.
      const name = stream.readVarString();

      // Read the icon of the creative group.
      const icon = NetworkItemInstanceDescriptor.read(stream);

      // Add the creative group to the array.
      groups.push(new this(category, name, icon));
    }

    // Return the array of creative groups.
    return groups;
  }

  public static write(stream: BinaryStream, value: Array<CreativeGroup>): void {
    // Write the amount of creative groups.
    stream.writeVarInt(value.length);

    // Iterate over the creative groups.
    for (const group of value) {
      // Write the category of the creative group.
      stream.writeInt32(group.category, Endianness.Little);

      // Write the name of the creative group.
      stream.writeVarString(group.name);

      // Write the icon of the creative group.
      NetworkItemInstanceDescriptor.write(stream, group.icon);
    }
  }
}

export { CreativeGroup };
