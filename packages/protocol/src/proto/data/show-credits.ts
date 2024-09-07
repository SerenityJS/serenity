import { Proto, Serialize } from "@serenityjs/raknet";
import { Byte, VarLong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ShowCredits)
class ShowCreditsPacket extends DataPacket {
	@Serialize(VarLong)
	public playerRuntimeId!: bigint;

	@Serialize(Byte)
	public creditsState!: number;
}

export { ShowCreditsPacket };
