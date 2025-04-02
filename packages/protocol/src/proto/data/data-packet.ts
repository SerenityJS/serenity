import { BasePacket } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binarystream";

import type { Packet } from "../../enums";

/**
 * Represents a Minecraft Bedrock Edition data packet
 */
class DataPacket extends BasePacket {
  public static readonly id: Packet;

  public static readonly id_type = VarInt;

  /**
   * The packet identifier for this packet.
   */
  public readonly _id_: Packet = (this.constructor as typeof DataPacket).id;

  public serialize(): Buffer {
    throw new Error("DataPacket.serialize() is not implemented");
  }

  public deserialize(): this {
    throw new Error("DataPacket.deserialize() is not implemented");
  }

  public static fromJson(object: Partial<DataPacket>): DataPacket {
    // Create a new instance of the packet
    const packet = new this();

    // Assign the properties from the object to the instance
    Object.assign(packet, object);

    // Return the instance
    return packet;
  }

  public static toJson(packet: DataPacket): Partial<DataPacket> {
    // Create a new object
    const object: Partial<DataPacket> = {};

    // Assign the properties from the instance to the object
    Object.assign(object, packet);

    // Return the object
    return object;
  }
}

export { DataPacket };
