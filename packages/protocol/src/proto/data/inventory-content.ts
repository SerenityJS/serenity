import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ContainerId } from "../../enums";
import {
  FullContainerName,
  ItemStacks,
  NetworkItemStackDescriptor
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventoryContent)
class InventoryContentPacket extends DataPacket {
  @Serialize(VarInt) public containerId!: ContainerId;
  @Serialize(ItemStacks) public items!: Array<NetworkItemStackDescriptor>;
  @Serialize(FullContainerName) public fullContainerName!: FullContainerName;
  @Serialize(NetworkItemStackDescriptor)
  public storageItem!: NetworkItemStackDescriptor;
}

export { InventoryContentPacket };
