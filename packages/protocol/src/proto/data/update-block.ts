import { VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import {
	Packet,
	UpdateBlockFlagsType,
	UpdateBlockLayerType
} from "../../enums";
import { BlockCoordinates } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateBlock)
class UpdateBlockPacket extends DataPacket {
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(VarInt) public blockRuntimeId!: number;
	@Serialize(VarInt) public flags!: UpdateBlockFlagsType;
	@Serialize(VarInt) public layer!: UpdateBlockLayerType;
}

export { UpdateBlockPacket };
