import { Int8, VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ContainerId, ContainerType } from "../../enums";
import { BlockCoordinates } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerOpen)
class ContainerOpenPacket extends DataPacket {
	@Serialize(Int8) public identifier!: ContainerId;
	@Serialize(Int8) public type!: ContainerType;
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(VarLong) public uniqueId!: bigint;
}

export { ContainerOpenPacket };
