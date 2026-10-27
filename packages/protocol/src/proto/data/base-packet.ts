import { BinaryStream, Uint8, type DataType } from "@serenityjs/binarystream";

/**
 * Represents a packet.
 */
abstract class BasePacket extends BinaryStream {
  /**
   * The packet id.
   */
  public static id: number;

  /**
   * The packet id data type.
   */
  public static id_type: typeof DataType = Uint8;

  /**
   * Gets the packet id.
   * @returns The packet id.
   */
  public getId(): number {
    throw new Error("BasePacket.getId() is not implemented.");
  }

  /**
   * Gets the packet id data type.
   * @returns The packet id data type.
   */
  public getIdType(): typeof DataType {
    throw new Error("BasePacket.getIdType() is not implemented.");
  }

  /**
   * Serializes the packet.
   * @returns The serialized packet.
   */
  public serialize(): Buffer {
    throw new Error("BasePacket.serialize() is not implemented.");
  }

  /**
   * Deserializes the packet.
   */
  public deserialize(): this {
    throw new Error("BasePacket.deserialize() is not implemented.");
  }
}

export { BasePacket };
