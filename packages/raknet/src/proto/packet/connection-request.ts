import { Long } from "@serenityjs/binaryutils";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { BasePacket } from "./base";

/**
 * Represents an connection request packet.
 */
@Proto(Packet.ConnectionRequest)
class ConnectionRequest extends BasePacket {
	/**
	 * The client guid of the request.
	 */
	@Serialize(Long) public client!: bigint;

	/**
	 * The timestamp of the request.
	 */
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectionRequest };
