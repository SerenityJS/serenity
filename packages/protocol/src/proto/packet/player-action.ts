import { VarLong, ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { ActionIds, Packet } from "../../enums";
import { BlockCoordinates } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerAction)
class PlayerAction extends DataPacket {
	@Serialize(VarLong) public entityRuntimeId!: bigint;
	@Serialize(ZigZag) public action!: ActionIds;
	@Serialize(BlockCoordinates) public blockPosition!: BlockCoordinates;
	@Serialize(BlockCoordinates) public resultPosition!: BlockCoordinates;
	@Serialize(ZigZag) public face!: number;
}

export { PlayerAction };
