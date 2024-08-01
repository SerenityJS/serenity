import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, ZigZag } from "@serenityjs/binarystream";

import { ContainerDataType, ContainerId, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerSetData)
class ContainerSetDataPacket extends DataPacket {
	@Serialize(Uint8) public containerId!: ContainerId;
	@Serialize(ZigZag) public type!: ContainerDataType;
	@Serialize(ZigZag) public value!: number;
}

export { ContainerSetDataPacket };
