import { DataType } from "@serenityjs/raknet";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

import type { BinaryStream } from "@serenityjs/binarystream";

class CreativeItem extends DataType {
  /**
   * The network identifier of the creative item.
   */
  public networkId: number;

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
   * @param networkId The network identifier of the creative item.
   * @param itemInstance The item instance of the creative item.
   * @param groupIndex The group index of the creative item.
   */
  public constructor(
    networkId: number,
    itemInstance: NetworkItemInstanceDescriptor,
    groupIndex: number
  ) {
    super();

    // Assign the properties of the creative item.
    this.networkId = networkId;
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
      // Read the network identifier of the item.
      const networkId = stream.readVarInt();

      // Read the item instance of the item.
      const itemInstance = NetworkItemInstanceDescriptor.read(stream);

      // Read the group index of the item.
      const groupIndex = stream.readVarInt();

      // Push the item to the array.
      items.push(new this(networkId, itemInstance, groupIndex));
    }

    // Return the items.
    return items;
  }

  public static write(stream: BinaryStream, value: Array<CreativeItem>): void {
    // Write the number of items given in the array.
    stream.writeVarInt(value.length);

    // Loop through the length of the items.
    for (const element of value) {
      // Write the network identifier of the item.
      stream.writeVarInt(element.networkId);

      // Write the item instance of the item.
      NetworkItemInstanceDescriptor.write(stream, element.itemInstance);

      // Write the group index of the item.
      stream.writeVarInt(element.groupIndex);
    }
  }
}

export { CreativeItem };
