import { Long } from "@serenityjs/binaryutils";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { BasePacket } from "./base";

/**
 * Represents an connected ping packet.
 */
@Proto(Packet.ConnectedPing)
class ConnectedPing extends BasePacket {
	/**
	 * The timestamp of the ping.
	 */
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPing };
