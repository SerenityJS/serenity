import { BasePacket } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binaryutils";

import { Packet } from "../../enums";

/**
 * Represents a Minecraft Bedrock Edition data packet
 */
abstract class DataPacket extends BasePacket {
	public static readonly id: Packet;

	public static readonly id_type = VarInt;

	public serialize(): Buffer {
		throw new Error("DataPacket.serialize() is not implemented");
	}

	public deserialize(): this {
		throw new Error("DataPacket.deserialize() is not implemented");
	}
}

export { DataPacket };
