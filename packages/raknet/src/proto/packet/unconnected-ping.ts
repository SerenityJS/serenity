import { Long } from "@serenityjs/binaryutils";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Magic } from "../data";

import { BasePacket } from "./base";

/**
 * Represents an unconnected ping packet.
 */
@Proto(Packet.UnconnectedPing)
class UnconnectedPing extends BasePacket {
	/**
	 * The timestamp of the ping.
	 */
	@Serialize(Long) public timestamp!: bigint;

	/**
	 * The magic bytes of the ping.
	 */
	@Serialize(Magic) public magic!: Buffer;

	/**
	 * The client guid of the ping.
	 */
	@Serialize(Long) public client!: bigint;
}

export { UnconnectedPing };
