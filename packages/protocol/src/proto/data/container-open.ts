import { Int8, ZigZong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ContainerId, ContainerType } from "../../enums";
import { BlockCoordinates } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerOpen)
class ContainerOpenPacket extends DataPacket {
	@Serialize(Int8) public containerId!: ContainerId;
	@Serialize(Int8) public containerType!: ContainerType;
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(ZigZong) public targetRuntimeEntityId!: bigint;
}

export { ContainerOpenPacket };
