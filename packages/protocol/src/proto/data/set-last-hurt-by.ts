import { DataPacket } from "../..";
import { VarInt } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";
import { Packet } from "../../enums";

@Proto(Packet.SetLastHurtBy)
export class SetLastHurtByPacket extends DataPacket {
	@Serialize(VarInt) public lastHurtBy!: number;
}
