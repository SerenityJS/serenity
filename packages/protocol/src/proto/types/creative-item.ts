import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

class CreativeItem extends DataType {
  /**
   * The index of the item in the creative menu.
   */
  public itemIndex: number;

  /**
   * The item instance of the creative item.
   */
  public itemInstance: NetworkItemInstanceDescriptor;

  /**
   * The group index of the creative item.
   */
  public groupIndex: number;

  /**
   * Creates a new creative item.
   * @param itemIndex The index of the item in the creative menu.
   * @param itemInstance The item instance of the creative item.
   * @param groupIndex The group index of the creative item.
   */
  public constructor(
    itemIndex: number,
    itemInstance: NetworkItemInstanceDescriptor,
    groupIndex: number
  ) {
    super();

    // Assign the properties of the creative item.
    this.itemIndex = itemIndex;
    this.itemInstance = itemInstance;
    this.groupIndex = groupIndex;
  }

  public static read(stream: BinaryStream): Array<CreativeItem> {
    // Prepare an array to store the items.
    const items: Array<CreativeItem> = [];

    // Read the number of items.
    const amount = stream.readVarInt();

    // We then loop through the amount of items.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read the item index of the item.
      const itemIndex = stream.readVarInt();

      // Read the item instance of the item.
      const itemInstance = NetworkItemInstanceDescriptor.read(stream);

      // Read the group index of the item.
      const groupIndex = stream.readVarInt();

      // Push the item to the array.
      items.push(new this(itemIndex, itemInstance, groupIndex));
    }

    // Return the items.
    return items;
  }

  public static write(stream: BinaryStream, value: Array<CreativeItem>): void {
    // Write the number of items given in the array.
    stream.writeVarInt(value.length);

    // Loop through the length of the items.
    for (const element of value) {
      // Write the item index of the item.
      stream.writeVarInt(element.itemIndex);

      // Write the item instance of the item.
      NetworkItemInstanceDescriptor.write(stream, element.itemInstance);

      // Write the group index of the item.
      stream.writeVarInt(element.groupIndex);
    }
  }
}

export { CreativeItem };
