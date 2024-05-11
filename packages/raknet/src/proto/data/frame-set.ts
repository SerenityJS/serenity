import { Endianness, Uint24 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Frame } from "../types";

import { BasePacket } from "./base";

/**
 * Represents a frame set packet.
 * This packet hold multiple frames.
 */
@Proto(Packet.FrameSet)
class FrameSet extends BasePacket {
	/**
	 * The sequence of the frame set.
	 */
	@Serialize(Uint24, Endianness.Little) public sequence!: number;

	/**
	 * The frames of the frame set.
	 */
	@Serialize(Frame) public frames!: Array<Frame>;
}

export { FrameSet };
