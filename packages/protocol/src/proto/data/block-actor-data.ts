import { Proto, Serialize } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";
import { BlockCoordinates } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BlockActorData)
class BlockActorDataPacket extends DataPacket {
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(CompoundTag, true) public nbt!: CompoundTag<unknown>;
}

export { BlockActorDataPacket };
