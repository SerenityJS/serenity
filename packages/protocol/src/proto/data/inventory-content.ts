import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ContainerId } from "../../enums";
import {
  FullContainerName,
  NetworkItemStackDescriptorCereal,
  TypeArray
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventoryContent)
class InventoryContentPacket extends DataPacket {
  @Serialize(VarInt) public containerId!: ContainerId;

  @Serialize(TypeArray(NetworkItemStackDescriptorCereal, VarInt))
  public items!: Array<NetworkItemStackDescriptorCereal>;

  @Serialize(FullContainerName) public fullContainerName!: FullContainerName;

  @Serialize(NetworkItemStackDescriptorCereal)
  public storageItem!: NetworkItemStackDescriptorCereal;
}

export { InventoryContentPacket };
