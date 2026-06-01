import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";

import { ItemInstanceUserData } from "./item-instance-user-data";

/**
 * Represents a network item stack descriptor.
 */
class NetworkItemStackDescriptorCereal extends DataType {
  /**
   * The network id of the item.
   */
  public readonly network: number;

  /**
   * The size of the stack.
   */
  public readonly stackSize: number | null;

  /**
   * The metadata of the item.
   */
  public readonly metadata: number | null;

  /**
   * The item stack variant.
   */
  public readonly itemStackVariant: number | null;

  /**
   * The network id of the item stack.
   */
  public readonly itemStackId: number | null;

  /**
   * The network block id of the item.
   */
  public readonly networkBlockId: number | null;

  /**
   * The extra data of the item.
   */
  public readonly extras: ItemInstanceUserData | null;

  /**
   * Creates an instance of NetworkItemStackDescriptorCereal.
   * @param id The network id of the item.
   * @param stackSize The size of the stack.
   * @param metadata The metadata of the item.
   * @param itemStackVariant The item stack variant.
   * @param itemStackId The network id of the item stack.
   * @param networkBlockid The network block id of the item.
   * @param extras The extra data of the item.
   */
  public constructor(
    network: number,
    stackSize?: number | null,
    metadata?: number | null,
    itemStackVariant?: number | null,
    itemStackId?: number | null,
    networkBlockid?: number | null,
    extras?: ItemInstanceUserData | null
  ) {
    super();
    this.network = network;
    this.stackSize = stackSize ?? null;
    this.metadata = metadata ?? null;
    this.itemStackVariant = itemStackVariant ?? null;
    this.itemStackId = itemStackId ?? null;
    this.networkBlockId = networkBlockid ?? null;
    this.extras = extras ?? null;
  }

  public static read(stream: BinaryStream): NetworkItemStackDescriptorCereal {
    // Read the network id of the item.
    const network = stream.readInt16(Endianness.Little);
    const stackSize = stream.readUint16(Endianness.Little);
    const metadata = stream.readVarInt();

    // Read if the stack net id information is included.
    const hasStackNetId = stream.readBool();
    const itemStackVariant = hasStackNetId ? stream.readVarInt() : null;
    const itemStackId = hasStackNetId ? stream.readZigZag() : null;

    // Read the block runtime id.
    const networkBlockId = stream.readZigZag();

    // Check if the item has extra data.
    const length = stream.readVarInt();

    // The length will indicate if extra data is present.
    // If it is, we read the extra data.
    const extras =
      length > 0
        ? ItemInstanceUserData.read(stream, { parameter: network })
        : null;

    // Return the item instance descriptor.
    return new NetworkItemStackDescriptorCereal(
      network,
      stackSize,
      metadata,
      itemStackVariant,
      itemStackId,
      networkBlockId,
      extras
    );
  }

  public static write(
    stream: BinaryStream,
    value: NetworkItemStackDescriptorCereal
  ): void {
    // Write the network id of the item.
    stream.writeInt16(value.network, Endianness.Little);
    stream.writeUint16(value.stackSize ?? 0, Endianness.Little);
    stream.writeVarInt(value.metadata ?? 0);

    // Check if the stack net id should be included.
    const hasStackNetId =
      value.itemStackVariant !== null && value.itemStackId !== null;

    // Write if the stack net id information is included.
    stream.writeBool(hasStackNetId);
    if (hasStackNetId) {
      stream.writeVarInt(value.itemStackVariant ?? 0);
      stream.writeZigZag(value.itemStackId ?? 0);
    }

    // Write the block runtime id.
    stream.writeZigZag(value.networkBlockId ?? 0);

    // Check if the item has extra data.
    // If it does, we need to first create a new stream,
    // And then write the extra data to the stream.
    // We then write the length of the stream to the main stream, and then write the stream.
    if (value.extras) {
      // Create a new stream for the extra data.
      const extras = new BinaryStream();

      // Write the extra data to the stream.
      ItemInstanceUserData.write(extras, value.extras, {
        parameter: value.network
      });

      // Get the buffer from the extras stream.
      const buffer = extras.getBuffer();

      // Write the length of the extra data to the main stream.
      stream.writeVarInt(buffer.length);

      // Write the extra data to the main stream.
      stream.write(buffer);
    } else {
      // Write 0 to the main stream, since there is no extra data.
      stream.writeVarInt(0);
    }
  }
}

export { NetworkItemStackDescriptorCereal };
