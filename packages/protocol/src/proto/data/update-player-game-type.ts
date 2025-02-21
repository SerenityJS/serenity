import { VarLong, ZigZag, ZigZong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { Packet } from "../../enums";
import { DataPacket } from "./data-packet";

@Proto(Packet.UpdatePlayerGameType)
export class UpdatePlayerGameTypePacket extends DataPacket {
	@Serialize(ZigZag) public gameType!: number;
	@Serialize(ZigZong) public uniqueId!: bigint;
	@Serialize(VarLong) public playerGamemode!: bigint;
}