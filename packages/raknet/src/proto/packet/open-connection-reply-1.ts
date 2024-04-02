import { Long, Bool, Short } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Magic } from "../data";

import { BasePacket } from "./base";

/**
 * Represents an open connection reply 1 packet.
 */
@Proto(Packet.OpenConnectionReply1)
class OpenConnectionReply1 extends BasePacket {
	/**
	 * The magic bytes of the reply.
	 */
	@Serialize(Magic) public magic!: Buffer;

	/**
	 * The server guid of the reply.
	 */
	@Serialize(Long) public guid!: bigint;

	/**
	 * If raknet is using security.
	 */
	@Serialize(Bool) public security!: boolean;

	/**
	 * The maximum transfer unit of the reply.
	 */
	@Serialize(Short) public mtu!: number;
}

export { OpenConnectionReply1 };
