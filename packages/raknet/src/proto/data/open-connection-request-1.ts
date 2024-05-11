import { Uint8 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { MTU, Magic } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an open connection request 1 packet.
 */
@Proto(Packet.OpenConnectionRequest1)
class OpenConnectionRequest1 extends BasePacket {
	/**
	 * The magic bytes of the request.
	 */
	@Serialize(Magic) public magic!: Buffer;

	/**
	 * The protocol version of the request.
	 */
	@Serialize(Uint8) public protocol!: number;

	/**
	 * The maximum transfer unit of the request.
	 */
	@Serialize(MTU) public mtu!: number;
}

export { OpenConnectionRequest1 };
