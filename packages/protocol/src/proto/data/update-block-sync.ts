import { Serialize, Proto } from "@serenityjs/raknet";
import { VarInt, ZigZong } from "@serenityjs/binarystream";
import { Packet, UpdateBlockFlagsType, UpdateBlockLayerType } from "../../enums";
import { DataPacket } from "./data-packet";
import { BlockPosition } from "../types";

@Proto(Packet.UpdateBlockSync)
class UpdateBlockSyncPacket extends DataPacket {
	@Serialize(BlockPosition) public position!: BlockPosition;
	@Serialize(VarInt) public blockRuntimeId!: number;
	@Serialize(VarInt) public flags!: UpdateBlockFlagsType;
	@Serialize(VarInt) public layer!: UpdateBlockLayerType;
	@Serialize(ZigZong) public entityUniqueId!: bigint;
	@Serialize(VarInt) public type!: number;
}

export { UpdateBlockSyncPacket };