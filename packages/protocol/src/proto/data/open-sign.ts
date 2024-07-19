import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { BlockCoordinates } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.OpenSign)
class OpenSignPacket extends DataPacket {
	@Serialize(BlockCoordinates)
	public position!: BlockCoordinates;

	@Serialize(Bool)
	public isFrontSide!: boolean;
}

export { OpenSignPacket };
