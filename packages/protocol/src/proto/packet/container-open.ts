import { Int8, ZigZong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, WindowsIds, WindowsTypes } from "../../enums";
import { BlockCoordinates } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerOpen)
class ContainerOpen extends DataPacket {
	@Serialize(Int8) public windowId!: WindowsIds;
	@Serialize(Int8) public windowType!: WindowsTypes;
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(ZigZong) public targetRuntimeEntityId!: bigint;
}

export { ContainerOpen };
