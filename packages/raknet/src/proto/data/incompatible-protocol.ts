import { Uint8, Uint64 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Magic } from "../types";

import { BasePacket } from "./base";

/**
 * Represents an open connection reply 1 packet.
 */
@Proto(Packet.IncompatibleProtocolVersion)
class IncompatibleProtocolVersion extends BasePacket {
	@Serialize(Uint8) public protocol!: number;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Uint64) public guid!: bigint;
}

export { IncompatibleProtocolVersion };
