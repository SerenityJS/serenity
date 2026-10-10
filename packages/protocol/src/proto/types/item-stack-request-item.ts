import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

/**
 * Represents an item as it is written in item stack requests (since v2168).
 * Items are referenced by name; the user data is kept as raw bytes.
 */
class ItemStackRequestItem extends DataType {
  /**
   * The identifier of the item, or null if the item is empty.
   */
  public readonly identifier: string | null;

  /**
   * The aux value (metadata) of the item.
   */
  public readonly metadata: number;

  /**
   * The stack size of the item.
   */
  public readonly stackSize: number;

  /**
   * The network block id of the item.
   */
  public readonly networkBlockId: number;

  /**
   * The raw user data of the item.
   */
  public readonly userData: Buffer;

  public constructor(
    identifier: string | null,
    metadata = 0,
    stackSize = 0,
    networkBlockId = 0,
    userData: Buffer = Buffer.alloc(0)
  ) {
    super();
    this.identifier = identifier;
    this.metadata = metadata;
    this.stackSize = stackSize;
    this.networkBlockId = networkBlockId;
    this.userData = userData;
  }

  public static read(stream: BinaryStream): ItemStackRequestItem {
    // Read the descriptor variant (0 is empty, 1 has an item), and the legacy variant byte
    const variant = stream.readVarInt();
    stream.readUint8();

    // Read the identifier and aux value if the item is not empty
    const identifier = variant === 1 ? stream.readVarString() : null;
    const metadata = variant === 1 ? stream.readZigZag() : 0;

    // Read the stack size and the network block id
    const stackSize = stream.readInt16(Endianness.Little);
    const networkBlockId = stream.readVarInt() | 0;

    // Read the raw user data
    const userData = Buffer.from(stream.read(stream.readVarInt()));

    return new this(identifier, metadata, stackSize, networkBlockId, userData);
  }

  public static write(stream: BinaryStream, value: ItemStackRequestItem): void {
    // Write the descriptor variant and the legacy variant byte
    const variant = value.identifier === null ? 0 : 1;
    stream.writeVarInt(variant);
    stream.writeUint8(variant);

    // Write the identifier and aux value if the item is not empty
    if (value.identifier !== null) {
      stream.writeVarString(value.identifier);
      stream.writeZigZag(value.metadata);
    }

    // Write the stack size and the network block id
    stream.writeInt16(value.stackSize, Endianness.Little);
    stream.writeVarInt(value.networkBlockId >>> 0);

    // Write the raw user data
    stream.writeVarInt(value.userData.length);
    stream.write(value.userData);
  }
}

export { ItemStackRequestItem };
