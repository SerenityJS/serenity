import { Long } from "@serenityjs/binaryutils";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { BasePacket } from "./base";

/**
 * Represents an connected pong packet.
 */
@Proto(Packet.ConnectedPong)
class ConnectedPong extends BasePacket {
	/**
	 * The timestamp of the ping.
	 */
	@Serialize(Long) public pingTimestamp!: bigint;

	/**
	 * The timestamp of the pong.
	 */
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPong };
