import { BinaryStream, Uint8 } from "@serenityjs/binaryutils";

import { ValidTypes } from "../../types";

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
	public static id_type: ValidTypes = Uint8;

	/**
	 * Flushes the binary stream.
	 */
	public flush(): void {
		this.binary = [];
	}

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
	public getIdType(): ValidTypes {
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
