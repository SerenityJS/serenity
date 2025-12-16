import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";

import { ItemInstanceUserData } from "./item-instance-user-data";

/**
 * Represents a network item stack descriptor.
 */
class NetworkItemStackDescriptor extends DataType {
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
   * Creates an instance of NetworkItemStackDescriptor.
   * @param id The network id of the item.
   * @param stackSize The size of the stack.
   * @param metadata The metadata of the item.
   * @param itemStackId The network id of the item stack.
   * @param networkBlockid The network block id of the item.
   * @param extras The extra data of the item.
   */
  public constructor(
    network: number,
    stackSize?: number | null,
    metadata?: number | null,
    itemStackId?: number | null,
    networkBlockid?: number | null,
    extras?: ItemInstanceUserData | null
  ) {
    super();
    this.network = network;
    this.stackSize = stackSize ?? null;
    this.metadata = metadata ?? null;
    this.itemStackId = itemStackId ?? null;
    this.networkBlockId = networkBlockid ?? null;
    this.extras = extras ?? null;
  }

  public static read(stream: BinaryStream): NetworkItemStackDescriptor {
    // Read the network id of the item.
    const network = stream.readZigZag();

    // Check if the network id is 0.
    // If it is, then we return an empty value. (air)
    if (network === 0) return new NetworkItemStackDescriptor(network);

    // Read the remaining fields of the item.
    const stackSize = stream.readUint16(Endianness.Little);
    const metadata = stream.readVarInt();

    // Check if the stack net id should be included.
    const itemStackId = stream.readBool() ? stream.readZigZag() : null;

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
    return new NetworkItemStackDescriptor(
      network,
      stackSize,
      metadata,
      itemStackId,
      networkBlockId,
      extras
    );
  }

  public static write(
    stream: BinaryStream,
    value: NetworkItemStackDescriptor
  ): void {
    // Write the network id of the item.
    stream.writeZigZag(value.network);

    // Check if the network id is 0.
    // If it is, then we return an empty value. (air)
    if (value.network === 0) return;

    // Write the remaining fields of the item.
    stream.writeUint16(value.stackSize ?? 0, Endianness.Little);
    stream.writeVarInt(value.metadata ?? 0);

    // Check if the stack net id should be included.
    if (value.itemStackId) {
      // Write a boolean to indicate that the stack net id is included.
      // Then write the stack net id.
      stream.writeBool(true);
      stream.writeZigZag(value.itemStackId);
    } else {
      // Write a boolean to indicate that the stack net id is not included.
      stream.writeBool(false);
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

export { NetworkItemStackDescriptor };
