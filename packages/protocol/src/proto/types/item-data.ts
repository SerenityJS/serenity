import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemData extends DataType {
  /**
   * The identifier of the item type.
   */
  public identifier: string;

  /**
   * The network identifier of the item type.
   */
  public networkId: number;

  /**
   * Whether the item type is component based.
   */
  public isComponentBased: boolean;

  /**
   * The version of the item type.
   */
  public itemVersion: number;

  /**
   * The additional properties of the item type.
   * This is also known as the vanilla component data.
   */
  public properties: CompoundTag<unknown>;

  /**
   * Creates a new item type.
   * @param identifier The identifier of the item type.
   * @param networkId The network identifier of the item type.
   * @param isComponentBased Whether the item type is component based.
   * @param itemVersion The version of the item type.
   * @param properties The additional properties of the item type.
   */
  public constructor(
    identifier: string,
    networkId: number,
    isComponentBased: boolean,
    itemVersion: number,
    properties: CompoundTag<unknown>
  ) {
    super();

    // Assign the properties of the item type.
    this.identifier = identifier;
    this.networkId = networkId;
    this.isComponentBased = isComponentBased;
    this.itemVersion = itemVersion;
    this.properties = properties;
  }

  public static override read(stream: BinaryStream): Array<ItemData> {
    // Prepare an array to store the data.
    const data: Array<ItemData> = [];

    // Read the number of data.
    const amount = stream.readVarInt();

    // We then loop through the amount of data.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read the identifier of the item.
      const identifier = stream.readVarString();

      // Read the network identifier of the item.
      const networkId = stream.readInt16(Endianness.Little);

      // Read whether the item is component based.
      const componentBased = stream.readBool();

      // Read the version of the item.
      const version = stream.readZigZag();

      // Read the properties of the item.
      const properties = CompoundTag.read(stream, true);

      // Push the data to the array.
      data.push(
        new this(identifier, networkId, componentBased, version, properties)
      );
    }

    // Return the data.
    return data;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<ItemData>
  ): void {
    // Write the number of data given in the array.
    stream.writeVarInt(value.length);

    // Iterate over the data.
    for (const item of value) {
      // Write the identifier of the item.
      stream.writeVarString(item.identifier);

      // Write the network identifier of the item.
      stream.writeInt16(item.networkId, Endianness.Little);

      // Write whether the item is component based.
      stream.writeBool(item.isComponentBased);

      // Write the version of the item.
      stream.writeZigZag(item.itemVersion);

      // Write the properties of the item.
      CompoundTag.write(stream, item.properties, true);
    }
  }
}

export { ItemData };
