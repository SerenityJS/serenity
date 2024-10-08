import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { ItemInstanceUserData } from "./item-instance-user-data";

class NetworkItemInstanceDescriptor extends DataType {
  public network: number;
  public stackSize: number | null;
  public metadata: number | null;
  public networkBlockId: number | null;
  public extras: ItemInstanceUserData | null;

  /**
   * Creates an instance of NetworkItemInstanceDescriptor.
   * @param id The network id of the item.
   * @param stackSize The size of the stack.
   * @param metadata The metadata of the item.
   * @param auxValue The aux value of the item.
   * @param userData The user data of the item.
   */
  public constructor(
    network: number,
    stackSize?: number | null,
    metadata?: number | null,
    networkBlockId?: number | null,
    extras?: ItemInstanceUserData | null
  ) {
    super();
    this.network = network;
    this.stackSize = stackSize ?? null;
    this.metadata = metadata ?? null;
    this.networkBlockId = networkBlockId ?? null;
    this.extras = extras ?? null;
  }

  public static read(stream: BinaryStream): NetworkItemInstanceDescriptor {
    // Read the network id of the item.
    const network = stream.readZigZag();

    // Check if the network id is 0.
    // If it is, then we return an empty value. (air)
    if (network === 0) return new NetworkItemInstanceDescriptor(network);

    // Read the remaining fields of the item.
    const stackSize = stream.readUint16(Endianness.Little);
    const metadata = stream.readVarInt();
    const networkBlockId = stream.readZigZag();

    // Check if the item has extra data.
    const length = stream.readVarInt();
    const extras =
      length > 0
        ? ItemInstanceUserData.read(stream, Endianness.Little, network)
        : null;

    // Return the item instance descriptor.
    return new NetworkItemInstanceDescriptor(
      network,
      stackSize,
      metadata,
      networkBlockId,
      extras
    );
  }

  public static write(
    stream: BinaryStream,
    value: NetworkItemInstanceDescriptor
  ): void {
    // Write the network id of the item.
    stream.writeZigZag(value.network);

    // Check if the network id is 0.
    // If it is, then we return an empty value. (air)
    if (value.network === 0) return;

    // Write the remaining fields of the item.
    stream.writeUint16(value.stackSize ?? 0, Endianness.Little);
    stream.writeVarInt(value.metadata ?? 0);
    stream.writeZigZag(value.networkBlockId ?? 0);

    // Check if the item has extra data.
    // If it does, we need to first create a new stream,
    // And then write the extra data to the stream.
    // We then write the length of the stream to the main stream, and then write the stream.
    if (value.extras) {
      // Create a new stream for the extra data.
      const extras = new BinaryStream();

      // Write the extra data to the stream.
      ItemInstanceUserData.write(
        extras,
        value.extras,
        Endianness.Little,
        value.network
      );

      // Write the length of the extra data to the main stream.
      stream.writeVarInt(extras.binary.length);

      // Write the extra data to the main stream.
      stream.write(extras.binary);
    } else {
      // Write 0 to the main stream, since there is no extra data.
      stream.writeVarInt(0);
    }
  }
}

export { NetworkItemInstanceDescriptor };
