import { Int8, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ContainerId, type ContainerType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ContainerClose)
class ContainerClosePacket extends DataPacket {
  @Serialize(Int8) public identifier!: ContainerId;
  @Serialize(Int8) public type!: ContainerType;
  @Serialize(Bool) public serverInitiated!: boolean;
}

export { ContainerClosePacket };
