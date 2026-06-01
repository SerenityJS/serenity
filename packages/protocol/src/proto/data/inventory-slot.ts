import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ContainerId } from "../../enums";
import { FullContainerName, NetworkItemStackDescriptorCereal } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventorySlot)
class InventorySlotPacket extends DataPacket {
  @Serialize(VarInt) public containerId!: ContainerId;
  @Serialize(VarInt) public slot!: number;

  @Serialize(FullContainerName, { optional: true })
  public fullContainerName?: FullContainerName;

  @Serialize(NetworkItemStackDescriptorCereal, { optional: true })
  public storageItem?: NetworkItemStackDescriptorCereal;

  @Serialize(NetworkItemStackDescriptorCereal)
  public item?: NetworkItemStackDescriptorCereal;
}

export { InventorySlotPacket };
