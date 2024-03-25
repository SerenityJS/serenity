import { Int8, Bool } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ContainerId } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerClose)
class ContainerClosePacket extends DataPacket {
	@Serialize(Int8) public containerId!: ContainerId;
	@Serialize(Bool) public serverInitiated!: boolean;
}

export { ContainerClosePacket };
