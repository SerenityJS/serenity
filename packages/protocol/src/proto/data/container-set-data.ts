import { Int8, ZigZag } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { type ContainerDataType, type ContainerId, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerSetData)
class ContainerSetDataPacket extends DataPacket {
  @Serialize(Int8) public containerId!: ContainerId;
  @Serialize(ZigZag) public type!: ContainerDataType;
  @Serialize(ZigZag) public value!: number;
}

export { ContainerSetDataPacket };
