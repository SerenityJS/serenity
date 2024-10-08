import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ContainerId } from "../../enums";
import { FullContainerName, NetworkItemStackDescriptor } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventorySlot)
class InventorySlotPacket extends DataPacket {
  @Serialize(VarInt) public containerId!: ContainerId;
  @Serialize(VarInt) public slot!: number;
  @Serialize(FullContainerName) public fullContainerName!: FullContainerName;
  @Serialize(VarInt) public dynamicContainerSize!: number;
  @Serialize(NetworkItemStackDescriptor)
  public item!: NetworkItemStackDescriptor;
}

export { InventorySlotPacket };
